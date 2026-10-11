import { ImageResponse } from "next/og";

export const alt = "PitchPond — Fundability before fundraising";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px",
          color: "white",
          background:
            "radial-gradient(circle at 70% 20%, #147e8e 0, #071a2a 48%, #030b14 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#59e5c8",
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          PitchPond
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 30,
          }}
        >
          <span>Fundability before</span>
          <span style={{ color: "#d9f86c" }}>fundraising.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#c5d9e2",
            marginTop: 34,
          }}
        >
          Evidence-first readiness and explainable matching for Filipino
          ventures.
        </div>
      </div>
    ),
    size,
  );
}
