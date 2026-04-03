import { createClient } from "@libsql/client";
import * as fs from "fs";

async function main() {
  const url = "libsql://velora-mostafaadel27.aws-eu-west-1.turso.io";
  const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzUwNzk2MTUsImlkIjoiMDE5ZDRhZmQtMjkwMS03OGEyLWI1NzctNGE1Nzg1ZTgyNDQ3IiwicmlkIjoiOGE4OWIyOWQtYzVjOS00ZjViLTliOGItMDAyZmZmY2E3YWYzIn0.iGWTrqRsHAp2rlMHBNMiYNv09DCA75n5o_ZMHXeOfLiA1UTq7ESLKjVXA940LuwCvDjMA4ewUvgUkpF3L3mjAw";
  
  console.log("Connecting to Turso:", url);
  const client = createClient({ url, authToken });
  
  const sql = fs.readFileSync("../baseline.sql", "utf-8");
  console.log("Loaded baseline.sql. Executing schema migration...");
  
  try {
    await client.executeMultiple(sql);
    console.log("✅ Successfully applied Prisma schema to Turso Database!");
  } catch (error) {
    console.error("❌ Failed to apply SQL:", error);
  }
}

main();
