import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY_INFO } from "./companyInfo";
import { formatDisplayDate } from "../components/DatePicker";
import logoImg from "../../assets/saam-geaars.png";

const BRAND = [124, 58, 237]; // matches --a-brand purple
const INK = [26, 22, 33];
const MUTED = [110, 102, 122];
const BORDER = [225, 220, 235];

let logoDataUrlPromise = null;
function loadLogoDataUrl() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(logoImg)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      )
      .catch(() => null);
  }
  return logoDataUrlPromise;
}

function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Shared letterhead: logo + company block on top, a brand rule beneath, and
// the document title/number/date banner. Returns the y coordinate where the
// caller's own content should start.
function drawLetterhead(doc, { docTitle, docNumber, numberLabel, date, dateLabel, logoDataUrl }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 42;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", marginX, y - 8, 46, 46);
    } catch {
      // ignore malformed image data — fall through without the logo
    }
  }

  const textX = logoDataUrl ? marginX + 58 : marginX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(COMPANY_INFO.name, textX, y + 6);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(COMPANY_INFO.tagline, textX, y + 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const infoLines = [
    ...COMPANY_INFO.addressLines,
    `Ph: ${COMPANY_INFO.phones.join("  /  ")}`,
    `${COMPANY_INFO.emails.join(", ")}   |   GSTIN: ${COMPANY_INFO.gst}`,
  ];
  let infoY = y + 31;
  infoLines.forEach((line) => {
    doc.text(line, textX, infoY);
    infoY += 10.5;
  });

  y = Math.max(y + 46, infoY) + 14;

  doc.setDrawColor(...BRAND);
  doc.setLineWidth(2);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 26;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND);
  doc.text(docTitle.toUpperCase(), marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const rightX = pageWidth - marginX;
  doc.text(`${numberLabel}: ${docNumber || "—"}`, rightX, y - 5, { align: "right" });
  doc.text(`${dateLabel}: ${date ? formatDisplayDate(date) : "—"}`, rightX, y + 9, { align: "right" });

  y += 22;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);

  return y + 20;
}

function drawPartyBlock(doc, y, { heading, name, addressLines, extraLines = [] }) {
  const marginX = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(heading.toUpperCase(), marginX, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...INK);
  doc.text(name || "—", marginX, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  let ly = y + 30;
  (addressLines || []).forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 260);
    wrapped.forEach((w) => {
      doc.text(w, marginX, ly);
      ly += 12;
    });
  });
  extraLines.forEach((line) => {
    doc.text(line, marginX, ly);
    ly += 12;
  });

  return ly + 10;
}

// Purchase-order-specific letterhead: company name/tagline on the left,
// every other company detail moved to the right, then a large centered
// document title beneath a divider (distinct from the Quotation layout,
// which keeps everything in one left-aligned block).
function drawPOHeader(doc, logoDataUrl) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 42;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", marginX, y - 8, 46, 46);
    } catch {
      // ignore malformed image data — fall through without the logo
    }
  }

  const textX = logoDataUrl ? marginX + 58 : marginX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK);
  doc.text(COMPANY_INFO.name, textX, y + 6);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(COMPANY_INFO.tagline, textX, y + 20);

  const rightX = pageWidth - marginX;
  const rightLines = [
    ...COMPANY_INFO.addressLines,
    `Ph: ${COMPANY_INFO.phones.join("  /  ")}`,
    COMPANY_INFO.emails.join(", "),
    `GSTIN: ${COMPANY_INFO.gst}`,
    COMPANY_INFO.website,
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  let rightY = y;
  rightLines.forEach((line) => {
    doc.text(line, rightX, rightY, { align: "right" });
    rightY += 11.5;
  });

  y = Math.max(y + 34, rightY) + 16;

  doc.setDrawColor(...BRAND);
  doc.setLineWidth(2);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 34;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...BRAND);
  doc.text("PURCHASE ORDER", pageWidth / 2, y, { align: "center" });
  y += 20;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);

  return y + 24;
}

function drawPOMeta(doc, y, po) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const rightX = pageWidth - marginX;

  const metaRows = [
    ["Reference", `Quotation No. ${po.quotation_number || "—"}`],
    ["Date", po.po_date ? formatDisplayDate(po.po_date) : "—"],
    ["Delivery Date", po.delivery_date ? formatDisplayDate(po.delivery_date) : "—"],
    ["Quotation Validity", "1 month"],
  ];
  let metaY = y + 15;
  metaRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(`${label}:`, rightX - 170, metaY, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(String(value), rightX, metaY, { align: "right" });
    metaY += 14;
  });

  const partyBottomY = drawPartyBlock(doc, y, {
    heading: "Vendor / Client",
    name: po.client_name,
    addressLines: (po.client_address || "").split("\n").filter(Boolean),
  });

  return Math.max(partyBottomY, metaY) + 10;
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.75);
    doc.line(marginX, pageHeight - 46, pageWidth - marginX, pageHeight - 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(COMPANY_INFO.website, marginX, pageHeight - 32);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, pageHeight - 32, { align: "right" });
  }
}

