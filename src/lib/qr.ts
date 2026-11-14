import QRCode from "qrcode";

/**
 * Render a QR code as an inline SVG string at build time (prerendered pages
 * only — no QR library ships to the browser). Dark modules on white with the
 * spec's 4-module quiet zone, so it scans on any background.
 */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 4,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
