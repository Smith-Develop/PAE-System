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

// Proveedores con soporte de visión (imágenes/PDF)
const VISION_PROVIDERS = ["google", "openai"];

// Extraer texto de PDF
async function extractPdfText(pdfBase64: string): Promise<string> {
  const pdfBuffer = Buffer.from(pdfBase64, "base64");
  const pdfParse = await import("pdf-parse");
  const fn = (pdfParse as any).default || pdfParse;
  const data = await fn(pdfBuffer);
  return data.text;
}

// PDF → imagen JPEG (solo para modelos con visión que no soportan PDF nativo)
async function pdfToImage(pdfBase64: string): Promise<{ base64: string; mimeType: string }> {
  const pdfBuffer = Buffer.from(pdfBase64, "base64");
  const sharp = (await import("sharp")).default;
  const jpegBuffer = await sharp(pdfBuffer, { pages: 1, page: 0, density: 150 }).jpeg({ quality: 85 }).toBuffer();
  return { base64: jpegBuffer.toString("base64"), mimeType: "image/jpeg" };
}

// Google Gemini — soporta PDF e imágenes nativamente
async function scanWithGoogle(apiKey: string, modelId: string, base64Data: string, mimeType: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });
  const result = await model.generateContent([SCAN_PROMPT, { inlineData: { mimeType, data: base64Data } }]);
  return result.response.text();
}

// OpenAI-compatible (GPT-4o, etc.) — imágenes vía vision API
async function scanWithVision(apiKey: string, modelId: string, baseUrl: string | null, base64Data: string, mimeType: string) {
  const url = baseUrl || "https://api.openai.com/v1";
  const imgUrl = "data:" + mimeType + ";base64," + base64Data;
  const res = await fetch(url + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: [{ type: "text", text: SCAN_PROMPT }, { type: "image_url", image_url: { url: imgUrl, detail: "high" } }] }],
      max_tokens: 2000,
    }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error("API error (" + res.status + "): " + err.slice(0, 150)); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// Text-only (DeepSeek, etc.) — enviar texto extraído del PDF
async function scanWithText(apiKey: string, modelId: string, baseUrl: string | null, textContent: string) {
  const url = baseUrl || "https://api.openai.com/v1";
  const prompt = SCAN_PROMPT + "\n\nContenido extraído de la factura:\n" + textContent.slice(0, 8000);
  const res = await fetch(url + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: modelId, messages: [{ role: "user", content: prompt }], max_tokens: 2000 }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error("API error (" + res.status + "): " + err.slice(0, 150)); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const aiModel = await prisma.aIModel.findFirst({ where: { isDefault: true, active: true } });
  if (!aiModel) return NextResponse.json({ error: "No hay modelo IA configurado." }, { status: 501 });

  // Verificar límites tenant
  if (session.user.role !== "SUPER_ADMIN" && session.user.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } });
    if (tenant) {
      const now = new Date();
      const resetDate = new Date(tenant.aiScansReset);
      if (resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
        await prisma.tenant.update({ where: { id: tenant.id }, data: { aiScansUsed: 0, aiScansReset: now } });
      }
      if (tenant.aiScansUsed >= tenant.aiScansLimit) {
        return NextResponse.json({ error: "Límite de escaneos IA alcanzado este mes" }, { status: 403 });
      }
    }
  }

  try {
    const body = await request.json();
    const { image } = body;
    if (!image) return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });

    const isPdf = image.startsWith("data:application/pdf");
    const hasVision = VISION_PROVIDERS.includes(aiModel.provider);
    const rawBase64 = image.replace(/^data:image\/\w+;base64,/, "").replace(/^data:application\/pdf;base64,/, "");

    let text: string;

    if (aiModel.provider === "google") {
      // Google soporta PDF e imágenes nativamente
      const mimeType = isPdf ? "application/pdf" : "image/jpeg";
      text = await scanWithGoogle(aiModel.apiKey, aiModel.modelId, rawBase64, mimeType);

    } else if (hasVision) {
      // OpenAI/vision — convertir PDF a imagen si es necesario
      if (isPdf) {
        const converted = await pdfToImage(rawBase64);
        text = await scanWithVision(aiModel.apiKey, aiModel.modelId, aiModel.baseUrl, converted.base64, converted.mimeType);
      } else {
        text = await scanWithVision(aiModel.apiKey, aiModel.modelId, aiModel.baseUrl, rawBase64, "image/jpeg");
      }

    } else {
      // Text-only (DeepSeek, etc.)
      if (isPdf) {
        const pdfText = await extractPdfText(rawBase64);
        if (!pdfText.trim()) return NextResponse.json({ error: "No se pudo extraer texto del PDF. Sube una imagen JPG/PNG, o usa un modelo con visión." }, { status: 400 });
        text = await scanWithText(aiModel.apiKey, aiModel.modelId, aiModel.baseUrl, pdfText);
      } else {
        return NextResponse.json({
          error: "Este modelo no soporta imágenes. Sube un PDF (se extraerá el texto), o usa un modelo con visión como Gemini o GPT-4o.",
          tip: "Cambia el modelo por defecto en Panel Super Admin → Modelos IA.",
        }, { status: 400 });
      }
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
