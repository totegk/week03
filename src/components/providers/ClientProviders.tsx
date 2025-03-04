'use client'

import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { Toaster } from "@/components/ui/toaster"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      {children}
      <Toaster />
    </SettingsProvider>
  )
}