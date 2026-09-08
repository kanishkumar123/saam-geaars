import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY_INFO } from "./companyInfo";
import { formatDisplayDate } from "../components/DatePicker";
import { registerArchivo } from "./pdfFonts";
import logoImg from "../../assets/saam-geaars.png";

// Swiss-minimalist system: monochrome ink, no accent colour, hairline rules
// instead of boxed cells, generous margins, hierarchy carried by weight / size
// / tracking alone. Everything aligns to the left margin or the right margin.
const INK = [20, 20, 20]; // headings, body, strong rules
const GRAPHITE = [92, 92, 92]; // secondary text — addresses, meta values
const MUTED = [140, 140, 140]; // eyebrow labels, captions, footer
const HAIRLINE = [223, 223, 223]; // row separators, thin dividers

const MARGIN_X = 56;
const PAGE_TOP = 54;

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

// Resolve one of three Archivo cuts, falling back to Helvetica when the font
// files could not be embedded (doc.__archivo is set in the build fns).
function setType(doc, weight, size, color) {
  if (doc.__archivo) {
    if (weight === "medium") doc.setFont("ArchivoMedium", "normal");
    else if (weight === "bold") doc.setFont("Archivo", "bold");
    else doc.setFont("Archivo", "normal");
  } else {
    doc.setFont("helvetica", weight === "bold" ? "bold" : "normal");
  }
  if (size != null) doc.setFontSize(size);
  if (color) doc.setTextColor(...color);
}

// A right-aligned label/value list (letterhead meta, quotation attn block).
// Labels sit at `labelX`, values are flush to the right margin.
function drawMetaList(doc, y, rows, { labelX, rightX, lineHeight = 13 }) {
  let my = y;
  rows.forEach(([label, value]) => {
    setType(doc, "medium", 7.5, MUTED);
    doc.text(String(label).toUpperCase(), labelX, my, { charSpace: 1 });
    setType(doc, "regular", 9, INK);
    doc.text(String(value == null || value === "" ? "—" : value), rightX, my, { align: "right" });
    my += lineHeight;
  });
  return my;
}

// Shared letterhead for both document types. Left: logo + wordmark + tagline.
// Right: the full company contact block (address, phone, email, website, GSTIN),
// right-aligned. A strong full-width rule, then the document title on the left
// with its meta list on the right, closed by a hairline. Returns the y where
// body content should start.
function drawLetterhead(doc, { docTitle, meta, logoDataUrl }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  let y = PAGE_TOP;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", MARGIN_X, y, 34, 34);
    } catch {
      // ignore malformed image data — fall through without the logo
    }
  }

  const textX = MARGIN_X + 48;
  setType(doc, "bold", 15, INK);
  doc.text(COMPANY_INFO.name.toUpperCase(), textX, y + 14, { charSpace: 1.3 });
  setType(doc, "medium", 8, MUTED);
  doc.text(COMPANY_INFO.tagline, textX, y + 26);

  const contactLines = [
    ...COMPANY_INFO.addressLines,
    `Ph: ${COMPANY_INFO.phones.join("   ·   ")}`,
    COMPANY_INFO.emails.join("   ·   "),
    COMPANY_INFO.website,
    `GSTIN: ${COMPANY_INFO.gst}`,
  ].filter(Boolean);
  setType(doc, "regular", 8.5, GRAPHITE);
  let cy = y + 3;
  contactLines.forEach((line) => {
    doc.text(line, rightX, cy, { align: "right" });
    cy += 11;
  });

  y = Math.max(y + 34, cy - 11) + 16;
  doc.setDrawColor(...INK);
  doc.setLineWidth(1.2);
  doc.line(MARGIN_X, y, rightX, y);
  y += 22;

  setType(doc, "bold", 15, INK);
  doc.text(docTitle.toUpperCase(), MARGIN_X, y, { charSpace: 1 });
  const metaBottom = drawMetaList(doc, y - 4, meta, { labelX: rightX - 215, rightX });

  y = Math.max(y, metaBottom - 13) + 14;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, y, rightX, y);

  return y + 24;
}

// A "party" block: eyebrow heading, name, then wrapped address lines.
function drawPartyBlock(doc, y, { heading, name, addressLines, extraLines = [] }) {
  setType(doc, "medium", 7.5, MUTED);
  doc.text(heading.toUpperCase(), MARGIN_X, y, { charSpace: 1.2 });

  setType(doc, "bold", 11.5, INK);
  doc.text(name || "—", MARGIN_X, y + 16);

  setType(doc, "regular", 9, GRAPHITE);
  let ly = y + 31;
  (addressLines || []).forEach((line) => {
    doc.splitTextToSize(line, 280).forEach((w) => {
      doc.text(w, MARGIN_X, ly);
      ly += 12;
    });
  });
  extraLines.forEach((line) => {
    doc.text(line, MARGIN_X, ly);
    ly += 12;
  });

  return ly + 8;
}

