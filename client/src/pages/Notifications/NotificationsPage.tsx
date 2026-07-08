import { useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  Star,
  Milestone,
  UserPlus,
  Bell as BellIcon,
  type LucideIcon,
} from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import type { Notification, NotificationType } from '@/types'

const typeConfig: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  PROPOSAL_STATUS_CHANGED: { icon: RefreshCw, className: 'bg-yellow-500/10 text-yellow-400' },
  REVIEW_SUBMITTED: { icon: Star, className: 'bg-orange-500/10 text-orange-400' },
  MILESTONE_STATUS_CHANGED: { icon: Milestone, className: 'bg-slate-500/10 text-slate-400' },
  REVIEWER_ASSIGNED: { icon: UserPlus, className: 'bg-purple-500/10 text-purple-400' },
}

const NotificationsPage = () => {
  const { notifications, unreadCount, isLoading, hasMore, loadMore, markAsRead, markAllAsRead } =
    useNotifications()
  const navigate = useNavigate()

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id)
    if (notification.link) navigate(notification.link)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col gap-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <BellIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type] ?? typeConfig.PROPOSAL_STATUS_CHANGED
                const Icon = config.icon
                return (
                  <li key={notification.id}>
                    <button
                      onClick={() => handleClick(notification)}
                      className="flex w-full items-start gap-3 px-6 py-4 text-left hover:bg-muted/50"
                    >
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.className}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!notification.isRead && (
                            <span className="size-1.5 shrink-0 rounded-full bg-orange-500" />
                          )}
                          <span className="text-sm font-medium">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={isLoading} onClick={() => loadMore()}>
            {isLoading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
