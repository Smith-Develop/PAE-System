// Script para cifrar datos existentes en la BD
// Ejecutar UNA SOLA VEZ después de agregar ENCRYPTION_KEY al .env
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

function encrypt(text) {
  if (!text || !KEY || KEY.length !== 32) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function isEncrypted(val) {
  return val && val.includes(":") && val.split(":").length === 3;
}

const p = new PrismaClient();

async function migrate() {
  if (KEY.length !== 32) {
    console.error("ENCRYPTION_KEY no configurada. Agrégala al .env primero.");
    process.exit(1);
  }

  console.log("Cifrando datos existentes...\n");

  // AI Models
  const aiModels = await p.aIModel.findMany();
  for (const m of aiModels) {
    if (m.apiKey && !isEncrypted(m.apiKey)) {
      await p.aIModel.update({ where: { id: m.id }, data: { apiKey: encrypt(m.apiKey) } });
      console.log(`  AIModel: ${m.name} - apiKey cifrado`);
    }
  }

  // Users (name)
  const users = await p.user.findMany();
  for (const u of users) {
    if (u.name && !isEncrypted(u.name)) {
      await p.user.update({ where: { id: u.id }, data: { name: encrypt(u.name) } });
      console.log(`  User: ${u.email} - name cifrado`);
    }
  }

  // Providers
  const providers = await p.provider.findMany();
  for (const pv of providers) {
    let updates = {};
    if (pv.telefono && !isEncrypted(pv.telefono)) updates.telefono = encrypt(pv.telefono);
    if (pv.correo && !isEncrypted(pv.correo)) updates.correo = encrypt(pv.correo);
    if (Object.keys(updates).length > 0) {
      await p.provider.update({ where: { id: pv.id }, data: updates });
      console.log(`  Provider: ${pv.razonSocial} - campos cifrados (${Object.keys(updates).join(", ")})`);
    }
  }

  // Clients
  const clients = await p.client.findMany();
  for (const c of clients) {
    let updates = {};
    if (c.telefono && !isEncrypted(c.telefono)) updates.telefono = encrypt(c.telefono);
    if (c.correo && !isEncrypted(c.correo)) updates.correo = encrypt(c.correo);
    if (Object.keys(updates).length > 0) {
      await p.client.update({ where: { id: c.id }, data: updates });
      console.log(`  Client: ${c.nombre} - campos cifrados (${Object.keys(updates).join(", ")})`);
    }
  }

  // Operators
  const operators = await p.operator.findMany();
  for (const o of operators) {
    if (o.telefonoBodega && !isEncrypted(o.telefonoBodega)) {
      await p.operator.update({ where: { id: o.id }, data: { telefonoBodega: encrypt(o.telefonoBodega) } });
      console.log(`  Operator: ${o.nombreOperador} - telefonoBodega cifrado`);
    }
  }

  console.log("\nMigración completada.");
}

migrate().catch(console.error).finally(() => p.$disconnect());
