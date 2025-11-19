import {
  Home,
  Users,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
  Clock,
  Settings,
  LogOut,
  UserCog,
  Briefcase,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoUrl from "@assets/Innovare logo_1763555308154.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
    ],
  },
  {
    label: "Employee Management",
    items: [
      {
        title: "Employees",
        url: "/employees",
        icon: Users,
      },
      {
        title: "Attendance",
        url: "/attendance",
        icon: Clock,
      },
      {
        title: "Overtime",
        url: "/overtime",
        icon: Briefcase,
      },
      {
        title: "Leave",
        url: "/leave",
        icon: Calendar,
      },
    ],
  },
  {
    label: "Payroll & Finance",
    items: [
      {
        title: "Payroll",
        url: "/payroll",
        icon: DollarSign,
      },
      {
        title: "Payslips",
        url: "/payslips",
        icon: FileText,
      },
      {
        title: "Advances",
        url: "/advances",
        icon: Receipt,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: UserCog,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6 border-b bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-lg p-1.5">
            <img src={logoUrl} alt="Innovare Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Innovare
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Payroll Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        {menuGroups.map((group, index) => (
          <div key={group.label}>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          data-active={isActive}
                          className={isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium' : ''}
                        >
                          <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index < menuGroups.length - 1 && <SidebarSeparator className="my-3" />}
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30">
        <div className="flex items-center gap-3 rounded-lg p-2 hover-elevate">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Admin User</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
            className="h-9 w-9"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
