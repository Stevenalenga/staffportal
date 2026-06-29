import { PrismaClient } from "../app/generated/prisma";

const db = new PrismaClient();

const assets = [
  {
    assetTag: "UTHABITI000001",
    classification: "Equipment",
    name: "Laptop",
    category: "LAPTOP" as const,
    brand: "HP",
    model: "Pavillion 15 Core i5 8gb RAM 1TB HDD",
    serialNumber: "5CD8491PZ0",
    purchaseDate: new Date("2020-08-20"),
    purchasePrice: 70000,
    supplier: "Yellow Apple Technologies",
    invoiceNumber: "11951",
    paymentReference: "Cheque #000020",
    staffInCharge: "Janeffer Muteti",
    location: "Main Office",
    status: "ASSIGNED" as const,
  },
  {
    assetTag: "UTHABITI000002",
    classification: "Equipment",
    name: "Laptop",
    category: "LAPTOP" as const,
    brand: "HP",
    model: "Pavillion 14 x360 Core i5 10th generation",
    serialNumber: "8CG93284DB",
    purchaseDate: new Date("2020-08-20"),
    purchasePrice: 70000,
    supplier: "Yellow Apple Technologies",
    invoiceNumber: "11951",
    paymentReference: "Cheque #000020",
    staffInCharge: "Amanda Temko",
    location: "Main Office",
    status: "ASSIGNED" as const,
  },
  {
    assetTag: "UTHABITI000003",
    classification: "Equipment",
    name: "Printer",
    category: "PRINTER" as const,
    brand: "Epson",
    model: "L3111",
    serialNumber: "X69026286",
    purchaseDate: new Date("2020-08-20"),
    purchasePrice: 18000,
    supplier: "Yellow Apple Technologies",
    invoiceNumber: "11951",
    paymentReference: "Cheque #000020",
    staffInCharge: "Asayya Imaya",
    location: "CEO's Office",
    status: "ASSIGNED" as const,
  },
  {
    assetTag: "UTHABITI000004",
    classification: "Equipment",
    name: "Laptop",
    category: "LAPTOP" as const,
    brand: "HP",
    model: "Notebook 15 Core i5 4gb RAM 1TB HDD",
    serialNumber: "CND9242J37",
    purchaseDate: new Date("2020-09-05"),
    purchasePrice: 50000,
    supplier: "Yellow Apple Technologies",
    invoiceNumber: "12178",
    paymentReference: "Cheque #000036",
    staffInCharge: "Noah Kipkoech",
    location: "Reception",
    status: "AVAILABLE" as const,
    notes: "Not assigned to any employee",
  },
  {
    assetTag: "UTHABITI000005",
    classification: "Equipment",
    name: "Laptop",
    category: "LAPTOP" as const,
    brand: "HP",
    model: "Notebook 15 AMD Ryzen 5 8gb RAM 256gb HDD",
    serialNumber: "CND9352KZT",
    purchaseDate: new Date("2020-10-12"),
    purchasePrice: 50000,
    supplier: "Yellow Apple Technologies",
    invoiceNumber: "12860",
    paymentReference: "Cheque #000047",
    staffInCharge: "Steven Otieno",
    location: "Main Office",
    status: "ASSIGNED" as const,
  },
  {
    assetTag: "UTHABITI000006",
    classification: "Equipment",
    name: "Mobile Phone",
    category: "MOBILE_PHONE" as const,
    brand: "TECNO",
    model: "F1",
    serialNumber: "356211117777402",
    purchaseDate: new Date("2021-01-20"),
    purchasePrice: 6500,
    supplier: "Future Link Technologies Ltd",
    invoiceNumber: "17290",
    paymentReference: "Cheque #000113",
    staffInCharge: "Vivian Chemesunde",
    location: "Reception",
    status: "RETIRED" as const,
    notes: "Not Working",
  },
  {
    assetTag: "UTHABITI000007",
    classification: "Furniture",
    name: "Sofa Set",
    category: "FURNITURE" as const,
    brand: "Stella Sofa",
    model: "3-Seater In D341W Green",
    serialNumber: "S5016D63",
    purchaseDate: new Date("2021-04-16"),
    purchasePrice: 60800,
    supplier: "Odds & Ends Ltd",
    invoiceNumber: "MBS33615",
    paymentReference: "Cheque #000142",
    staffInCharge: "",
    location: "Reception",
    status: "AVAILABLE" as const,
  },
  {
    assetTag: "UTHABITI000008",
    classification: "Furniture",
    name: "Sofa Set",
    category: "FURNITURE" as const,
    brand: "Stella Sofa",
    model: "2-Seater In D341W Green",
    serialNumber: "S5016D62",
    purchaseDate: new Date("2021-04-16"),
    purchasePrice: 47200,
    supplier: "Odds & Ends Ltd",
    invoiceNumber: "MBS33615",
    paymentReference: "Cheque #000142",
    staffInCharge: "Asayya Imaya",
    location: "CEO's Office",
    status: "ASSIGNED" as const,
  },
  {
    assetTag: "UTHABITI000009",
    classification: "Furniture",
    name: "Sofa Set",
    category: "FURNITURE" as const,
    brand: "Stella Sofa",
    model: "1-Seater In D341W Green",
    serialNumber: "S5016D61",
    purchaseDate: new Date("2021-04-16"),
    purchasePrice: 36000,
    supplier: "Odds & Ends Ltd",
    invoiceNumber: "MBS33615",
    paymentReference: "Cheque #000142",
    staffInCharge: "",
    location: "Reception",
    status: "AVAILABLE" as const,
  },
];

async function main() {
  console.log("Seeding assets...");
  let created = 0;
  let skipped = 0;

  for (const asset of assets) {
    const existing = await db.asset.findUnique({ where: { assetTag: asset.assetTag } });
    if (existing) {
      skipped++;
      continue;
    }
    await db.asset.create({
      data: {
        ...asset,
        purchasePrice: asset.purchasePrice,
      },
    });
    created++;
    console.log(`  ✓ ${asset.assetTag} — ${asset.name} (${asset.brand})`);
  }

  console.log(`\nDone. Created: ${created}, Skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
