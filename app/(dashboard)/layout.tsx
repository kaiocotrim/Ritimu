import type { ReactNode } from "react"

import { Sidebar } from "@/components/sidebar/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="dashboard-page-content">{children}</div>
      <Sidebar />
    </>
  )
}
