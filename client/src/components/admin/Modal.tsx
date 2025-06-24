import { ReactNode, useEffect } from 'react'

interface ModalProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  title?: string
  size?: 'small' | 'medium' | 'large'
  primaryAction?: {
    content: string
    onAction: () => void
    loading?: boolean
    destructive?: boolean
  }
  secondaryActions?: {
    content: string
    onAction: () => void
  }[]
}

export default function Modal({ 
  children, 
  open, 
  onClose, 
  title, 
  size = 'medium',
  primaryAction,
  secondaryActions 
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])
  
  if (!open) return null
  
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl'
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl`}>
          {title && (
            <div className="border-b border-charcoal-200 px-6 py-4">
              <h2 className="text-lg font-medium text-charcoal-900">{title}</h2>
            </div>
          )}
          
          <div className="px-6 py-4">
            {children}
          </div>
          
          {(primaryAction || secondaryActions) && (
            <div className="border-t border-charcoal-200 px-6 py-4 flex justify-end space-x-3">
              {secondaryActions?.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onAction}
                  className="px-4 py-2 text-sm font-medium text-charcoal-700 bg-white border border-charcoal-300 rounded-md hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500"
                >
                  {action.content}
                </button>
              ))}
              
              {primaryAction && (
                <button
                  onClick={primaryAction.onAction}
                  disabled={primaryAction.loading}
                  className={`
                    px-4 py-2 text-sm font-medium text-white rounded-md
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${primaryAction.destructive 
                      ? 'bg-clay-600 hover:bg-clay-700 focus:ring-clay-500' 
                      : 'bg-forest-600 hover:bg-forest-700 focus:ring-forest-500'
                    }
                    ${primaryAction.loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `.trim()}
                >
                  {primaryAction.loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {primaryAction.content}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}