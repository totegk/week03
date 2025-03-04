import { Campaign } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency } from '@/lib/utils'

interface CampaignSelectProps {
  campaigns: Campaign[]
  selectedId: string
  onSelect: (id: string) => void
}

export function CampaignSelect({ campaigns, selectedId, onSelect }: CampaignSelectProps) {
  const { settings } = useSettings()
  const selectedCampaign = campaigns.find(c => c.id === selectedId)

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger
          className="h-14 px-4 text-lg bg-white border-2 hover:bg-gray-50 transition-colors"
        >
          <SelectValue placeholder="Select a campaign">
            {selectedCampaign && (
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">{selectedCampaign.name}</span>
                <span className="text-gray-500 ml-8">
                  {formatCurrency(selectedCampaign.totalCost || 0, settings.currency)}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className="bg-white border-2 shadow-xl"
          align="center"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {campaigns.map((campaign) => (
              <SelectItem
                key={campaign.id}
                value={campaign.id}
                className="h-12 hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{campaign.name}</span>
                  <span className="text-gray-500 ml-8">
                    {formatCurrency(campaign.totalCost || 0, settings.currency)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
} 