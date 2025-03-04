import { Card } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function MetricCard({ 
  label, 
  value, 
  isSelected, 
  onClick,
  className = ''
}: MetricCardProps) {
  return (
    <Card
      className={`
        p-4 transition-all
        ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-orange-500/50' : ''}
        ${isSelected ? 'ring-2 ring-orange-500' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
    </Card>
  )
} 