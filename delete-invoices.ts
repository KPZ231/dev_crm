import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM "Document" WHERE "type"::text = 'INVOICE'`);
  await prisma.$executeRawUnsafe(`DELETE FROM "DocumentTemplate" WHERE "type"::text = 'INVOICE'`);
  console.log("Deleted INVOICE documents and templates using raw SQL");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
