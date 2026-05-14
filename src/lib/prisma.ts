import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "./crypto";

const encryptableFields: Record<string, string[]> = {
  AIModel: ["apiKey"],
  User: ["name"],
  Provider: ["telefono", "correo"],
  Client: ["telefono", "correo"],
  Operator: ["telefonoBodega"],
};

function isEncrypted(val: string): boolean {
  return val.includes(":") && val.split(":").length === 3;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  const client = new PrismaClient();

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const fields = encryptableFields[model as string];
          if (!fields || !fields.length) return query(args);

          // Encrypt data on write operations
          if (["create", "update", "upsert"].includes(operation)) {
            const data = (args as any).data;
            if (data && typeof data === "object") {
              for (const field of fields) {
                if (data[field] && !isEncrypted(data[field])) {
                  data[field] = encrypt(data[field]);
                }
              }
            }
          }

          // Encrypt data on createMany
          if (operation === "createMany") {
            const dataArr = (args as any).data;
            if (Array.isArray(dataArr)) {
              for (const item of dataArr) {
                for (const field of fields) {
                  if (item[field] && !isEncrypted(item[field])) {
                    item[field] = encrypt(item[field]);
                  }
                }
              }
            }
          }

          const result = await query(args);

          // Decrypt on read
          if (result) {
            if (Array.isArray(result)) {
              for (const item of result) {
                if (item && typeof item === "object") {
                  for (const field of fields) {
                    const val = (item as any)[field];
                    if (val) (item as any)[field] = decrypt(val);
                  }
                }
              }
            } else if (typeof result === "object") {
              for (const field of fields) {
                const val = (result as any)[field];
                if (val) (result as any)[field] = decrypt(val);
              }
            }
          }

          return result;
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
