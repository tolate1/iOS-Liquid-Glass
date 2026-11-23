import "@ios-liquid-glass/web/styles.css";
import { GlassProvider } from "@ios-liquid-glass/web/react";

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body><GlassProvider theme="neutral-light">{children}</GlassProvider></body>
    </html>
  );
}
