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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 74,
              height: 74,
              alignItems: "center",
              justifyContent: "center",
              color: "#031522",
              background: "linear-gradient(145deg, #44e9ed, #dfff62)",
              border: "2px solid rgba(255,255,255,.55)",
              borderRadius: 37,
              boxShadow: "0 0 34px rgba(53,242,223,.35)",
              fontSize: 46,
              fontWeight: 900,
            }}
          >
            P
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
            Pitch<span style={{ color: "#72ed9a" }}>Pond</span>
          </div>
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
