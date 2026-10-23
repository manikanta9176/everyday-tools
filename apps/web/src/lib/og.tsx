import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function renderOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f6f4ef",
        color: "#1c1917",
        padding: "64px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#5b46c7",
            color: "#f7f4ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          T
        </div>
        <div style={{ marginLeft: 18, fontSize: 32, color: "#5b46c7" }}>Tools</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
        <div style={{ fontSize: 68, fontWeight: 650, lineHeight: 1.05, letterSpacing: -1.5 }}>{title}</div>
        <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "#57534e" }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: 24, color: "#78716c" }}>tools.manikanta.net</div>
    </div>,
    ogSize,
  );
}
