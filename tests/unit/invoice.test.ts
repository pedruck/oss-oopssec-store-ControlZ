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

  it("includes tax in the invoice total when a tax rate is provided", async () => {
    jest.mocked(existsSync).mockReturnValue(true);

    await generateInvoice({ ...invoiceData, taxRate: 0.1 });

    const drawText = mockPdfDocument.addPage.mock.results[0].value.drawText;
    const renderedText = drawText.mock.calls.map(([text]: [string]) => text);

    expect(renderedText).toContain("Tax (10%):");
    expect(renderedText).toContain("$1.00");
    expect(renderedText).toContain("$11.00");
  });

  it("shows a zero tax line when the tax rate is explicitly zero", async () => {
    jest.mocked(existsSync).mockReturnValue(true);

    await generateInvoice({ ...invoiceData, taxRate: 0 });

    const drawText = mockPdfDocument.addPage.mock.results[0].value.drawText;
    const renderedText = drawText.mock.calls.map(([text]: [string]) => text);

    expect(renderedText).toContain("Tax (0%):");
    expect(renderedText).toContain("$0.00");
    expect(renderedText).toContain("$10.00");
  });

  it("rejects a negative tax rate", async () => {
    await expect(
      generateInvoice({ ...invoiceData, taxRate: -0.1 })
    ).rejects.toThrow("taxRate must be between 0 and 1");
  });

  it("rejects a tax rate greater than one", async () => {
    await expect(
      generateInvoice({ ...invoiceData, taxRate: 1.1 })
    ).rejects.toThrow("taxRate must be between 0 and 1");
  });
});
