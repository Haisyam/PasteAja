import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "radial-gradient(circle at top right, #1a1a1a 0%, #0b0b0f 45%, #000000 100%)",
          color: "#ffffff",
          fontFamily:
            "Roboto Flex, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              border: "2px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 30,
                borderRadius: 6,
                border: "2px solid #ffffff",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: 7, left: 4, width: 14, height: 2, background: "#ffffff", borderRadius: 99 }} />
              <div style={{ position: "absolute", top: 13, left: 4, width: 14, height: 2, background: "#ffffff", borderRadius: 99 }} />
              <div style={{ position: "absolute", top: 19, left: 4, width: 9, height: 2, background: "#ffffff", borderRadius: 99 }} />
            </div>
          </div>
          <span style={{ fontSize: 40 }}>PasteAja</span>
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
          Berbagi Teks dengan Aman
        </div>
        <div style={{ fontSize: 30, marginTop: 18, color: "#e5e7eb" }}>
          Protected paste, access key edit, raw endpoint, dan expiration.
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
