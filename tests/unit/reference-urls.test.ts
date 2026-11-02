import { getCweUrl } from "@/lib/format";

describe("getCweUrl", () => {
  it("strips leading zeros from the CWE number", () => {
    expect(getCweUrl("CWE-079")).toBe(
      "https://cwe.mitre.org/data/definitions/79.html"
    );
  });
});
