import "./globals.css"
import { Providers } from "./providers"
import Navbar from "@/components/navbar"
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}