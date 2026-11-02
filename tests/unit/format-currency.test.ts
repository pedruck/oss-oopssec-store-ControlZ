import { formatCurrency } from "../../lib/format";

describe("formatCurrency", () => {
  it("mantém um valor que já tem duas casas decimais", () => {
    expect(formatCurrency(999.99)).toBe("$999.99");
  });

  it("completa com duas casas decimais um valor inteiro", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });

  it("formata zero com duas casas decimais", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("arredonda para duas casas decimais", () => {
    expect(formatCurrency(2.499)).toBe("$2.50");
  });
});
