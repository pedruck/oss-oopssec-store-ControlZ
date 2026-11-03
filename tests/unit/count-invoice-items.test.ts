import { countInvoiceItems } from "../../lib/invoice";

describe("countInvoiceItems", () => {
  it("retorna zero quando não há itens", () => {
    expect(countInvoiceItems([])).toBe(0);
  });

  it("retorna a quantidade de um único item", () => {
    expect(
      countInvoiceItems([{ name: "Mouse", quantity: 2, priceAtPurchase: 10.5 }])
    ).toBe(2);
  });

  it("soma as quantidades em vez de contar as linhas", () => {
    expect(
      countInvoiceItems([
        { name: "Mouse", quantity: 2, priceAtPurchase: 10.5 },
        { name: "Laptop", quantity: 1, priceAtPurchase: 999.99 },
      ])
    ).toBe(3);
  });
});
