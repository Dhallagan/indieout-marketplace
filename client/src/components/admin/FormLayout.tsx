import { ReactNode } from 'react'

interface FormLayoutProps {
  children: ReactNode
}

interface FormLayoutGroupProps {
  children: ReactNode
  title?: string
  condensed?: boolean
}

export function FormLayout({ children }: FormLayoutProps) {
  return <div className="space-y-6">{children}</div>
}

export function FormLayoutGroup({ children, title, condensed = false }: FormLayoutGroupProps) {
  return (
    <div className={condensed ? 'space-y-3' : 'space-y-4'}>
      {title && (
        <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
      )}
      <div className={condensed ? 'space-y-3' : 'space-y-4'}>
        {children}
      </div>
    </div>
  )
}