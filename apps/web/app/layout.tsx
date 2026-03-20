import { Geist_Mono, Inter, Figtree } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { cn } from "@workspace/ui/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = Figtree({
  subsets: ["latin"],
  variable: "--font-heading",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontHeading.variable, fontMono.variable, "font-sans")}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
