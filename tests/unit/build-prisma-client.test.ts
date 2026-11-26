import { readFileSync } from "fs";
import { join } from "path";

/**
 * Updating a clone to a release that changes prisma/schema.prisma leaves the
 * generated client behind until something runs `prisma generate`. `npm install`
 * does not, and neither does `next build`: building straight after the checkout
 * fails on the stale client ("Property 'revokedHubToken' does not exist on type
 * 'PrismaClient'") and removes the previous build, so `npm start` has nothing
 * left to serve. The build has to regenerate the client itself.
 */

const scripts: Record<string, string> = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8")
).scripts;

describe("npm run build", () => {
  it("regenerates the Prisma client before compiling", () => {
    const beforeCompiling = [scripts.prebuild, scripts.build]
      .filter(Boolean)
      .join(" && ")
      .split("next build")[0];

    expect(beforeCompiling).toMatch(/prisma generate|npm run db:generate/);
  });
});
