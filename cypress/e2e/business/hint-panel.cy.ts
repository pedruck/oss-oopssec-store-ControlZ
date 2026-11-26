/**
 * The hint panel stays open while the player works. If the active challenge
 * changes meanwhile (solved in another tab, or with curl), the next reveal
 * belongs to the new challenge and must not be listed under the old title.
 * The API is stubbed to change under the open panel.
 */

const stateFor = (
  slug: string,
  revealedHints: { level: number; content: string }[],
  nextHintLevel: number | null
) => ({
  activeFlag: { slug, difficulty: "EASY", category: "INJECTION" },
  revealedHints,
  nextHintLevel,
  allFlagsFound: false,
});

// The onboarding guide covers the floating buttons on a first visit.
const visitHome = () =>
  cy.visit("/", {
    onBeforeLoad: (win) => win.localStorage.setItem("oss_onboarding_seen", "1"),
  });

describe("Hint panel (E2E)", () => {
  it("follows the active challenge when it changes with the panel open", () => {
    cy.intercept("GET", "/api/hints/current", stateFor("old-challenge", [], 1));
    visitHome();
    cy.get('button[aria-label="Get a hint"]').click();
    cy.contains("Old Challenge").should("be.visible");

    const newHint = { level: 1, content: "A hint for the new challenge" };
    cy.intercept(
      "GET",
      "/api/hints/current",
      stateFor("new-challenge", [newHint], 2)
    );
    cy.intercept("POST", "/api/hints/reveal", {
      slug: "new-challenge",
      hint: newHint,
      nextHintLevel: 2,
    });

    cy.contains("button", "Reveal hint 1").click();

    cy.contains("New Challenge").should("be.visible");
    cy.contains(newHint.content).should("be.visible");
    cy.contains("Old Challenge").should("not.exist");
  });

  it("keeps appending hints while the challenge stays the same", () => {
    cy.intercept(
      "GET",
      "/api/hints/current",
      stateFor("same-challenge", [], 1)
    );
    visitHome();
    cy.get('button[aria-label="Get a hint"]').click();

    cy.intercept("POST", "/api/hints/reveal", {
      slug: "same-challenge",
      hint: { level: 1, content: "First hint" },
      nextHintLevel: 2,
    });
    cy.contains("button", "Reveal hint 1").click();

    cy.contains("Same Challenge").should("be.visible");
    cy.contains("First hint").should("be.visible");
    cy.contains("button", "Reveal hint 2").should("be.visible");
  });
});
