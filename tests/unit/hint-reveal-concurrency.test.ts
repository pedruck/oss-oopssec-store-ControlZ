/**
 * Two "Reveal hint" requests for the same active challenge can both pick the
 * same next hint. The unique index on `revealed_hints.hintId` rejects the
 * second insert; that is a conflict the player can resolve by refreshing, not
 * a server error.
 */

const flagFindMany = jest.fn();
const foundFlagFindMany = jest.fn();
const hintFindMany = jest.fn();
const revealedHintCreate = jest.fn();

jest.mock("../../lib/prisma", () => ({
  prisma: {
    flag: { findMany: (...args: unknown[]) => flagFindMany(...args) },
    foundFlag: { findMany: (...args: unknown[]) => foundFlagFindMany(...args) },
    hint: { findMany: (...args: unknown[]) => hintFindMany(...args) },
    revealedHint: {
      create: (...args: unknown[]) => revealedHintCreate(...args),
    },
  },
}));

jest.mock("../../lib/logger", () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { POST } from "../../app/api/hints/reveal/route";

// The generated client cannot load under Jest, so this mirrors the shape of
// its PrismaClientKnownRequestError: the code is what the route can rely on.
const uniqueViolation = () =>
  Object.assign(
    new Error("Unique constraint failed on the fields: (`hintId`)"),
    { code: "P2002" }
  );

describe("POST /api/hints/reveal with concurrent requests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    flagFindMany.mockResolvedValue([
      { id: "flag-1", slug: "some-challenge", difficulty: "EASY" },
    ]);
    foundFlagFindMany.mockResolvedValue([]);
    hintFindMany.mockResolvedValue([
      { id: "hint-1", level: 1, content: "First hint", revealedHint: null },
      { id: "hint-2", level: 2, content: "Second hint", revealedHint: null },
    ]);
  });

  it("answers 409 when another request revealed the same hint first", async () => {
    revealedHintCreate.mockRejectedValueOnce(uniqueViolation());

    const response = await POST();

    expect(response.status).toBe(409);
    expect((await response.json()).error).toMatch(/already been revealed/);
  });

  it("still answers 500 for any other database error", async () => {
    revealedHintCreate.mockRejectedValueOnce(new Error("database is locked"));

    const response = await POST();

    expect(response.status).toBe(500);
  });
});
