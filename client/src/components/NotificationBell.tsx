import { useNavigate } from 'react-router-dom'
import { BellIcon } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import type { Notification } from '@/types'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()

  const recent = notifications.slice(0, 8)

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id)
    if (notification.link) navigate(notification.link)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((notification) => (
                <li key={notification.id}>
                  <button
                    onClick={() => handleClick(notification)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex w-full items-center gap-2">
                      {!notification.isRead && (
                        <span className="size-1.5 shrink-0 rounded-full bg-orange-500" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {notification.title}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t px-3 py-2">
          <button
            onClick={() => navigate('/notifications')}
            className="text-xs text-orange-400 hover:underline"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
