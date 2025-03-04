'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/sheetsData'
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { Toaster } from "@/components/ui/toaster"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <SettingsProvider>
        {children}
        <Toaster />
      </SettingsProvider>
    </SWRConfig>
  )
}