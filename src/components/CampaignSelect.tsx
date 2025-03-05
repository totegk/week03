import { Campaign } from '@/lib/types'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency } from '@/lib/utils'

interface CampaignSelectProps {
  campaigns: Campaign[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function CampaignSelect({ campaigns, selectedId, onSelect }: CampaignSelectProps) {
  const { settings } = useSettings()

  return (
    <div className="mb-8">
      <label htmlFor="campaign" className="block text-lg font-semibold text-gray-900 mb-3">
        Select Campaign
      </label>
      <select
        id="campaign"
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full px-4 py-3 text-base rounded-lg border border-gray-200 bg-white shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-gray-300 transition-colors"
      >
        <option value="">All Campaigns</option>
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.name} ({formatCurrency(campaign.totalCost, settings.currency)})
          </option>
        ))}
      </select>
    </div>
  )
} 