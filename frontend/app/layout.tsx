import type { Metadata } from "next";
import { AIAdvisorChat } from "@/components/AIAdvisorChat";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImpactPulse",
  description: "Verified impact investing for people who want proof, not slogans.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,620&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@380;520;640&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavBar />
        {children}
        <AIAdvisorChat />
      </body>
    </html>
  );
}
