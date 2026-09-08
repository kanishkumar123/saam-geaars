// Embeds the Archivo typeface into generated PDFs. jsPDF ships only Helvetica /
// Times / Courier, which is the main reason the old exports looked generic — a
// real grotesque with a proper weight range is what makes the letterhead read
// as bespoke. Archivo is the same family the admin UI already uses for its
// display font ("Archivo Black"), so the printed documents stay on-brand.
//
// The three static cuts are bundled as assets and fetched + base64-encoded once
// per session (mirrors loadLogoDataUrl in pdfExport.js). If the fetch fails
// (offline dev, blocked asset) registerArchivo resolves false and callers fall
// back to Helvetica — nothing throws.
//
// Files: src/assets/fonts/Archivo-{Regular,Medium,SemiBold}.ttf (OFL 1.1).

import archivoRegularUrl from "../../assets/fonts/Archivo-Regular.ttf";
import archivoMediumUrl from "../../assets/fonts/Archivo-Medium.ttf";
import archivoSemiBoldUrl from "../../assets/fonts/Archivo-SemiBold.ttf";

// vfs = virtual filename inside the jsPDF document; (family, style) is how
// callers reach the cut via doc.setFont(). Medium is registered as its own
// family because jsPDF keys built-in-style slots by "normal"/"bold" only.
const FACES = [
  { url: archivoRegularUrl, vfs: "Archivo-Regular.ttf", family: "Archivo", style: "normal" },
  { url: archivoSemiBoldUrl, vfs: "Archivo-SemiBold.ttf", family: "Archivo", style: "bold" },
  { url: archivoMediumUrl, vfs: "Archivo-Medium.ttf", family: "ArchivoMedium", style: "normal" },
];

let faceDataPromise = null;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function loadFaceData() {
  if (!faceDataPromise) {
    faceDataPromise = Promise.all(
      FACES.map((face) =>
        fetch(face.url)
          .then((res) => res.arrayBuffer())
          .then((buf) => ({ ...face, base64: arrayBufferToBase64(buf) })),
      ),
    ).catch(() => null);
  }
  return faceDataPromise;
}

// Registers the Archivo family into a jsPDF document. Returns true on success,
// false if the font files could not be loaded (caller should then stay on
// Helvetica). VFS entries are per-document, so this runs once per build.
export async function registerArchivo(doc) {
  const faces = await loadFaceData();
  if (!faces) return false;
  try {
    faces.forEach((face) => {
      doc.addFileToVFS(face.vfs, face.base64);
      doc.addFont(face.vfs, face.family, face.style);
    });
    return true;
  } catch {
    return false;
  }
}
