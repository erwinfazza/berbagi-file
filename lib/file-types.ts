export const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "xlsx",
  "odt",
  "ppt",
  "psd",
  "svg",
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export const DEFAULT_MAX_FILE_SIZE = 25 * 1024 * 1024;

export const CONTENT_TYPES: Record<AllowedExtension, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  odt: "application/vnd.oasis.opendocument.text",
  ppt: "application/vnd.ms-powerpoint",
  psd: "image/vnd.adobe.photoshop",
  svg: "image/svg+xml",
};

export function getMaxFileSize(): number {
  const configured = Number(process.env.MAX_FILE_SIZE);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_FILE_SIZE;
}

export function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index + 1).toLowerCase();
}

export function isAllowedFileName(fileName: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(
    getExtension(fileName),
  );
}

export function contentTypeFor(fileName: string): string {
  const extension = getExtension(fileName) as AllowedExtension;
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
