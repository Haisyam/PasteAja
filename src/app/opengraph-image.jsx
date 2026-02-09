import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background: "linear-gradient(135deg, #000000 0%, #121212 100%)",
          color: "#ffffff",
          fontFamily:
            "Roboto Flex, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              border: "2px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 28,
                height: 34,
                borderRadius: 6,
                border: "2px solid #ffffff",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: 8, left: 5, width: 16, height: 2, background: "#ffffff", borderRadius: 99 }} />
              <div style={{ position: "absolute", top: 14, left: 5, width: 16, height: 2, background: "#ffffff", borderRadius: 99 }} />
              <div style={{ position: "absolute", top: 20, left: 5, width: 11, height: 2, background: "#ffffff", borderRadius: 99 }} />
            </div>
          </div>
          <span>PasteAja</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 66, lineHeight: 1.05, fontWeight: 800 }}>
            Pastebin Aman untuk Teks Kamu
          </div>
          <div style={{ fontSize: 28, color: "#e5e7eb" }}>
            Simpan, proteksi password, atur kedaluwarsa, dan bagikan dengan link.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#d1d5db",
          }}
        >
          <span>pasteaja</span>
          <span>Next.js + Turso + shadcn/ui</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
