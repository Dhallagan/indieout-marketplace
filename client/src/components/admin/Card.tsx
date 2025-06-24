import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  sectioned?: boolean
  actions?: ReactNode
  subdued?: boolean
  className?: string
}

export default function Card({ children, title, sectioned = false, actions, subdued = false, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-sand-200 shadow-sm ${subdued ? 'bg-sand-50' : ''} ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-sand-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-charcoal-900">{title}</h3>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={sectioned ? 'p-5' : ''}>{children}</div>
    </div>
  )
}