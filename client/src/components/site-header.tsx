import { useAuth } from "@/context/AuthContext"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const roleBadgeColor: Record<string, string> = {
  ADMIN: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  REVIEWER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  APPLICANT: 'bg-green-500/10 text-green-400 border-green-500/20',
}

export function SiteHeader() {
  const { user } = useAuth()

  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b px-4 py-3">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          TTDF R&D Grant Management Platform
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Welcome, <span className="text-foreground font-medium">{user?.name}</span>
          </span>
          {user?.role && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadgeColor[user.role]}`}>
              {user.role}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}