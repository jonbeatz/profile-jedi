import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { SettingsProvider } from '@/components/settings-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Profile Jedi — Hermes Profile Switcher',
  description:
    'A premium control panel for switching, creating, and adopting AI agent profiles in the Hermes operating system.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#070708',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} bg-background`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SettingsProvider>{children}</SettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'glass-strong !text-foreground',
              success: '!border-success/40 [&_[data-icon]]:!text-success',
              error:
                '!border-danger/50 !bg-danger/10 [&_[data-title]]:!text-danger [&_[data-icon]]:!text-danger',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
