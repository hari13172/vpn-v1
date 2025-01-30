import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidemenu/app-sidebar"
import { Outlet } from "react-router"

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center  p-4 bg-gray-800 text-white">
        <SidebarTrigger />
        </header>
        <Outlet />
        </SidebarInset>
    </SidebarProvider>
  )
}
