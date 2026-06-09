import {
  LayoutDashboard,
  FileText,
  Milestone,
  Star,
  Users,
  Activity,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/context/AuthContext"
import { Link, useLocation } from "react-router-dom"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Proposals", url: "/proposals", icon: FileText },
  { title: "Milestones", url: "/milestones", icon: Milestone },
  { title: "Reviews", url: "/reviews", icon: Star },
]

const navAdmin = [
  { title: "Users", url: "/users", icon: Users },
  { title: "Activity Log", url: "/activity", icon: Activity },
]

const navSecondary = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Get Help", url: "/help", icon: HelpCircle },
  { title: "Search", url: "/search", icon: Search },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" asChild>
        <Link to="/dashboard">
          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm shrink-0">
            G
          </div>
          <div className="grid flex-1 text-left text-sm leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">GovGrant</span>
            <span className="text-xs text-muted-foreground">TTDF Platform</span>
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin only navigation */}
        {user?.role === 'ADMIN' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <NavUser user={{
            name: user.name,
            email: user.email,
            avatar: '',
          }} />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}