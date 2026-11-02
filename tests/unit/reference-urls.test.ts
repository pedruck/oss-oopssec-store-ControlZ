import { getCveUrl, getCweUrl } from "@/lib/format";

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

describe("getCveUrl", () => {
  it("links a valid CVE id to NVD", () => {
    expect(getCveUrl("CVE-2025-55182")).toBe(
      "https://nvd.nist.gov/vuln/detail/CVE-2025-55182"
    );
  });

  it("returns null for an id outside the CVE format", () => {
    expect(getCveUrl("not-a-cve")).toBeNull();
  });
});
