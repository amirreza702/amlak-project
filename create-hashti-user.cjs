const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcrypt");

let rawInput = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { rawInput += chunk; });

process.stdin.on("end", async () => {
  let prisma;
  try {
    const payload = JSON.parse(Buffer.from(rawInput.trim(), "base64").toString("utf8"));
    const mobile = String(payload.mobile || "").trim();
    const firstName = String(payload.firstName || "").trim();
    const lastName = String(payload.lastName || "").trim();
    const password = String(payload.password || "");

    if (!/^09\d{9}$/.test(mobile)) throw new Error("Mobile number must be 11 digits and start with 09.");
    if (!firstName || !lastName) throw new Error("First name and last name are required.");
    if (password.length < 8) throw new Error("Password must contain at least 8 characters.");

    prisma = new PrismaClient();
    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { mobile },
        select: { id: true, role: true },
      });
      if (existingUser) {
        throw new Error(existingUser.role === "HASHTI"
          ? "HASHTI_USER_ALREADY_EXISTS_NO_CHANGES"
          : `MOBILE_ALREADY_USED_BY_ROLE_${existingUser.role}`);
      }

      const existingStaff = await tx.hashtiStaff.findUnique({
        where: { mobile },
        select: { id: true },
      });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await tx.user.create({
        data: { mobile, passwordHash, role: UserRole.HASHTI, isActive: true },
        select: { id: true, mobile: true, role: true, isActive: true, createdAt: true },
      });

      let staffCreated = false;
      if (!existingStaff) {
        await tx.hashtiStaff.create({
          data: { firstName, lastName, mobile, isActive: true },
        });
        staffCreated = true;
      }
      return { user, staffCreated };
    });

    console.log("HASHTI_USER_CREATED");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("CREATE_HASHTI_USER_FAILED:", error.message || error);
    process.exitCode = 1;
  } finally {
    rawInput = "";
    if (prisma) await prisma.$disconnect();
  }
});
