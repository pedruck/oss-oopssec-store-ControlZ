import { formatSlug } from "@/lib/format-slug-tdd";

describe("formatSlug - TDD improvements", () => {
  it("RCE acronym should be formatted in uppercase (should be a TITLE_OVERRIDE)", () => {
    expect(formatSlug("rce-injection")).toBe("RCE Injection");
  });

  it("normalizes mixed-case or all-caps words into proper Title Case (unless word present in TITLE_OVERRIDES)", () => {
    expect(formatSlug("INJECTION-vulnerability")).toBe(
      "Injection Vulnerability"
    );
    expect(formatSlug("sEsSiOn-FiXation")).toBe("Session Fixation");
  });
});
