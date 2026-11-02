import { getCweUrl } from "@/lib/format";

describe("getCweUrl", () => {
  it("strips leading zeros from the CWE number", () => {
    expect(getCweUrl("CWE-079")).toBe(
      "https://cwe.mitre.org/data/definitions/79.html"
    );
  });

  it("returns null for CWE number zero", () => {
    expect(getCweUrl("CWE-0")).toBeNull();
    expect(getCweUrl("CWE-000")).toBeNull();
  });
});
