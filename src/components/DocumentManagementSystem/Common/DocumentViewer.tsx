import React, { useState, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import DOMPurify from "dompurify";
import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";

export type DocumentViewerTarget = {
  id: string | number;
  title?: string;
  fileName?: string;
  fileType?: string;
  type?: string;
  number?: string;
  hasAccess?: boolean;
};

export type DocumentViewerOptions = {
  endpoint?: string;
  checkAccess?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export interface RenderFileInTabOptions {
  blob: Blob;
  fileName: string;
  mimeType: string;
  newTab: Window;
  workbook?: XLSX.WorkBook;
}


// Extracts the original file name from the Content-Disposition header.

export const getOriginalFileName = (
  headers: Record<string, any> = {},
  fallback: string
): string => {
  const disposition =
    headers["content-disposition"] ||
    headers["Content-Disposition"] ||
    (typeof headers?.get === "function"
      ? headers.get("content-disposition") || headers.get("Content-Disposition")
      : "") ||
    "";

  const encodedName = disposition.match(
    /filename\*=UTF-8''([^;]+)/i
  )?.[1];

  if (encodedName) {
    try {
      return decodeURIComponent(encodedName.replace(/^"|"$/g, ""));
    } catch {
      // Fall back to regular filename
    }
  }

  const quotedName = disposition.match(
    /filename="([^"]+)"/i
  )?.[1];

  const plainName = disposition.match(
    /filename=([^;]+)/i
  )?.[1];

  return quotedName || plainName?.trim() || fallback;
};

/**
 * Determines the MIME type based on file extension, server response, or metadata.
 */
export const getMimeType = (
  fileName: string,
  contentType = "",
  metadataType = ""
): string => {
  const normalizedName = fileName.toLowerCase().split("?")[0];
  const normalizedType = metadataType.toLowerCase().trim();
  const responseType = contentType.split(";")[0].trim().toLowerCase();

  // Prefer the actual file extension.
  if (normalizedName.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (normalizedName.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }

  if (normalizedName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  // Use document metadata when the response filename has no extension.
  if (
    normalizedType.includes("xlsx") ||
    normalizedType.includes("spreadsheet") ||
    normalizedType.includes("excel")
  ) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (normalizedType === "xls" || normalizedType.includes("ms-excel")) {
    return "application/vnd.ms-excel";
  }

  if (normalizedType.includes("docx") || normalizedType.includes("word")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  // Preserve other valid server-provided MIME types.
  if (responseType && responseType !== "application/octet-stream") {
    return responseType;
  }

  const extension = normalizedName.split(".").pop();

  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
  };

  return mimeTypes[extension || ""] || "application/octet-stream";
};

/**
 * Ensures the filename has an appropriate extension according to the detected MIME type.
 */
export const ensureFileExtension = (
  fileName: string,
  mimeType: string
): string => {
  if (!/\.[a-z0-9]+$/i.test(fileName)) {
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return `${fileName}.xlsx`;
    }
    if (mimeType === "application/vnd.ms-excel") {
      return `${fileName}.xls`;
    }
    if (mimeType === "application/pdf") {
      return `${fileName}.pdf`;
    }
    if (mimeType === "image/png") {
      return `${fileName}.png`;
    }
    if (mimeType === "image/jpeg") {
      return `${fileName}.jpg`;
    }
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return `${fileName}.docx`;
    }
  }
  return fileName;
};

/**
 * Attempts to parse an unknown buffer as an Excel workbook.
 */
