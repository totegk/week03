// src/components/CalculatedMetrics.tsx

import { Card } from '@/components/ui/card'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { DailyMetrics } from '@/lib/types'

interface CalculatedMetricsProps {
  metrics: DailyMetrics
  onMetricClick: (metric: keyof DailyMetrics) => void
  selectedMetrics: string[]
}

interface MetricCardProps {
  label: string
  value: string
  isSelected: boolean
  onClick: () => void
}

function MetricCard({ label, value, isSelected, onClick }: MetricCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Card>
  )
}

export function CalculatedMetricsDisplay({ 
  metrics, 
  onMetricClick,
  selectedMetrics 
}: CalculatedMetricsProps) {
  const { settings } = useSettings()

  return (
    <div className="grid grid-cols-8 gap-4">
      <MetricCard
        label="CTR"
        value={formatPercent(metrics.CTR)}
        isSelected={selectedMetrics.includes('CTR')}
        onClick={() => onMetricClick('CTR')}
      />
      <MetricCard
        label="CvR"
        value={formatPercent(metrics.CvR)}
        isSelected={selectedMetrics.includes('CvR')}
        onClick={() => onMetricClick('CvR')}
      />
      <MetricCard
        label="CPA"
        value={formatCurrency(metrics.CPA, settings.currency)}
        isSelected={selectedMetrics.includes('CPA')}
        onClick={() => onMetricClick('CPA')}
      />
      <MetricCard
        label="ROAS"
        value={metrics.ROAS.toFixed(2) + 'x'}
        isSelected={selectedMetrics.includes('ROAS')}
        onClick={() => onMetricClick('ROAS')}
      />
    </div>
  )
} 