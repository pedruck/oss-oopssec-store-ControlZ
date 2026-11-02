import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { PDFDocument } from "pdf-lib";
import { generateInvoice } from "../../lib/invoice";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("pdf-lib", () => ({
  PDFDocument: {
    create: jest.fn(),
  },
  StandardFonts: {
    Helvetica: "Helvetica",
    HelveticaBold: "Helvetica-Bold",
  },
  rgb: jest.fn(),
}));

const invoicesDir = join(process.cwd(), "documents", "invoices");
const expectedFilepath = join(invoicesDir, "invoice-ORD-001.pdf");
const pdfBytes = new Uint8Array([1, 2, 3]);
const invoiceData = {
  orderId: "ORD-001",
  createdAt: "2026-10-30",
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  address: {
    street: "123 Test Street",
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    country: "Test Country",
  },
  items: [{ name: "Test Product", quantity: 1, priceAtPurchase: 10 }],
  total: 10,
};

const mockPdfDocument = {
  addPage: jest.fn(() => ({
    getSize: jest.fn(() => ({ height: 792 })),
    drawText: jest.fn(),
    drawLine: jest.fn(),
  })),
  embedFont: jest.fn(async (font: string) => font),
  save: jest.fn(async () => pdfBytes),
};

describe("generateInvoice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(PDFDocument.create).mockResolvedValue(mockPdfDocument as never);
  });

  it("creates the invoices folder and writes the invoice when it is missing", async () => {
    jest.mocked(existsSync).mockReturnValue(false);

    const result = await generateInvoice(invoiceData);

    expect(mkdir).toHaveBeenCalledWith(invoicesDir, { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(expectedFilepath, pdfBytes);
    expect(result).toBe(expectedFilepath);
  });

  it("writes the invoice without creating the folder when it already exists", async () => {
    jest.mocked(existsSync).mockReturnValue(true);

    const result = await generateInvoice(invoiceData);

    expect(mkdir).not.toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledWith(expectedFilepath, pdfBytes);
    expect(result).toBe(expectedFilepath);
  });

  it("renders invoice dates in UTC", async () => {
    jest.mocked(existsSync).mockReturnValue(true);
    const date = new Date("2026-11-01T23:30:00.000Z");

    await generateInvoice({ ...invoiceData, createdAt: date });

    const page = mockPdfDocument.addPage.mock.results[0].value;
    expect(page.drawText).toHaveBeenCalledWith(
      "Date: November 1, 2026",
      expect.objectContaining({ x: 50, size: 10 })
    );
  });

  it.each([
    ["short", "Product name", "Product name"],
    [
      "40 characters",
      "1234567890123456789012345678901234567890",
      "1234567890123456789012345678901234567890",
    ],
    [
      "41 characters",
      "12345678901234567890123456789012345678901",
      "1234567890123456789012345678901234567890...",
    ],
  ])(
    "formats an item name with %s correctly",
    async (_label, name, expectedName) => {
      jest.mocked(existsSync).mockReturnValue(true);

      await generateInvoice({
        ...invoiceData,
        items: [{ name, quantity: 1, priceAtPurchase: 10 }],
      });

      const page = mockPdfDocument.addPage.mock.results[0].value;
      expect(page.drawText).toHaveBeenCalledWith(
        expectedName,
        expect.objectContaining({ x: 50, size: 10 })
      );
    }
  );

  it("does not render item rows when the invoice has no items", async () => {
    jest.mocked(existsSync).mockReturnValue(true);

    await generateInvoice({ ...invoiceData, items: [] });

    const page = mockPdfDocument.addPage.mock.results[0].value;
    const itemHeaderWasRendered = page.drawText.mock.calls.some(
      (call: unknown[]) => call[0] === "Item"
    );
    const itemRowCalls = page.drawText.mock.calls.filter(
      (call: unknown[]) =>
        call[0] === "1" || call[0] === "$10.00" || call[0] === "Test Product"
    );

    expect(itemHeaderWasRendered).toBe(true);
    expect(itemRowCalls).toHaveLength(0);
  });

  it("renders a three-item total with exactly two decimal places", async () => {
    jest.mocked(existsSync).mockReturnValue(true);

    await generateInvoice({
      ...invoiceData,
      items: [{ name: "Product", quantity: 3, priceAtPurchase: 19.99 }],
      total: 59.97,
    });

    const page = mockPdfDocument.addPage.mock.results[0].value;
    expect(page.drawText).toHaveBeenCalledWith(
      "$59.97",
      expect.objectContaining({ x: 480, size: 12 })
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "$59.97",
      expect.objectContaining({ x: 480, size: 10 })
    );
  });
});
