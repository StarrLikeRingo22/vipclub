import QRCode from "qrcode";

// Server-side QR → inline SVG string (scannable, on-brand colors).
export async function qrSvg(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    margin: 1,
    color: { dark: "#3A2C30", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
}