function itemsTotal(items) {
  return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_rate) || 0), 0);
}

async function buildQuotationDoc(quotation, items) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoDataUrl = await loadLogoDataUrl();

  let y = drawLetterhead(doc, {
    docTitle: "Quotation",
    docNumber: quotation.quotation_number,
    numberLabel: "Quotation No.",
    date: quotation.quotation_date,
    dateLabel: "Date",
    logoDataUrl,
  });

  y = drawPartyBlock(doc, y, {
    heading: "To",
    name: quotation.client_name,
    addressLines: (quotation.client_address || "").split("\n").filter(Boolean),
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const metaRightX = pageWidth - marginX;
  const metaTop = y - 55;
  const metaRows = [
    ["Kind Attn.", quotation.staff_name],
    ["Subject", quotation.subject],
    ["Enquiry No.", quotation.enquiry_number],
    ["Delivery Time", quotation.delivery_time],
  ].filter(([, v]) => v);
  let metaY = metaTop;
  metaRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...MUTED);
    doc.text(`${label}:`, metaRightX - 150, metaY, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(String(value), metaRightX, metaY, { align: "right" });
    metaY += 14;
  });
  y = Math.max(y, metaY) + 10;

  const rows = items.map((it, idx) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.unit_rate) || 0;
    return [
      String(idx + 1),
      it.item_description || "",
      it.moc || "",
      qty ? qty.toString() : "",
      rate ? money(rate) : "",
      qty || rate ? money(qty * rate) : "",
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["#", "Item Description", "MOC", "Qty", "Unit Rate", "Amount"]],
    body: rows,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9.5, cellPadding: 7, textColor: INK, lineColor: BORDER, lineWidth: 0.75 },
    headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 26, halign: "center" },
      3: { cellWidth: 50, halign: "right" },
      4: { cellWidth: 70, halign: "right" },
      5: { cellWidth: 75, halign: "right" },
    },
    didDrawPage: () => {},
  });

  let afterTableY = doc.lastAutoTable.finalY + 18;
  const total = itemsTotal(items);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`Total: Rs. ${money(total)}`, pageWidth - marginX, afterTableY, { align: "right" });

  afterTableY += 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    "This is a system-generated quotation. Prices are subject to change without prior notice.",
    marginX,
    afterTableY,
  );

  drawFooter(doc);
  return doc;
}

async function buildPurchaseOrderDoc(po, items) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoDataUrl = await loadLogoDataUrl();

  let y = drawPOHeader(doc, logoDataUrl);
  y = drawPOMeta(doc, y, po);

  const rows = items.map((it, idx) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.unit_rate) || 0;
    return [
      String(idx + 1),
      it.item_description || "",
      qty ? qty.toString() : "",
      rate ? money(rate) : "",
      qty || rate ? money(qty * rate) : "",
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["#", "Item Description", "Qty", "Unit Rate", "Amount"]],
    body: rows,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9.5, cellPadding: 7, textColor: INK, lineColor: BORDER, lineWidth: 0.75 },
    headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 26, halign: "center" },
      2: { cellWidth: 60, halign: "right" },
      3: { cellWidth: 80, halign: "right" },
      4: { cellWidth: 85, halign: "right" },
    },
  });

  let afterTableY = doc.lastAutoTable.finalY + 18;
  const subtotal = itemsTotal(items);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const finalTotal = subtotal + cgst + sgst;

  const totalsRows = [
    ["Subtotal", subtotal],
    ["CGST @ 9%", cgst],
    ["SGST @ 9%", sgst],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  totalsRows.forEach(([label, value]) => {
    doc.setTextColor(...MUTED);
    doc.text(label, pageWidth - marginX - 150, afterTableY, { align: "left" });
    doc.setTextColor(...INK);
    doc.text(`Rs. ${money(value)}`, pageWidth - marginX, afterTableY, { align: "right" });
    afterTableY += 15;
  });

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(1);
  doc.line(pageWidth - marginX - 150, afterTableY, pageWidth - marginX, afterTableY);
  afterTableY += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND);
  doc.text("Final Total", pageWidth - marginX - 150, afterTableY, { align: "left" });
  doc.setTextColor(...INK);
  doc.text(`Rs. ${money(finalTotal)}`, pageWidth - marginX, afterTableY, { align: "right" });

  afterTableY += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text("Authorized Signatory", pageWidth - marginX, afterTableY, { align: "right" });
  doc.setDrawColor(...BORDER);
  doc.line(pageWidth - marginX - 140, afterTableY - 14, pageWidth - marginX, afterTableY - 14);

  drawFooter(doc);
  return doc;
}

function safeFileSegment(value) {
  return String(value || "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
}

export async function downloadQuotationPDF(quotation, items) {
  const doc = await buildQuotationDoc(quotation, items);
  doc.save(`Quotation_${safeFileSegment(quotation.quotation_number) || quotation.id}.pdf`);
}

export async function downloadPurchaseOrderPDF(po, items) {
  const doc = await buildPurchaseOrderDoc(po, items);
  doc.save(`PurchaseOrder_${safeFileSegment(po.quotation_number) || po.id}.pdf`);
}
