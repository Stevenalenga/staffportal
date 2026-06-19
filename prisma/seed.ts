import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "info@uthabitiafrica.org";
  const plainPassword = "Uth@b1t1Adm!n#2026";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin account already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const admin = await db.user.create({
    data: {
      email,
      name: "Uthabiti Africa",
      employeeId: "UA-001",
      role: "IT_ADMIN",
      employmentStatus: "ACTIVE",
      password: hashedPassword,
    },
  });

  console.log(`✓ Administrator account created`);
  console.log(`  Email   : ${admin.email}`);
  console.log(`  Password: ${plainPassword}`);
  console.log(`  Role    : ${admin.role}`);
  console.log(`\n  ⚠  Store this password securely — it will not be shown again.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
