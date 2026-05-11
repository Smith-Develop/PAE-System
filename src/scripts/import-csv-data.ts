import fs from "fs";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(process.cwd(), "Reporte de Proveeduriaycompraspublicas_2026PINTADA (1).csv");
  const csvFile = fs.readFileSync(csvFilePath, "utf8");

  console.log("Parsing CSV...");

  const results = Papa.parse(csvFile, {
    delimiter: ";",
    skipEmptyLines: true,
  });

  const dataRows = results.data.slice(18) as string[][]; // Data starts at line 19 (index 18)

  console.log(`Found ${dataRows.length} rows of data.`);

  for (const row of dataRows) {
    if (row.length < 30) continue;

    // Operator Data
    const operatorName = row[0]?.trim();
    const operatorNit = row[1]?.trim();
    const modeloAtencion = row[2]?.trim();
    const modalidadAtencion = row[3]?.trim();
    const direccionBodega = row[4]?.trim();
    const municipioBodega = row[5]?.trim();
    const contactoBodega = row[6]?.trim();
    const telefonoBodega = row[7]?.trim();

    if (!operatorNit) continue;

    const operator = await prisma.operator.upsert({
      where: { nitOperador: operatorNit },
      update: {
        nombreOperador: operatorName,
        modeloAtencion,
        modalidadAtencion,
        direccionBodega,
        municipioBodega,
        contactoBodega,
        telefonoBodega,
      },
      create: {
        nombreOperador: operatorName,
        nitOperador: operatorNit,
        modeloAtencion,
        modalidadAtencion,
        direccionBodega,
        municipioBodega,
        contactoBodega,
        telefonoBodega,
      },
    });

    // Provider Data
    const providerRazonSocial = row[8]?.trim();
    const providerCodigoInscripcion = row[9]?.trim();
    const providerNit = row[10]?.trim().replace(/\s+/g, ""); // Remove spaces in NIT
    const providerRepresentanteLegal = row[11]?.trim();
    const providerMunicipio = row[12]?.trim();
    const providerDireccion = row[13]?.trim();
    const providerTelefono = row[14]?.trim();
    const providerCorreo = row[15]?.trim();
    const providerTipoActividad = row[16]?.trim();
    const providerCompraLocal = row[17]?.toLowerCase().includes("si");
    const providerFechaVisita = row[22]?.trim();
    const providerConceptoSanitario = row[23]?.trim();
    const providerEntidadEmisora = row[24]?.trim();

    if (!providerNit || !providerRazonSocial) continue;

    const provider = await prisma.provider.upsert({
      where: { nit: providerNit },
      update: {
        razonSocial: providerRazonSocial,
        codigoInscripcion: providerCodigoInscripcion,
        representanteLegal: providerRepresentanteLegal,
        municipio: providerMunicipio,
        direccionEstablecimiento: providerDireccion,
        telefono: providerTelefono,
        correo: providerCorreo,
        tipoActividad: providerTipoActividad,
        compraLocal: providerCompraLocal,
        fechaVisita: providerFechaVisita,
        conceptoSanitario: providerConceptoSanitario,
        entidadEmisora: providerEntidadEmisora,
      },
      create: {
        razonSocial: providerRazonSocial,
        nit: providerNit,
        codigoInscripcion: providerCodigoInscripcion,
        representanteLegal: providerRepresentanteLegal,
        municipio: providerMunicipio,
        direccionEstablecimiento: providerDireccion,
        telefono: providerTelefono,
        correo: providerCorreo,
        tipoActividad: providerTipoActividad,
        compraLocal: providerCompraLocal,
        fechaVisita: providerFechaVisita,
        conceptoSanitario: providerConceptoSanitario,
        entidadEmisora: providerEntidadEmisora,
      },
    });

    // Food Group
    const foodGroupName = row[18]?.trim();
    if (!foodGroupName) continue;

    const foodGroup = await prisma.foodGroup.upsert({
      where: { name: foodGroupName },
      update: {},
      create: { name: foodGroupName },
    });

    // Product Data
    const alimento = row[19]?.trim();
    const descripcionMarca = row[20]?.trim();
    const registroSanitario = row[21]?.trim();
    const unidadMedida = row[28]?.trim(); // "Kilogramos, Litros o Unidades"

    if (!alimento) continue;

    // 1. Upsert MasterProduct (Generic)
    const masterProduct = await prisma.masterProduct.upsert({
      where: { nombre: alimento },
      update: {
        unidadMedida,
        foodGroupId: foodGroup.id,
      },
      create: {
        nombre: alimento,
        unidadMedida,
        foodGroupId: foodGroup.id,
      },
    });

    // 2. Upsert Product Variant (Provider specific)
    await prisma.product.upsert({
      where: {
        masterProductId_providerId_descripcionMarca: {
          masterProductId: masterProduct.id,
          providerId: provider.id,
          descripcionMarca,
        },
      },
      update: {
        registroSanitario,
      },
      create: {
        masterProductId: masterProduct.id,
        providerId: provider.id,
        descripcionMarca,
        registroSanitario,
      },
    });
  }

  console.log("Import completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