export const detectExcelWorkbook = async (
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<{ mimeType: string; fileName: string; workbook?: XLSX.WorkBook }> => {
  if (
    mimeType === "application/octet-stream" &&
    !fileName.toLowerCase().endsWith(".docx")
  ) {
    try {
      const buffer = await blob.arrayBuffer();
      const parsedWb = XLSX.read(buffer, { type: "array", cellDates: true });

      if (parsedWb.SheetNames.length > 0) {
        let updatedFileName = fileName;
        if (!/\.[a-z0-9]+$/i.test(updatedFileName)) {
          updatedFileName += ".xlsx";
        }
        console.log("Excel detected from file content:", parsedWb.SheetNames);
        return {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          fileName: updatedFileName,
          workbook: parsedWb,
        };
      }
    } catch (error) {
      console.warn("Could not identify the file as Excel:", error);
    }
  }

  return { mimeType, fileName };
};


export const detectFileTypeFromBuffer = async (
  blob: Blob,
  currentFileName: string,
  currentMimeType: string
): Promise<{ mimeType: string; fileName: string }> => {
  if (
    currentMimeType &&
    currentMimeType !== "application/octet-stream" &&
    currentMimeType !== "binary/octet-stream"
  ) {
    return { mimeType: currentMimeType, fileName: currentFileName };
  }

  try {
    const slice = blob.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // %PDF -> 0x25, 0x50, 0x44, 0x46
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      const fileName = currentFileName.toLowerCase().endsWith(".pdf")
        ? currentFileName
        : `${currentFileName}.pdf`;
      console.log("PDF magic bytes (%PDF) detected! Resolved as application/pdf:", fileName);
      return { mimeType: "application/pdf", fileName };
    }

    // PNG -> 0x89, 0x50, 0x4E, 0x47
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47
    ) {
      const fileName = currentFileName.toLowerCase().endsWith(".png")
        ? currentFileName
        : `${currentFileName}.png`;
      console.log("PNG magic bytes detected! Resolved as image/png:", fileName);
      return { mimeType: "image/png", fileName };
    }

    // JPEG -> 0xFF, 0xD8, 0xFF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      const fileName =
        currentFileName.toLowerCase().endsWith(".jpg") ||
        currentFileName.toLowerCase().endsWith(".jpeg")
          ? currentFileName
          : `${currentFileName}.jpg`;
      console.log("JPEG magic bytes detected! Resolved as image/jpeg:", fileName);
      return { mimeType: "image/jpeg", fileName };
    }

    // GIF -> 'GIF' -> 0x47, 0x49, 0x46
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      const fileName = currentFileName.toLowerCase().endsWith(".gif")
        ? currentFileName
        : `${currentFileName}.gif`;
      console.log("GIF magic bytes detected! Resolved as image/gif:", fileName);
      return { mimeType: "image/gif", fileName };
    }
  } catch (error) {
    console.warn("Could not inspect buffer magic bytes:", error);
  }

  return { mimeType: currentMimeType, fileName: currentFileName };
};


