import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hand-Controlled 3D Tree",
  description: "Interactive Point Cloud controlled by MediaPipe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden m-0 p-0">
        {children}
      </body>
    </html>
  );
}