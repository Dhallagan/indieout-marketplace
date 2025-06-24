import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'plain'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
}

export default function Button({ 
  children, 
  variant = 'secondary', 
  size = 'medium', 
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-forest-600 text-white hover:bg-forest-700 focus:ring-forest-500 border border-transparent',
    secondary: 'bg-white text-charcoal-700 hover:bg-sand-50 focus:ring-forest-500 border border-charcoal-300',
    tertiary: 'bg-transparent text-forest-600 hover:bg-forest-50 focus:ring-forest-500 border border-transparent',
    destructive: 'bg-clay-600 text-white hover:bg-clay-700 focus:ring-clay-500 border border-transparent',
    plain: 'bg-transparent text-charcoal-600 hover:text-charcoal-800 focus:ring-forest-500 border border-transparent'
  }
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClass = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}