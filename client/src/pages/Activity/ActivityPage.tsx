import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getActivityApi } from '@/api/activity.api'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FilePlus,
  Send,
  RefreshCw,
  DollarSign,
  UserPlus,
  Star,
  Milestone,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react'

const PAGE_SIZE = 25

const actionConfig: Record<string, { label: string; icon: LucideIcon; className: string }> = {
  PROPOSAL_CREATED: { label: 'Proposal created', icon: FilePlus, className: 'bg-blue-500/10 text-blue-400' },
  PROPOSAL_SUBMITTED: { label: 'Proposal submitted', icon: Send, className: 'bg-blue-500/10 text-blue-400' },
  PROPOSAL_STATUS_CHANGED: { label: 'Status changed', icon: RefreshCw, className: 'bg-yellow-500/10 text-yellow-400' },
  PROPOSAL_FUNDED: { label: 'Proposal funded', icon: DollarSign, className: 'bg-green-500/10 text-green-400' },
  REVIEWER_ASSIGNED: { label: 'Reviewer assigned', icon: UserPlus, className: 'bg-purple-500/10 text-purple-400' },
  REVIEW_SUBMITTED: { label: 'Review submitted', icon: Star, className: 'bg-orange-500/10 text-orange-400' },
  MILESTONE_STATUS_CHANGED: { label: 'Milestone updated', icon: Milestone, className: 'bg-slate-500/10 text-slate-400' },
}

const fallbackConfig = { label: 'Activity', icon: ActivityIcon, className: 'bg-slate-500/10 text-slate-400' }

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(isoDate).toLocaleDateString()
}

const ActivityPage = () => {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [actionFilter, setActionFilter] = useState('')

  const { data: activities = [], isLoading, isFetching } = useQuery({
    queryKey: ['activity', limit],
    queryFn: () => getActivityApi(limit),
  })

  const actionTypes = useMemo(
    () => Array.from(new Set(activities.map((a) => a.action))).sort(),
    [activities]
  )

  const filtered = useMemo(
    () => (actionFilter ? activities.filter((a) => a.action === actionFilter) : activities),
    [activities, actionFilter]
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Recent actions across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md bg-input border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Activity</option>
          {actionTypes.map((action) => (
            <option key={action} value={action}>
              {actionConfig[action]?.label ?? action}
            </option>
          ))}
        </select>
      </div>

      {/* Feed */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No activity yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((entry) => {
                const config = actionConfig[entry.action] ?? fallbackConfig
                const Icon = config.icon
                return (
                  <li key={entry.id} className="flex items-start gap-3 px-6 py-4">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.className}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {entry.user?.name ?? 'Unknown user'}
                        </span>
                        {entry.user?.role && <RoleBadge role={entry.user.role} />}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {entry.description}
                      </p>
                      {entry.proposal && (
                        <Link
                          to={`/proposals/${entry.proposal.id}`}
                          className="text-xs text-orange-400 hover:underline mt-1 inline-block"
                        >
                          {entry.proposal.title}
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Load more */}
      {activities.length >= limit && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
          >
            {isFetching ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ActivityPage