// Right-aligned totals stack: optional breakdown rows, a strong rule, then the
// grand total in bold. Amounts are plain en-IN numbers; the grand total keeps
// an "INR" prefix so the headline figure is unambiguous.
function drawTotals(doc, y, rows, grandLabel, grandValue) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  const labelX = rightX - 210;
  let ty = y;

  rows.forEach(([label, value]) => {
    setType(doc, "regular", 8.5, MUTED);
    doc.text(String(label).toUpperCase(), labelX, ty, { charSpace: 0.6 });
    setType(doc, "regular", 9.5, INK);
    doc.text(money(value), rightX, ty, { align: "right" });
    ty += 15;
  });

  ty += rows.length ? 5 : 0;
  doc.setDrawColor(...INK);
  doc.setLineWidth(1);
  doc.line(labelX, ty, rightX, ty);
  ty += 17;

  setType(doc, "bold", 10, INK);
  doc.text(grandLabel.toUpperCase(), labelX, ty, { charSpace: 1.2 });
  setType(doc, "bold", 12, INK);
  doc.text(`INR ${money(grandValue)}`, rightX, ty, { align: "right" });

  return ty + 10;
}

// Shared autotable config: "plain" theme (no cell boxes), header underlined
// with a strong ink rule, body rows separated by a light hairline, first
// column flush to the left margin.
function itemsTableOptions(doc, startY, head, body, columnStyles) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  return {
    startY,
    // top applies only to continuation pages (there is no letterhead there);
    // bottom keeps rows clear of the footer rule.
    margin: { left: MARGIN_X, right: MARGIN_X, top: PAGE_TOP, bottom: 64 },
    head: [head],
    body,
    theme: "plain",
    styles: {
      font: doc.__archivo ? "Archivo" : "helvetica",
      fontStyle: "normal",
      fontSize: 9.5,
      textColor: INK,
      lineWidth: 0,
      cellPadding: { top: 7, bottom: 7, left: 0, right: 12 },
      valign: "top",
    },
    headStyles: {
      font: doc.__archivo ? "Archivo" : "helvetica",
      fontStyle: "bold",
      fontSize: 8,
      textColor: INK,
      cellPadding: { top: 0, bottom: 9, left: 0, right: 12 },
    },
    columnStyles,
    didParseCell: (data) => {
      // mirror the body halign onto the header for numeric columns
      const align = columnStyles[data.column.index]?.halign;
      if (data.section === "head" && align) data.cell.styles.halign = align;
    },
    didDrawCell: (data) => {
      if (data.column.index !== data.table.columns.length - 1) return;
      const bottom = data.cell.y + data.cell.height;
      if (data.section === "head") {
        doc.setDrawColor(...INK);
        doc.setLineWidth(1);
        doc.line(MARGIN_X, bottom, rightX, bottom);
      } else if (data.section === "body") {
        doc.setDrawColor(...HAIRLINE);
        doc.setLineWidth(0.4);
        doc.line(MARGIN_X, bottom, rightX, bottom);
      }
    },
  };
}

function drawCaption(doc, y) {
  setType(doc, "regular", 7.5, MUTED);
  doc.text("All amounts in Indian Rupees (INR)", MARGIN_X, y);
  return y + 14;
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rightX = pageWidth - MARGIN_X;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, pageHeight - 46, rightX, pageHeight - 46);
    setType(doc, "regular", 7.5, MUTED);
    doc.text(`${COMPANY_INFO.name}   ·   ${COMPANY_INFO.website}`, MARGIN_X, pageHeight - 32);
    doc.text(`Page ${i} / ${pageCount}`, rightX, pageHeight - 32, { align: "right" });
  }
}

function itemsTotal(items) {
  return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_rate) || 0), 0);
}

// Standard commercial terms printed on every quotation. "Delivery" is taken
// from the quotation's own delivery_time when the user filled it in.
const COMMERCIAL_TERMS = [
  ["Price Basis", "Ex works, Coimbatore"],
  ["Tax", "CGST-9%, SGST-9%"],
  ["Delivery", "7 Weeks from the Date of PO."],
  ["Freight", "To your scope"],
  ["P & F", "Inclusive"],
  ["Payment", "Against delivery"],
  ["Validity", "One month"],
];

