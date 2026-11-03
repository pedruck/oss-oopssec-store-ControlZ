import { formatSlug } from "@/lib/format";

//Blackbox tests

describe("formatSlug (Blackbox Unit Tests)", () => {
  it("converts kebab-case URL slugs into readable display text", () => {
    expect(formatSlug("vulnerability-found")).toBe("Vulnerability Found");
  });

  it("given text with spaces, underscores, or accents, it only splits by - and capitalizes words", () => {
    expect(formatSlug("#Café com açúcar & Pão-geléia")).toBe(
      "#Café com açúcar & Pão Geléia"
    );
  });

  it("should throw TypeError when passed a non-string type", () => {
    expect(() => formatSlug(123)).toThrow(TypeError);
  });

  it("should throw TypeError when passed null", () => {
    expect(() => formatSlug(null)).toThrow(TypeError);
  });
});

// Whitebox tests

describe("formatSlug (Whitebox Unit Tests)", () => {
  it("tests the if block when the string doesn't have a TITLE_OVERRIDE (the if condition is false)", () => {
    expect(formatSlug("abc")).toBe("Abc");
  });

  it("tests the if block when the string has a TITLE_OVERRIDE (the if condition is true)", () => {
    expect(formatSlug("NPM")).toBe("npm");
  });
});
