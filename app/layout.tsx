import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ritimu",
  description: "Estude, evolua e conquiste no seu ritmo.",
  applicationName: "Ritimu",
  icons: {
    icon: "/logoDoIcone.png",
    shortcut: "/logoDoIcone.png",
    apple: "/logoDoIcone.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth.api.getSession({ headers: await headers() });
  const preference = session ? await prisma.studyPreference.findUnique({ where: { userId: session.user.id }, select: { plannerTheme: true } }) : null;
  const darkTheme = preference?.plannerTheme !== "LIGHT";
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, session && darkTheme && "dark")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
