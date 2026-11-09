type PdfJsDocument = {
  getPage: (pageNumber: number) => Promise<any>;
  numPages: number;
};

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

/**
 * Load PDF.js only in browser.
 * Prevent DOMMatrix is not defined during Next.js SSR.
 */
async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only run in the browser");
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist")
      .then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

        return pdfjsLib;
      })
      .catch((error) => {
        pdfjsPromise = null;
        throw error;
      });
  }

  return pdfjsPromise;
}

/**
 * Loads a PDF document from an ArrayBuffer.
 */
export async function loadPdfJsDocument(
  arrayBuffer: ArrayBuffer,
): Promise<PdfJsDocument> {
  const pdfjsLib = await getPdfJs();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
  });

  return await loadingTask.promise;
}

/**
 * Renders a specific page to a data URL
 * for preview thumbnails.
 */
export async function renderPageToThumbnail(
  pdfJsDoc: PdfJsDocument,
  pageIndex: number,
  maxWidth: number = 240,
): Promise<string> {
  try {
    if (typeof document === "undefined") {
      throw new Error("Canvas is only available in the browser");
    }

    const page = await pdfJsDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("Could not get 2d context");
    }

    canvas.width = Math.floor(scaledViewport.width);
    canvas.height = Math.floor(scaledViewport.height);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (error) {
    console.warn(`Error rendering page ${pageIndex + 1} thumbnail:`, error);

    return "";
  }
}

/**
 * Renders a PDF page to a canvas
 * and returns a JPEG blob for compression.
 */
export async function renderPageToJpegBlob(
  pdfJsDoc: PdfJsDocument,
  pageIndex: number,
  scale: number = 1.2,
  quality: number = 0.65,
): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  if (typeof document === "undefined") {
    throw new Error("Canvas is only available in the browser");
  }

  const page = await pdfJsDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create JPEG blob from canvas"));
          return;
        }

        resolve({
          blob,
          width: viewport.width,
          height: viewport.height,
        });
      },
      "image/jpeg",
      quality,
    );
  });
}
