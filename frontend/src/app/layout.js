import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientProviders from "../components/ClientProviders";
import PageLoader from "../components/PageLoader";
import RouterWrapper from "../components/RouterWrapper";

export const metadata = {
  title: "Noor Saqib Education Hub",
  description: "Professional multilingual educational platform for books, jobs, scholarships, articles, and educational videos",
  keywords: "education, books, jobs, scholarships, articles, videos, Pashto, Dari, English",
  authors: [{ name: "Noor Saqib Education Hub" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo/Logo Designe.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/Logo Designe.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/logo/Logo Designe.png",
    apple: "/logo/Logo Designe.png",
  },
  openGraph: {
    title: "Noor Saqib Education Hub",
    description: "Professional multilingual educational platform",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo/Logo Designe.png",
        width: 1200,
        height: 630,
        alt: "Noor Saqib Education Hub Logo",
      },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/Logo Designe.png" type="image/png" />
        <link rel="shortcut icon" href="/logo/Logo Designe.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/Logo Designe.png" />
      </head>
      <body className="antialiased">
        <ClientProviders>
          <RouterWrapper>
            <PageLoader />
            {children}
          </RouterWrapper>
        </ClientProviders>
        <ToastContainer />
      </body>
    </html>
  );
}
