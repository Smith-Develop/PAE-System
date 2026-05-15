import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SCAN_PROMPT = `Extrae todos los productos de esta factura colombiana.
Para cada producto, devuelve EXACTAMENTE un array JSON con este formato:
{
  "items": [
    { "nombre": "nombre del producto", "cantidad": numero, "precioUnitario": numero }
  ]
}
Solo productos con cantidades mayores a 0. Ignora totales, impuestos y encabezados.
Devuelve SOLO el JSON, sin explicaciones ni markdown.`;

async function scanWithGoogle(apiKey: string, modelId: string, imageBase64: string, mimeType: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });
  const result = await model.generateContent([SCAN_PROMPT, { inlineData: { mimeType, data: imageBase64 } }]);
  return result.response.text();
}

async function scanWithOpenAI(apiKey: string, modelId: string, baseUrl: string | null, imageBase64: string, mimeType: string) {
  const url = `${baseUrl || "https://api.openai.com/v1"}/chat/completions`;
  const imgUrl = "data:" + mimeType + ";base64," + imageBase64;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: modelId,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: SCAN_PROMPT },
          { type: "image_url", image_url: { url: imgUrl, detail: "high" } },
        ],
      }],
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("API error (" + res.status + "): " + err.slice(0, 150));
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const aiModel = await prisma.aIModel.findFirst({ where: { isDefault: true, active: true } });
  if (!aiModel) {
    return NextResponse.json({ error: "No hay modelo IA configurado. Ve a Panel Super Admin → Modelos IA." }, { status: 501 });
  }

  if (session.user.role !== "SUPER_ADMIN" && session.user.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } });
    if (tenant) {
      const now = new Date();
      const resetDate = new Date(tenant.aiScansReset);
      if (resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
        await prisma.tenant.update({ where: { id: tenant.id }, data: { aiScansUsed: 0, aiScansReset: now } });
        tenant.aiScansUsed = 0;
      }
      if (tenant.aiScansUsed >= tenant.aiScansLimit) {
        return NextResponse.json({ error: "Limite de escaneos IA alcanzado este mes" }, { status: 403 });
      }
    }
  }

  try {
    const body = await request.json();
    const { image } = body;
    if (!image) return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });

    const isPdf = image.startsWith("data:application/pdf");
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "").replace(/^data:application\/pdf;base64,/, "");
    const mimeType = isPdf ? "application/pdf" : "image/jpeg";

    // PDF solo con Google Gemini
    if (isPdf && aiModel.provider !== "google") {
      return NextResponse.json({
        error: "El escaneo de PDF solo funciona con Google Gemini. Sube una imagen (JPG/PNG) de la factura, o cambia el modelo por defecto en Panel Super Admin.",
      }, { status: 400 });
    }

    let text: string;
    if (aiModel.provider === "google") {
      text = await scanWithGoogle(aiModel.apiKey, aiModel.modelId, base64Data, mimeType);
    } else {
      text = await scanWithOpenAI(aiModel.apiKey, aiModel.modelId, aiModel.baseUrl, base64Data, mimeType);
    }

    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanText);

    if (session.user.role !== "SUPER_ADMIN" && session.user.tenantId) {
      await prisma.tenant.update({ where: { id: session.user.tenantId }, data: { aiScansUsed: { increment: 1 } } });
    }

    return NextResponse.json({ items: parsed.items || [], model: aiModel.name });
  } catch (e: any) {
    console.error("Invoice scan error:", e);
    return NextResponse.json({ error: "Error al escanear: " + (e.message || "desconocido") }, { status: 500 });
  }
}
