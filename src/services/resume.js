import { parseDocument } from "./ats";

export async function parseResumePdf(file) {
  return parseDocument(file);
}
