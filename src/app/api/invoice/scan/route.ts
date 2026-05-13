import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AI_ENABLED } from "@/lib/ai-config";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!AI_ENABLED) {
    return NextResponse.json({ error: "IA no configurada. Agrega GEMINI_API_KEY al .env" }, { status: 501 });
  }

  try {
    const { image } = await request.json();
    if (!image) return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Extrae todos los productos de esta factura colombiana.
Para cada producto, devuelve EXACTAMENTE un array JSON con este formato:
{
  "items": [
    { "nombre": "nombre del producto", "cantidad": numero, "precioUnitario": numero }
  ]
}
Solo productos con cantidades mayores a 0. Ignora totales, impuestos y encabezados.
Devuelve SOLO el JSON, sin explicaciones ni markdown.`;

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "").replace(/^data:application\/pdf;base64,/, "");
    
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: image.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg", data: base64Data } },
    ]);

    const text = result.response.text();
    // Parsear JSON de la respuesta (limpiar posibles backticks de markdown)
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanText);

    return NextResponse.json({ items: parsed.items || [] });
  } catch (e: any) {
    console.error("Invoice scan error:", e);
    return NextResponse.json({ error: "Error al escanear la factura: " + (e.message || "desconocido") }, { status: 500 });
  }
}
