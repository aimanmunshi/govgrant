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
import { Proposal, PaginatedResponse, ProposalStatus } from '@/types'

// Pipeline order — an ordinal ramp reads the progression left to right.
// REJECTED is a terminal exit from the pipeline, not "further along" it,
// so it takes a distinct hue instead of continuing the ramp.
const PIPELINE_STATUSES: ProposalStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'FUNDED',
]

const STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FUNDED: 'Funded',
}

interface TooltipPayload {
  active?: boolean
  payload?: { payload: { status: ProposalStatus; count: number } }[]
}

const ChartTooltip = ({ active, payload }: TooltipPayload) => {
  if (!active || !payload?.length) return null
  const { status, count } = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</p>
      <p className="text-sm font-semibold text-popover-foreground">
        {count} proposal{count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function ProposalStatusChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['proposals', 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/proposals?limit=100')
      return response.data.data as PaginatedResponse<Proposal>
    },
  })

  const chartData = useMemo(() => {
    const proposals = data?.proposals ?? []
    const counts = new Map<ProposalStatus, number>()
    for (const p of proposals) {
      counts.set(p.status, (counts.get(p.status) ?? 0) + 1)
    }
    const order: ProposalStatus[] = [...PIPELINE_STATUSES, 'REJECTED']
    return order.map((status) => ({ status, count: counts.get(status) ?? 0 }))
  }, [data])

  const total = chartData.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="viz-root">
      <style>{`
        .viz-root {
          --chart-grid: var(--border);
          --pipeline-1: #86b6ef;
          --pipeline-2: #5598e7;
          --pipeline-3: #2a78d6;
          --pipeline-4: #1c5cab;
          --pipeline-5: #104281;
          --pipeline-rejected: #e34948;
        }
        .dark .viz-root {
          --pipeline-1: #cde2fb;
          --pipeline-2: #9ec5f4;
          --pipeline-3: #6da7ec;
          --pipeline-4: #3987e5;
          --pipeline-5: #184f95;
          --pipeline-rejected: #e66767;
        }
      `}</style>
      <CardHeader>
        <CardTitle>Proposal Pipeline</CardTitle>
        <CardDescription>
          {total} proposal{total !== 1 ? 's' : ''} by current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : total === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No proposals yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 24, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid
                vertical={false}
                stroke="var(--chart-grid)"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="status"
                tickFormatter={(s: ProposalStatus) => STATUS_LABELS[s]}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              />
              <Bar dataKey="count" barSize={24} radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={
                      entry.status === 'REJECTED'
                        ? 'var(--pipeline-rejected)'
                        : `var(--pipeline-${PIPELINE_STATUSES.indexOf(entry.status) + 1})`
                    }
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="var(--muted-foreground)"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
