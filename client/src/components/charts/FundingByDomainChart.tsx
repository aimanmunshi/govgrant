import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import axiosInstance from '@/api/axiosInstance'
import { Proposal, PaginatedResponse } from '@/types'

const MAX_DOMAINS = 7

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString()}`
}

interface TooltipPayload {
  active?: boolean
  payload?: { payload: { domain: string; amount: number } }[]
}

const ChartTooltip = ({ active, payload }: TooltipPayload) => {
  if (!active || !payload?.length) return null
  const { domain, amount } = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{domain}</p>
      <p className="text-sm font-semibold text-popover-foreground">
        {formatCurrency(amount)}
      </p>
    </div>
  )
}

export function FundingByDomainChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['proposals', 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/proposals?limit=100')
      return response.data.data as PaginatedResponse<Proposal>
    },
  })

  const chartData = useMemo(() => {
    const proposals = data?.proposals ?? []
    const committed = proposals.filter(
      (p) => p.status === 'APPROVED' || p.status === 'FUNDED'
    )

    const totals = new Map<string, number>()
    for (const p of committed) {
      totals.set(p.domain, (totals.get(p.domain) ?? 0) + p.fundingAmount)
    }

    const sorted = Array.from(totals.entries())
      .map(([domain, amount]) => ({ domain, amount }))
      .sort((a, b) => b.amount - a.amount)

    if (sorted.length <= MAX_DOMAINS) return sorted

    const head = sorted.slice(0, MAX_DOMAINS - 1)
    const otherTotal = sorted
      .slice(MAX_DOMAINS - 1)
      .reduce((sum, d) => sum + d.amount, 0)
    return [...head, { domain: 'Other', amount: otherTotal }]
  }, [data])

  return (
    <Card className="viz-root">
      <style>{`
        .viz-root {
          --chart-blue: #2a78d6;
          --chart-grid: var(--border);
        }
        .dark .viz-root {
          --chart-blue: #3987e5;
        }
      `}</style>
      <CardHeader>
        <CardTitle>Funding by Domain</CardTitle>
        <CardDescription>
          Committed funding (approved + funded) across research domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No approved or funded proposals yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 48)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
              barCategoryGap={10}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--chart-grid)"
                strokeDasharray="0"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="domain"
                width={150}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              />
              <Bar dataKey="amount" barSize={22} radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.domain} fill="var(--chart-blue)" />
                ))}
                <LabelList
                  dataKey="amount"
                  position="right"
                  formatter={(v: unknown) => formatCurrency(Number(v))}
                  fill="var(--muted-foreground)"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
