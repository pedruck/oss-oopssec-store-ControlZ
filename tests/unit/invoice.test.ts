import { join } from "path";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { PDFPage } from "pdf-lib";
import { generateInvoice } from "../../lib/invoice";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockedMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
const mockedWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

const invoicesDir = join(process.cwd(), "documents", "invoices");

const order = {
  orderId: "ORD-001",
  createdAt: new Date("2026-01-15T12:00:00Z"),
  customerName: "Gabriel Fae",
  customerEmail: "fae@example.com",
  address: {
    street: "123 Primeira Rua",
    city: "Brasília",
    state: "DF",
    zipCode: "710000-00",
    country: "BRA",
  },
  items: [{ name: "Laptop", quantity: 1, priceAtPurchase: 999.99 }],
  total: 999.99,
};

describe("generateInvoice - file generation", () => {
  let drawTextSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    drawTextSpy = jest.spyOn(PDFPage.prototype, "drawText");
  });

  afterEach(() => {
    drawTextSpy.mockRestore();
  });

  describe("black box", () => {
    it("escreve documents/invoices/invoice-ORD-001.pdf e retorna esse caminho", async () => {
      mockedExistsSync.mockReturnValue(true);
      const expectedPath = join(invoicesDir, "invoice-ORD-001.pdf");

      const result = await generateInvoice(order);

      expect(result).toBe(expectedPath);
      expect(mockedWriteFile).toHaveBeenCalledTimes(1);
      expect(mockedWriteFile).toHaveBeenCalledWith(
        expectedPath,
        expect.any(Uint8Array)
      );
    });

    it("escreve o id do pedido na invoice", async () => {
      mockedExistsSync.mockReturnValue(true);

      await generateInvoice(order);

      expect(drawTextSpy).toHaveBeenCalledWith(
        "Invoice Number: ORD-001",
        expect.any(Object)
      );
    });

    it("escreve o preço unitário, o total do item e o total do pedido", async () => {
      mockedExistsSync.mockReturnValue(true);

      await generateInvoice({
        ...order,
        items: [{ name: "Mouse", quantity: 2, priceAtPurchase: 10.5 }],
        total: 25,
      });

      const writtenTexts = drawTextSpy.mock.calls.map(
        (call: unknown[]) => call[0]
      );
      expect(writtenTexts).toEqual(
        expect.arrayContaining(["$10.50", "$21.00", "$25.00"])
      );
    });

    it("escreve o total de unidades do pedido", async () => {
      mockedExistsSync.mockReturnValue(true);

      await generateInvoice({
        ...order,
        items: [
          { name: "Mouse", quantity: 2, priceAtPurchase: 10.5 },
          { name: "Laptop", quantity: 1, priceAtPurchase: 999.99 },
        ],
      });

      expect(drawTextSpy).toHaveBeenCalledWith("Items: 3", expect.any(Object));
    });
  });

  describe("white box: branch coverage of existsSync(invoicesDir)", () => {
    it("cria a pasta quando ela não existe", async () => {
      mockedExistsSync.mockReturnValue(false);

      await generateInvoice(order);

      expect(mockedExistsSync).toHaveBeenCalledWith(invoicesDir);
      expect(mockedMkdir).toHaveBeenCalledTimes(1);
      expect(mockedMkdir).toHaveBeenCalledWith(invoicesDir, {
        recursive: true,
      });
    });

    it("nao chama mkdir se o diretório já existir", async () => {
      mockedExistsSync.mockReturnValue(true);

      await generateInvoice(order);

      expect(mockedExistsSync).toHaveBeenCalledWith(invoicesDir);
      expect(mockedMkdir).not.toHaveBeenCalled();
    });
  });
});
