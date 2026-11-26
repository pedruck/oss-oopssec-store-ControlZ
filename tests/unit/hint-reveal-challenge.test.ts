/**
 * A reveal always targets the challenge that is active when the request
 * arrives, which may no longer be the one an open hint panel shows. The
 * response has to say which challenge the hint belongs to, or the panel lists
 * it under the wrong title.
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

describe("POST /api/hints/reveal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    flagFindMany.mockResolvedValue([
      { id: "flag-1", slug: "active-challenge", difficulty: "EASY" },
      { id: "flag-2", slug: "already-solved", difficulty: "EASY" },
    ]);
    foundFlagFindMany.mockResolvedValue([{ flagId: "flag-2" }]);
    hintFindMany.mockResolvedValue([
      { id: "hint-1", level: 1, content: "First hint", revealedHint: null },
    ]);
    revealedHintCreate.mockResolvedValue({ id: "revealed-1" });
  });

  it("names the challenge the revealed hint belongs to", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      slug: "active-challenge",
      hint: { level: 1, content: "First hint" },
    });
  });
});
