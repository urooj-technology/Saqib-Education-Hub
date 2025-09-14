import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientProviders from "../components/ClientProviders";

export const metadata = {
  title: "Noor Saqib Education Hub",
  description: "Professional multilingual educational platform for books, jobs, scholarships, articles, and educational videos",
  keywords: "education, books, jobs, scholarships, articles, videos, Pashto, Dari, English",
  authors: [{ name: "Noor Saqib Education Hub" }],
  robots: "index, follow",
  openGraph: {
    title: "Noor Saqib Education Hub",
    description: "Professional multilingual educational platform",
    type: "website",
    locale: "en_US",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
        <ToastContainer />
      </body>
    </html>
  );
}
