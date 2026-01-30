import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TopNetworks - Generador de Contenido para Redes Sociales",
  description:
    "Generador profesional de contenido para redes sociales optimizado con IA by TopNetworks",
  icons: {
    icon: [
      {
        url: "https://storage.googleapis.com/media-topfinanzas-com/favicon.png",
        sizes: "any",
      },
      {
        url: "https://storage.googleapis.com/media-topfinanzas-com/favicon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: "https://storage.googleapis.com/media-topfinanzas-com/favicon.png",
    shortcut:
      "https://storage.googleapis.com/media-topfinanzas-com/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={poppins.variable}>
      <head>
        <link
          rel="icon"
          href="https://storage.googleapis.com/media-topfinanzas-com/favicon.png"
          sizes="any"
        />
        <link
          rel="icon"
          href="https://storage.googleapis.com/media-topfinanzas-com/favicon.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="https://storage.googleapis.com/media-topfinanzas-com/favicon.png"
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <div className="min-h-screen bg-linear-to-br from-lime-50 via-cyan-50 to-blue-100">
          {children}
        </div>
      </body>
    </html>
  );
}
