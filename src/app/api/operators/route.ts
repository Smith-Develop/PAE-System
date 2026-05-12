import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { operatorSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

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

    const session = await auth();
    await logAction({
      userId: session?.user?.id || "",
      userEmail: session?.user?.email || "",
      userName: session?.user?.name || "",
      action: "CREATE",
      entity: "operator",
      entityId: operator.id,
      details: JSON.stringify({ nombre: operator.nombreOperador, nit: operator.nitOperador }),
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
