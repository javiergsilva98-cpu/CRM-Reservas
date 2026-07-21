import type { ReactNode } from 'react'
import { CrmNav } from './CrmNav'
import './CrmLayout.css'

export function CrmLayout({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) {
  return (
    <div className="crm-layout">
      <CrmNav slug={slug} />
      <div className="crm-layout-content">{children}</div>
    </div>
  )
}