function drawCommercialTerms(doc, y, quotation) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  const valueX = MARGIN_X + 128;

  setType(doc, "bold", 9.5, INK);
  doc.text("COMMERCIAL TERMS", MARGIN_X, y, { charSpace: 1 });
  y += 7;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, y, rightX, y);
  y += 17;

  COMMERCIAL_TERMS.forEach(([label, fallback], i) => {
    const value =
      label === "Delivery" && quotation.delivery_time
        ? `${quotation.delivery_time} from the Date of PO.`
        : fallback;
    setType(doc, "regular", 9, GRAPHITE);
    doc.text(`${i + 1}.   ${label}`, MARGIN_X, y);
    setType(doc, "regular", 9, INK);
    doc.text(`:   ${value}`, valueX, y);
    y += 14;
  });

  y += 18;
  setType(doc, "regular", 9, GRAPHITE);
  doc.text(
    "We trust our offer is inline and in order with your requirements. We look forward for your order placement.",
    MARGIN_X,
    y,
    { maxWidth: rightX - MARGIN_X, lineHeightFactor: 1.45 },
  );
  y += 30;
  doc.text(
    "Thanking you and assuring you of our best and prompt services at all times.",
    MARGIN_X,
    y,
    { maxWidth: rightX - MARGIN_X },
  );

  y += 26;
  setType(doc, "regular", 7.5, MUTED);
  doc.text(
    "This is a computer-generated quotation and does not require a signature.",
    MARGIN_X,
    y,
    { maxWidth: rightX - MARGIN_X },
  );

  return y + 16;
}

async function buildQuotationDoc(quotation, items) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.__archivo = await registerArchivo(doc);
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  const logoDataUrl = await loadLogoDataUrl();

  let y = drawLetterhead(doc, {
    docTitle: "Quotation",
    meta: [
      ["Quotation No.", quotation.quotation_number],
      ["Date", quotation.quotation_date ? formatDisplayDate(quotation.quotation_date) : ""],
    ],
    logoDataUrl,
  });

  const partyBottom = drawPartyBlock(doc, y, {
    heading: "Bill To",
    name: quotation.client_name,
    addressLines: (quotation.client_address || "").split("\n").filter(Boolean),
  });

  const attnRows = [
    ["Kind Attn.", quotation.staff_name],
    ["Subject", quotation.subject],
    ["Enquiry No.", quotation.enquiry_number],
  ].filter(([, v]) => v);
  const attnBottom = attnRows.length
    ? drawMetaList(doc, y, attnRows, { labelX: rightX - 215, rightX, lineHeight: 14 })
    : y;

  y = Math.max(partyBottom, attnBottom + 2) + 16;
  y = drawCaption(doc, y);

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

  autoTable(
    doc,
    itemsTableOptions(
      doc,
      y,
      ["#", "Item Description", "MOC", "Qty", "Unit Rate", "Amount"],
      rows,
      {
        0: { cellWidth: 22, textColor: MUTED },
        1: { cellWidth: "auto" },
        2: { cellWidth: 68 },
        3: { cellWidth: 42, halign: "right" },
        4: { cellWidth: 74, halign: "right" },
        5: { cellWidth: 82, halign: "right" },
      },
    ),
  );

  // Quotation intentionally carries no grand total — pricing is per line item
  // and the commercial terms below govern the offer.
  let afterTableY = doc.lastAutoTable.finalY + 24;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (afterTableY + 238 > pageHeight - 54) {
    doc.addPage();
    afterTableY = PAGE_TOP;
  }
  drawCommercialTerms(doc, afterTableY, quotation);

  drawFooter(doc);
  return doc;
}

async function buildPurchaseOrderDoc(po, items) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.__archivo = await registerArchivo(doc);
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  const logoDataUrl = await loadLogoDataUrl();

  let y = drawLetterhead(doc, {
    docTitle: "Purchase Order",
    meta: [
      ["Ref. Quotation", po.quotation_number],
      ["Date", po.po_date ? formatDisplayDate(po.po_date) : ""],
      ["Delivery", po.delivery_date ? formatDisplayDate(po.delivery_date) : ""],
      ["Validity", "1 month"],
    ],
    logoDataUrl,
  });

  y = drawPartyBlock(doc, y, {
    heading: "Supplier",
    name: po.client_name,
    addressLines: (po.client_address || "").split("\n").filter(Boolean),
  });
  y += 8;
  y = drawCaption(doc, y);

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

  autoTable(
    doc,
    itemsTableOptions(doc, y, ["#", "Item Description", "Qty", "Unit Rate", "Amount"], rows, {
      0: { cellWidth: 22, textColor: MUTED },
      1: { cellWidth: "auto" },
      2: { cellWidth: 52, halign: "right" },
      3: { cellWidth: 80, halign: "right" },
      4: { cellWidth: 88, halign: "right" },
    }),
  );

  let afterTableY = doc.lastAutoTable.finalY + 22;
  const subtotal = itemsTotal(items);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  afterTableY = drawTotals(
    doc,
    afterTableY,
    [
      ["Subtotal", subtotal],
      ["CGST @ 9%", cgst],
      ["SGST @ 9%", sgst],
    ],
    "Total",
    subtotal + cgst + sgst,
  );

  afterTableY += 52;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.5);
  doc.line(rightX - 150, afterTableY, rightX, afterTableY);
  setType(doc, "medium", 7.5, MUTED);
  doc.text("AUTHORIZED SIGNATORY", rightX, afterTableY + 13, { align: "right", charSpace: 1 });

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
