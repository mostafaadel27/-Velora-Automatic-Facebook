import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  const validTursoUrl = typeof tursoUrl === "string" && tursoUrl !== "undefined" && tursoUrl !== "null" && tursoUrl.startsWith("libsql");
  const validTursoToken = typeof tursoToken === "string" && tursoToken !== "undefined" && tursoToken !== "null" ? tursoToken : undefined;

  // If Turso env vars are set (production/Vercel), use LibSQL adapter
  if (validTursoUrl) {
    const libsql = createClient({
      url: tursoUrl!,
      authToken: validTursoToken,
    });
    // @ts-ignore - type mismatch between libsql client and prisma adapter
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Fallback to local SQLite for development
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