export async function renderFileInTab({
  blob,
  fileName,
  mimeType,
  newTab,
  workbook,
}: RenderFileInTabOptions): Promise<void> {
  const fileUrl = URL.createObjectURL(blob);
  const lowerFileName = fileName.toLowerCase();

  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerFileName.endsWith(".docx");

  const isXlsx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    lowerFileName.endsWith(".xlsx");

  const isXls =
    mimeType === "application/vnd.ms-excel" || lowerFileName.endsWith(".xls");

  if (mimeType.startsWith("image/")) {
    newTab.document.title = fileName;

    const image = newTab.document.createElement("img");
    image.src = fileUrl;
    image.alt = fileName;
    image.style.cssText =
      "max-width:100%;max-height:100vh;object-fit:contain;";

    newTab.document.body.replaceChildren(image);
    newTab.document.body.style.cssText =
      "margin:0;display:flex;justify-content:center;align-items:center;background:#1f1f1f;min-height:100vh;";
  } else if (isDocx) {
    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.convertToHtml({
      arrayBuffer,
    });
    const safeHtml = DOMPurify.sanitize(result.value);

    newTab.document.open();
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${DOMPurify.sanitize(fileName)}</title>
          <style>
            body {
              max-width: 900px;
              margin: 30px auto;
              padding: 24px;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #222;
              overflow-wrap: anywhere;
            }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; max-width: 100%; }
            td, th { border: 1px solid #ccc; padding: 8px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>${safeHtml}</body>
      </html>
    `);
    newTab.document.close();
  } else if (isXlsx || isXls) {
    const wb =
      workbook ||
      XLSX.read(await blob.arrayBuffer(), {
        type: "array",
        cellDates: true,
      });

    console.log("Excel sheet names:", wb.SheetNames);

    const sheetsHtml = wb.SheetNames.map((sheetName: string) => {
      const worksheet = wb.Sheets[sheetName];

      if (!worksheet) {
        return `
          <section class="sheet">
            <h2>${DOMPurify.sanitize(sheetName)}</h2>
            <p>This worksheet could not be loaded.</p>
          </section>
        `;
      }

      let tableHtml = "";

      try {
        const cellAddresses = Object.keys(worksheet).filter(
          (key) => !key.startsWith("!")
        );

        if (cellAddresses.length > 0) {
          if (!worksheet["!ref"]) {
            worksheet["!ref"] = XLSX.utils.encode_range(
              cellAddresses.reduce(
                (range, address) => {
                  const cell = XLSX.utils.decode_cell(address);

                  return {
                    s: {
                      r: Math.min(range.s.r, cell.r),
                      c: Math.min(range.s.c, cell.c),
                    },
                    e: {
                      r: Math.max(range.e.r, cell.r),
                      c: Math.max(range.e.c, cell.c),
                    },
                  };
                },
                {
                  s: { r: Infinity, c: Infinity },
                  e: { r: -1, c: -1 },
                }
              )
            );
          }

          tableHtml = XLSX.utils.sheet_to_html(worksheet, {
            editable: false,
            header: "",
            footer: "",
          });

          if (!tableHtml) {
            tableHtml = "<p>No displayable cell data found.</p>";
          }
        } else {
          tableHtml = "<p>This worksheet contains no displayable cells.</p>";
        }
      } catch (error) {
        console.error(`Failed to render worksheet "${sheetName}":`, error);
        tableHtml = "<p>This worksheet could not be rendered.</p>";
      }

      return `
        <section class="sheet">
          <h2>${DOMPurify.sanitize(sheetName)}</h2>
          ${tableHtml}
        </section>
      `;
    }).join("");

    const safeHtml = DOMPurify.sanitize(sheetsHtml);

    newTab.document.open();
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${DOMPurify.sanitize(fileName)}</title>
          <style>
            body {
              margin: 0;
              padding: 24px;
              font-family: Arial, sans-serif;
              color: #222;
              background: #f8fafc;
            }
            .sheet {
              margin-bottom: 28px;
              padding: 16px;
              background: white;
              border: 1px solid #dbe2ea;
              border-radius: 8px;
              overflow-x: auto;
            }
            h2 {
              font-size: 18px;
              margin: 0 0 16px;
            }
            table {
              border-collapse: collapse;
              min-width: 100%;
              font-size: 13px;
            }
            td, th {
              border: 1px solid #cbd5e1;
              padding: 7px 10px;
              text-align: left;
              white-space: pre-wrap;
            }
            th {
              background: #e2e8f0;
            }
          </style>
        </head>
        <body>${safeHtml}</body>
      </html>
    `);
    newTab.document.close();

    console.log("Excel preview rendered:", wb.SheetNames);
  } else if (mimeType === "application/pdf") {
    newTab.document.open();
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${DOMPurify.sanitize(fileName)}</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #525659;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              display: block;
            }
          </style>
        </head>
        <body>
          <iframe src="${fileUrl}" title="${DOMPurify.sanitize(fileName)}"></iframe>
        </body>
      </html>
    `);
    newTab.document.close();
  } else if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json"
  ) {
    try {
      const textContent = await blob.text();
      newTab.document.open();
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${DOMPurify.sanitize(fileName)}</title>
            <style>
              body {
                margin: 0;
                padding: 24px;
                font-family: Consolas, Monaco, "Courier New", monospace;
                font-size: 14px;
                line-height: 1.5;
                color: #1e293b;
                background: #f8fafc;
              }
              pre {
                white-space: pre-wrap;
                word-break: break-word;
              }
            </style>
          </head>
          <body>
            <pre>${DOMPurify.sanitize(textContent)}</pre>
          </body>
        </html>
      `);
      newTab.document.close();
    } catch {
      newTab.location.replace(fileUrl);
    }
  } else {
    URL.revokeObjectURL(fileUrl);
    newTab.close();

    alert(`Preview is not supported for ${fileName}. Please use Download.`);
    return;
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(fileUrl);
  }, 120_000);
}

