import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Solo Super Admin" }, { status: 403 });
  }

  try {
    const { modelId } = await request.json();
    const model = await prisma.aIModel.findUnique({ where: { id: modelId } });
    if (!model) return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });

    const testPrompt = "Responde exactamente con el texto 'OK' y nada más.";
    const start = Date.now();

    if (model.provider === "google") {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(model.apiKey);
      const gm = genAI.getGenerativeModel({ model: model.modelId });
      const result = await gm.generateContent([{ text: testPrompt }]);
      const text = result.response.text();
      return NextResponse.json({ success: true, response: text.trim(), latency: `${Date.now() - start}ms`, model: model.name });
    }

    // OpenAI-compatible (OpenAI, DeepSeek, Anthropic, Custom)
    const baseUrl = model.baseUrl || "https://api.openai.com/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${model.apiKey}` },
      body: JSON.stringify({
        model: model.modelId,
        messages: [{ role: "user", content: testPrompt }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: `${res.status}: ${err.slice(0, 200)}`, latency: `${Date.now() - start}ms` }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, response: data.choices?.[0]?.message?.content?.trim() || "OK", latency: `${Date.now() - start}ms`, model: model.name });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Error desconocido" }, { status: 200 });
  }
}
