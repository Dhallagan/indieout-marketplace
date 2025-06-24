import { ReactNode } from 'react'

interface PageProps {
  children: ReactNode
  title: string
  subtitle?: string
  primaryAction?: ReactNode
  secondaryActions?: ReactNode[]
  breadcrumbs?: { content: string; url?: string }[]
}

export default function Page({ 
  children, 
  title, 
  subtitle, 
  primaryAction, 
  secondaryActions, 
  breadcrumbs 
}: PageProps) {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="bg-white border-b border-charcoal-200 px-6 py-4">
        {breadcrumbs && (
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-charcoal-500">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mr-2">›</span>}
                  {breadcrumb.url ? (
                    <a href={breadcrumb.url} className="hover:text-charcoal-700">
                      {breadcrumb.content}
                    </a>
                  ) : (
                    <span>{breadcrumb.content}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-charcoal-600">{subtitle}</p>}
          </div>
          
          <div className="flex items-center space-x-3">
            {secondaryActions && (
              <div className="flex items-center space-x-2">
                {secondaryActions.map((action, index) => (
                  <div key={index}>{action}</div>
                ))}
              </div>
            )}
            {primaryAction && <div>{primaryAction}</div>}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}