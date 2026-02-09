import "server-only";

import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const generate = customAlphabet(alphabet, 10);

export function generatePasteId() {
  return generate();
}

export function generateAccessToken() {
  return customAlphabet(alphabet, 48)();
}

export function generateEditorAccessKey() {
  return customAlphabet(alphabet, 24)();
}
