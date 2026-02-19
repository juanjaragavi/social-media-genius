import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Suspense } from "react";
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
      <body className={`${poppins.className} antialiased overflow-hidden`}>
        <div className="h-screen w-screen overflow-hidden bg-white">
          {children}
        </div>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <Suspense fallback={null}>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
