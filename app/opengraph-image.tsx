import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rahul · Backend Engineer";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "flex-end",
          background: "#0a0a0a",
          color: "#e8e8e8",
          padding: 88,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 96, fontStyle: "italic", lineHeight: 1 }}>
          i go all in.
          <div style={{ width: 30, height: 62, background: "#e5484d", marginLeft: 10, marginBottom: 8 }} />
        </div>
        <div style={{ fontSize: 30, color: "#969696", marginTop: 28, letterSpacing: 2 }}>
          RAHUL · BACKEND ENGINEER · DELHI
        </div>
      </div>
    ),
    size,
  );
}
