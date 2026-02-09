import "server-only";

import { z } from "zod";

const MAX_PASTE_BYTES = 100 * 1024;
const MAX_PASSWORD_LENGTH = 128;
const MAX_TITLE_LENGTH = 120;

function utf8Bytes(value) {
  return Buffer.byteLength(value, "utf8");
}

export const createPasteSchema = z.object({
  title: z
    .string()
    .max(MAX_TITLE_LENGTH, "Title too long")
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
  content: z
    .string()
    .min(1, "Content is required")
    .refine((value) => utf8Bytes(value) <= MAX_PASTE_BYTES, {
      message: "Content exceeds maximum size of 100KB",
    }),
  visibility: z.enum(["public", "unlisted"]).default("unlisted"),
  expiration: z.enum(["10m", "1h", "1d", "1w", "never"]).default("never"),
  password: z
    .string()
    .max(MAX_PASSWORD_LENGTH, "Password too long")
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
});

export const unlockPasteSchema = z.object({
  password: z.string().min(1, "Password is required").max(MAX_PASSWORD_LENGTH),
});

export const unlockEditorSchema = z.object({
  accessKey: z.string().min(1, "Access key wajib diisi").max(128),
});

export const updatePasteSchema = z.object({
  title: z
    .string()
    .max(MAX_TITLE_LENGTH, "Title too long")
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
  content: z
    .string()
    .min(1, "Konten wajib diisi")
    .refine((value) => utf8Bytes(value) <= MAX_PASTE_BYTES, {
      message: "Konten melebihi batas 100KB",
    }),
});

export const constants = {
  MAX_PASTE_BYTES,
  MAX_PASSWORD_LENGTH,
  MAX_TITLE_LENGTH,
};
