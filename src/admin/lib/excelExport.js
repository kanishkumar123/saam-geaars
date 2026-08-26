import * as XLSX from "xlsx";
import { STATUS_LABELS, STAGE_LABELS } from "./supabaseClient";

const STAGE_TYPES = Object.keys(STAGE_LABELS);

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function stageStatusByType(stages) {
  const byType = {};
  (stages || []).forEach((s) => {
    byType[s.stage_type] = STATUS_LABELS[s.status] || s.status;
  });
  return byType;
}

export function exportJobCardsToExcel(jobCards) {
  const rows = jobCards.map((jc) => {
    const stageStatus = stageStatusByType(jc.job_card_stages);
    const row = {
      "PO Number": jc.projects?.po_number || "",
      Company: jc.companies?.name || "",
      "Part Number": jc.tasks?.part_number || "",
      "Item Description": jc.tasks?.item_description || "",
      Quantity: jc.quantity ?? "",
      "Cost Per Unit": jc.cost_per_unit ?? "",
      "Order Due Date": formatDate(jc.order_due_date),
    };
    STAGE_TYPES.forEach((type) => {
      row[STAGE_LABELS[type]] = stageStatus[type] || "";
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 16 },
    { wch: 24 },
    { wch: 16 },
    { wch: 30 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    ...STAGE_TYPES.map(() => ({ wch: 16 })),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Job Cards");

  const today = new Date();
  const stamp = formatDate(today.toISOString().slice(0, 10)).replace(/\//g, "-");
  XLSX.writeFile(workbook, `JobCards_${stamp}.xlsx`);
}