/**
 * Central function to fetch, identify, and view any document.
 */
export async function viewDocumentFile(
  doc: DocumentViewerTarget,
  options?: DocumentViewerOptions
): Promise<void> {
  if (!doc?.id) return;

  if (options?.checkAccess !== false && doc.hasAccess === false) {
    alert("You do not have permission to view this document.");
    return;
  }

  const newTab = window.open("", "_blank");
  if (!newTab) {
    alert("Please allow pop-ups to view the document.");
    return;
  }

  try {
    const endpoint = options?.endpoint || `/dms-document/download/${doc.id}`;
    const response = await axiosInstance.get(endpoint, {
      responseType: "blob",
    });

    console.log("Document title:", doc.title);
    console.log("Response headers:", response.headers);
    console.log(
      "Content-Disposition:",
      response.headers["content-disposition"]
    );
    console.log("Blob type:", response.data.type);
    console.log("Blob size:", response.data.size);

    const responseBlob = response.data as Blob;
    if (!responseBlob || responseBlob.size === 0) {
      throw new Error("The document is empty.");
    }

    let fileName = getOriginalFileName(
      response.headers,
      doc.fileName || doc.title || `document-${doc.id}`
    );

    let mimeType = getMimeType(
      fileName,
      response.headers["content-type"] || responseBlob.type,
      String(doc.fileType || doc.type || "")
    );

    const magicSniff = await detectFileTypeFromBuffer(
      responseBlob,
      fileName,
      mimeType
    );
    mimeType = magicSniff.mimeType;
    fileName = magicSniff.fileName;

    fileName = ensureFileExtension(fileName, mimeType);

    const excelCheck = await detectExcelWorkbook(
      responseBlob,
      fileName,
      mimeType
    );
    mimeType = excelCheck.mimeType;
    fileName = excelCheck.fileName;

    console.log("Resolved filename:", fileName);
    console.log("Detected MIME type:", mimeType);
    console.log("Metadata fileType:", doc.fileType);
    console.log("Metadata type:", doc.type);
    console.log("Downloaded Blob size:", responseBlob.size);

    const blob = new Blob([responseBlob], { type: mimeType });

    await renderFileInTab({
      blob,
      fileName,
      mimeType,
      newTab,
      workbook: excelCheck.workbook,
    });

    options?.onSuccess?.();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Document preview failed:", error);

    if (newTab && !newTab.closed) {
      newTab.document.open();
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Preview Error</title>
          </head>
          <body style="font-family:Arial,sans-serif;padding:24px">
            <h2>Unable to preview document</h2>
            <pre style="white-space:pre-wrap;color:#b91c1c">${DOMPurify.sanitize(message)}</pre>
            <p>Check the browser console for additional details.</p>
          </body>
        </html>
      `);
      newTab.document.close();
    }

    const status = (error as any)?.response?.status;
    if (status === 401) {
      alert("Your session has expired. Please sign in again.");
    } else if (status === 403) {
      alert("You do not have permission to view this document.");
    } else if (status === 404) {
      alert("The document was not found.");
    } else {
      console.error("Preview error details:", message);
    }

    options?.onError?.(error);
  }
}

/**
 * Central function to fetch, identify, and download any document.
 */
export async function downloadDocumentFile(
  doc: DocumentViewerTarget,
  options?: DocumentViewerOptions
): Promise<void> {
  if (!doc?.id) return;

  if (options?.checkAccess !== false && doc.hasAccess === false) {
    alert("You do not have permission to download this document.");
    return;
  }

  try {
    const endpoint = options?.endpoint || `/dms-document/download/${doc.id}`;
    const response = await axiosInstance.get(endpoint, {
      responseType: "blob",
    });

    const responseBlob = response.data as Blob;
    if (!responseBlob || responseBlob.size === 0) {
      throw new Error("The downloaded document is empty.");
    }

    let fileName = getOriginalFileName(
      response.headers,
      doc.fileName || doc.title || `document-${doc.id}`
    );

    let mimeType = getMimeType(
      fileName,
      response.headers["content-type"] || responseBlob.type,
      String(doc.fileType || doc.type || "")
    );

    const magicSniff = await detectFileTypeFromBuffer(
      responseBlob,
      fileName,
      mimeType
    );
    mimeType = magicSniff.mimeType;
    fileName = magicSniff.fileName;

    fileName = ensureFileExtension(fileName, mimeType);

    const excelCheck = await detectExcelWorkbook(
      responseBlob,
      fileName,
      mimeType
    );
    mimeType = excelCheck.mimeType;
    fileName = excelCheck.fileName;

    const blob = new Blob([responseBlob], { type: mimeType });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 60_000);

    options?.onSuccess?.();
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 401) {
      alert("Your session has expired. Please sign in again.");
    } else if (status === 403) {
      alert("You do not have permission to download this document.");
    } else if (status === 404) {
      alert("Document not found.");
    } else {
      console.error("Document download error:", error);
      alert("Failed to download the document. Please try again.");
    }

    options?.onError?.(error);
  }
}

/**
 * React hook to manage viewing and downloading state.
 */
export function useDocumentViewer() {
  const [isViewing, setIsViewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const viewDocument = useCallback(
    async (doc: DocumentViewerTarget, options?: DocumentViewerOptions) => {
      setIsViewing(true);
      try {
        await viewDocumentFile(doc, options);
      } finally {
        setIsViewing(false);
      }
    },
    []
  );

  const downloadDocument = useCallback(
    async (doc: DocumentViewerTarget, options?: DocumentViewerOptions) => {
      setIsDownloading(true);
      try {
        await downloadDocumentFile(doc, options);
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  return {
    viewDocument,
    downloadDocument,
    isViewing,
    isDownloading,
  };
}

export interface DocumentViewerProps {
  document: DocumentViewerTarget;
  hasAccess?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  showViewButton?: boolean;
  showDownloadButton?: boolean;
  viewButtonLabel?: string;
  downloadButtonLabel?: string;
  className?: string;
  renderTrigger?: (actions: {
    handleView: () => Promise<void>;
    handleDownload: () => Promise<void>;
    isViewing: boolean;
    isDownloading: boolean;
  }) => React.ReactNode;
}

/**
 * Reusable DocumentViewer component that can render View/Download buttons or a custom trigger.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  hasAccess = true,
  onView,
  onDownload,
  showViewButton = true,
  showDownloadButton = true,
  viewButtonLabel = "View",
  downloadButtonLabel = "Download",
  className = "flex items-center gap-2",
  renderTrigger,
}) => {
  const { viewDocument, downloadDocument, isViewing, isDownloading } =
    useDocumentViewer();

  const handleView = async () => {
    if (!hasAccess) {
      alert("You do not have permission to view this document.");
      return;
    }
    await viewDocument(document, { checkAccess: false });
    onView?.();
  };

  const handleDownload = async () => {
    if (!hasAccess) {
      alert("You do not have permission to download this document.");
      return;
    }
    await downloadDocument(document, { checkAccess: false });
    onDownload?.();
  };

  if (renderTrigger) {
    return (
      <>
        {renderTrigger({
          handleView,
          handleDownload,
          isViewing,
          isDownloading,
        })}
      </>
    );
  }

  return (
    <div className={className}>
      {showViewButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleView}
          disabled={isViewing || !hasAccess}
          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          {isViewing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          {viewButtonLabel}
        </Button>
      )}

      {showDownloadButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={isDownloading || !hasAccess}
          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {downloadButtonLabel}
        </Button>
      )}
    </div>
  );
};

export default DocumentViewer;
