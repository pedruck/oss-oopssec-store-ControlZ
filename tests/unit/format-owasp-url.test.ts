import { getOwaspUrl } from "../../lib/format";

describe("getOwaspUrl", () => {
  describe("black box", () => {
    it("returns the 2021 edition link for a valid 2021 code", () => {
      expect(getOwaspUrl("A01:2021")).toBe(
        "https://owasp.org/Top10/A01_2021-Broken_Access_Control/"
      );
    });

    it("returns the 2025 edition link for a valid 2025 code", () => {
      expect(getOwaspUrl("A05:2025")).toBe(
        "https://owasp.org/Top10/2025/A05_2025-Injection/"
      );
    });

    it("returns a link for the upper bound A10:2025", () => {
      expect(getOwaspUrl("A10:2025")).toMatch(
        /^https:\/\/owasp\.org\/Top10\/2025\/A10_2025-.+\/$/
      );
    });

    it("returns null above the maximum (A11:2025)", () => {
      expect(getOwaspUrl("A11:2025")).toBeNull();
    });

    it("returns null below the minimum (A00:2021)", () => {
      expect(getOwaspUrl("A00:2021")).toBeNull();
    });

    it("returns null for an unsupported year", () => {
      expect(getOwaspUrl("A01:2017")).toBeNull();
    });

    it("returns null for a lowercase code", () => {
      expect(getOwaspUrl("a01:2021")).toBeNull();
    });
  });

  describe("white box: path coverage", () => {
    it("path 1: returns null when the format is not recognized", () => {
      expect(getOwaspUrl("not-a-code")).toBeNull();
    });

    it("path 2: returns the 2025 link for a known 2025 code", () => {
      expect(getOwaspUrl("A05:2025")).toContain("/Top10/2025/A05_2025-");
    });

    it("path 3: returns null for an unknown 2025 code", () => {
      expect(getOwaspUrl("A11:2025")).toBeNull();
    });

    it("path 4: returns the 2021 link for a known 2021 code", () => {
      expect(getOwaspUrl("A01:2021")).toContain("/Top10/A01_2021-");
    });

    it("path 5: returns null for an unknown 2021 code", () => {
      expect(getOwaspUrl("A00:2021")).toBeNull();
    });
  });
});

describe("getOwaspUrl TDD: surrounding whitespace", () => {
  it("ignores surrounding whitespace", () => {
    const expected = "https://owasp.org/Top10/A01_2021-Broken_Access_Control/";
    expect(getOwaspUrl(" A01:2021 ")).toBe(expected);
    expect(getOwaspUrl("A01:2021\n")).toBe(expected);
  });
});
