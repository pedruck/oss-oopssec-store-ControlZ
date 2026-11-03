import { getCweUrl } from "@/lib/format";

describe("getCweUrl", () => {
  describe("black box", () => {
    it("returns the MITRE link for an uppercase CWE id", () => {
      expect(getCweUrl("CWE-79")).toBe(
        "https://cwe.mitre.org/data/definitions/79.html"
      );
    });

    it("accepts a lowercase prefix", () => {
      expect(getCweUrl("cwe-79")).toBe(
        "https://cwe.mitre.org/data/definitions/79.html"
      );
    });

    it("accepts a single-digit number", () => {
      expect(getCweUrl("CWE-1")).toBe(
        "https://cwe.mitre.org/data/definitions/1.html"
      );
    });

    it("returns null when the number is missing", () => {
      expect(getCweUrl("CWE-")).toBeNull();
    });

    it("returns null with surrounding whitespace", () => {
      expect(getCweUrl(" CWE-79")).toBeNull();
      expect(getCweUrl("CWE-79 ")).toBeNull();
    });

    it("returns null without the CWE prefix", () => {
      expect(getCweUrl("79")).toBeNull();
      expect(getCweUrl("CVE-79")).toBeNull();
    });

    it("returns null when the number has non-digit characters", () => {
      expect(getCweUrl("CWE-7a")).toBeNull();
    });
  });

  describe("white box: branch coverage", () => {
    it("branch 1: returns null when the pattern does not match", () => {
      expect(getCweUrl("not-a-cwe")).toBeNull();
    });

    it("branch 2: builds the link from the captured number", () => {
      expect(getCweUrl("CWE-1004")).toBe(
        "https://cwe.mitre.org/data/definitions/1004.html"
      );
    });
  });
});
