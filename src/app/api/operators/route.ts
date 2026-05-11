import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { operatorSchema } from "@/lib/validations";

export async function GET() {
  try {
    const operators = await prisma.operator.findMany({
      orderBy: { nombreOperador: "asc" },
    });
    return NextResponse.json(operators);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los operadores" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = operatorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.issues },
        { status: 400 }
      );
    }

    const operator = await prisma.operator.create({
      data: result.data,
    });

    return NextResponse.json(operator, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Ya existe un operador con este NIT" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al registrar el operador" },
      { status: 500 }
    );
  }
}
