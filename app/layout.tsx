import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIP Club — Client Management & Retention",
  description:
    "VIP Club helps salons, barbershops, and beauty studios manage clients, appointments, rewards, messaging, referrals, and automated follow-ups from one platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3A2C30",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-ink">{children}</body>
    </html>
  );
}
