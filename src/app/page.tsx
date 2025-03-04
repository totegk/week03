// src/app/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { fetchAllTabsData, getCampaigns } from '@/lib/sheetsData'
import type { AdMetric, DailyMetrics, TabData } from '@/lib/types'
import { calculateDailyMetrics } from '@/lib/metrics'
import { MetricCard } from '@/components/MetricCard'
import { MetricsChart } from '@/components/MetricsChart'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { formatCurrency, formatPercent, formatConversions } from '@/lib/utils'

type DisplayMetric = 'impr' | 'clicks' | 'CTR' | 'CPC' | 'cost' |
    'conv' | 'CvR' | 'CPA' | 'value' | 'ROAS' |
    'AOV' | 'imprShare' | 'lostBudget' | 'lostRank'

const metricConfig = {
    impr: { label: 'Impressions', format: (v: number) => v.toLocaleString(), row: 1 },
    clicks: { label: 'Clicks', format: (v: number) => v.toLocaleString(), row: 1 },
    CTR: { label: 'CTR', format: formatPercent, row: 1 },
    CPC: { label: 'CPC', format: (v: number, currency: string) => formatCurrency(v, currency), row: 1 },
    cost: { label: 'Cost', format: (v: number, currency: string) => formatCurrency(v, currency), row: 1 },
    conv: { label: 'Conv', format: formatConversions, row: 2 },
    CvR: { label: 'Conv Rate', format: formatPercent, row: 2 },
    CPA: { label: 'CPA', format: (v: number, currency: string) => formatCurrency(v, currency), row: 2 },
    value: { label: 'Value', format: (v: number, currency: string) => formatCurrency(v, currency), row: 2 },
    ROAS: { label: 'ROAS', format: (v: number) => v.toFixed(2) + 'x', row: 2 },
    AOV: { label: 'AOV', format: (v: number, currency: string) => formatCurrency(v, currency), row: 3 },
    imprShare: { label: 'Impr Share', format: formatPercent, row: 3 },
    lostBudget: { label: 'Lost IS% Budget', format: formatPercent, row: 3 },
    lostRank: { label: 'Lost IS% Rank', format: formatPercent, row: 3 }
} as const

export default function DashboardPage() {
    const { settings, setCampaigns, setSelectedCampaign } = useSettings()
    const [data, setData] = useState<AdMetric[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string>()
    const [selectedMetrics, setSelectedMetrics] = useState<[DisplayMetric, DisplayMetric]>(['cost', 'value'])

    useEffect(() => {
        if (!settings.sheetUrl) {
            setIsLoading(false)
            return
        }

        fetchAllTabsData(settings.sheetUrl)
            .then((allData: TabData) => {
                const dailyData = allData.daily || []
                setData(dailyData)

                const campaigns = getCampaigns(dailyData)
                setCampaigns(campaigns)

                if (!settings.selectedCampaign && campaigns.length > 0) {
                    setSelectedCampaign(campaigns[0].id)
                }
            })
            .catch((err: Error) => {
                console.error('Error loading data:', err)
                setError('Failed to load data. Please check your Sheet URL.')
            })
            .finally(() => setIsLoading(false))
    }, [settings.sheetUrl, setCampaigns, settings.selectedCampaign, setSelectedCampaign])

    const dailyMetrics = calculateDailyMetrics(
        settings.selectedCampaign
            ? data.filter(d => d.campaignId === settings.selectedCampaign)
            : data
    )

    const calculateTotals = () => {
        if (dailyMetrics.length === 0) return null

        const sums = dailyMetrics.reduce((acc, d) => ({
            impr: acc.impr + d.impr,
            clicks: acc.clicks + d.clicks,
            cost: acc.cost + d.cost,
            conv: acc.conv + d.conv,
            value: acc.value + d.value,
            imprShare: acc.imprShare + d.imprShare,
            lostBudget: acc.lostBudget + d.lostBudget,
            lostRank: acc.lostRank + d.lostRank
        }), {
            impr: 0, clicks: 0, cost: 0, conv: 0, value: 0,
            imprShare: 0, lostBudget: 0, lostRank: 0
        })

        return {
            ...sums,
            CTR: (sums.impr ? (sums.clicks / sums.impr) * 100 : 0),
            CPC: (sums.clicks ? sums.cost / sums.clicks : 0),
            CvR: (sums.clicks ? (sums.conv / sums.clicks) * 100 : 0),
            CPA: (sums.conv ? sums.cost / sums.conv : 0),
            ROAS: (sums.cost ? sums.value / sums.cost : 0),
            AOV: (sums.conv ? sums.value / sums.conv : 0),
            imprShare: sums.imprShare / dailyMetrics.length * 100,
            lostBudget: sums.lostBudget / dailyMetrics.length * 100,
            lostRank: sums.lostRank / dailyMetrics.length * 100
        }
    }

    const handleMetricClick = (metric: DisplayMetric) => {
        setSelectedMetrics(prev => [prev[1], metric])
    }

    if (isLoading) return <DashboardLayout>Loading...</DashboardLayout>
    if (!settings.sheetUrl) return <DashboardLayout>Please configure your Google Sheet URL in settings</DashboardLayout>
    if (dailyMetrics.length === 0) return <DashboardLayout>No data found</DashboardLayout>

    const totals = calculateTotals()
    if (!totals) return null

    return (
        <DashboardLayout error={error}>
            <div className="space-y-6">
                {[1, 2, 3].map(row => (
                    <div key={row} className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {Object.entries(metricConfig)
                            .filter(([_, config]) => config.row === row)
                            .map(([key, config]) => (
                                <MetricCard
                                    key={key}
                                    label={config.label}
                                    value={config.format(totals[key as DisplayMetric], settings.currency)}
                                    isSelected={selectedMetrics.includes(key as DisplayMetric)}
                                    onClick={() => handleMetricClick(key as DisplayMetric)}
                                />
                            ))}
                    </div>
                ))}

                <MetricsChart
                    data={dailyMetrics}
                    metric1={{
                        key: selectedMetrics[0],
                        label: metricConfig[selectedMetrics[0]].label,
                        color: '#1e40af',
                        format: (v: number) => metricConfig[selectedMetrics[0]].format(v, settings.currency)
                    }}
                    metric2={{
                        key: selectedMetrics[1],
                        label: metricConfig[selectedMetrics[1]].label,
                        color: '#ea580c',
                        format: (v: number) => metricConfig[selectedMetrics[1]].format(v, settings.currency)
                    }}
                />
            </div>
        </DashboardLayout>
    )
}

function DashboardLayout({ children, error }: { children: React.ReactNode, error?: string }) {
    return (
        <div className="container mx-auto px-4 py-12 mt-16">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Build the Agent - Participant Starter Agent</h1>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {children}
        </div>
    )
}