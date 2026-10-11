import { unzipSync } from "fflate";

const MAX_EXTRACTED_BYTES = 5 * 1024 * 1024;

function decodeXml(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function textFromXml(bytes: Uint8Array, spreadsheet = false) {
  let xml = new TextDecoder().decode(bytes);
  if (spreadsheet)
    xml = xml
      .replace(/<\/c>/g, "\t")
      .replace(/<\/row>/g, "\n")
      .replace(/<\/si>/g, "\n");
  else xml = xml.replace(/<w:tab\s*\/>/g, "\t").replace(/<\/w:p>/g, "\n");
  return decodeXml(xml.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n"));
}

function openOfficeArchive(
  bytes: Uint8Array,
  accept: (name: string) => boolean,
) {
  let expanded = 0;
  return unzipSync(bytes, {
    filter(file) {
      if (!accept(file.name) || file.originalSize > MAX_EXTRACTED_BYTES)
        return false;
      expanded += file.originalSize;
      return expanded <= MAX_EXTRACTED_BYTES;
    },
  });
}

export async function extractDocumentText(bytes: Uint8Array, mimeType: string) {
  const buffer = Buffer.from(bytes);
  if (mimeType === "text/csv") return buffer.toString("utf8").slice(0, 100_000);
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const files = openOfficeArchive(
      bytes,
      (name) => name === "word/document.xml",
    );
    const document = files["word/document.xml"];
    return document ? textFromXml(document).slice(0, 100_000) : "";
  }
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const files = openOfficeArchive(
      bytes,
      (name) =>
        name === "xl/sharedStrings.xml" ||
        /^xl\/worksheets\/sheet\d+\.xml$/.test(name),
    );
    return Object.entries(files)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, data]) => `# ${name}\n${textFromXml(data, true)}`)
      .join("\n")
      .slice(0, 100_000);
  }
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.slice(0, 100_000);
  }
  return "";
}
