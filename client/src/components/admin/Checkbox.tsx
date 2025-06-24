import { InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  helpText?: string
  error?: string
  tone?: 'neutral' | 'success' | 'warning' | 'critical'
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  helpText,
  error,
  tone = 'neutral',
  className,
  disabled,
  ...props
}, ref) => {
  const fieldId = props.id || props.name || `checkbox-${Math.random().toString(36).substr(2, 9)}`

  // Tone classes
  const toneClasses = {
    neutral: {
      checkbox: 'text-blue-600 border-charcoal-300 focus:ring-blue-500',
      label: 'text-charcoal-700'
    },
    success: {
      checkbox: 'text-forest-600 border-forest-300 focus:ring-forest-500',
      label: 'text-forest-700'
    },
    warning: {
      checkbox: 'text-yellow-600 border-yellow-300 focus:ring-yellow-500',
      label: 'text-yellow-700'
    },
    critical: {
      checkbox: 'text-clay-600 border-clay-300 focus:ring-clay-500',
      label: 'text-clay-700'
    }
  }

  const currentTone = error ? 'critical' : tone
  const currentToneClasses = toneClasses[currentTone]

  const checkboxClasses = `
    h-4 w-4 rounded border transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-charcoal-50 disabled:cursor-not-allowed
    ${currentToneClasses.checkbox}
    ${className || ''}
  `.trim()

  return (
    <div className="w-full">
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            {...props}
            ref={ref}
            type="checkbox"
            id={fieldId}
            disabled={disabled}
            className={checkboxClasses}
          />
        </div>
        
        {label && (
          <div className="flex-1">
            <label 
              htmlFor={fieldId}
              className={`
                text-sm font-medium cursor-pointer transition-colors duration-200
                ${currentToneClasses.label}
                ${disabled ? 'text-charcoal-500 cursor-not-allowed' : ''}
              `}
            >
              {label}
            </label>
            
            {helpText && !error && (
              <p className="mt-1 text-sm text-charcoal-500 leading-5">{helpText}</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-start space-x-1">
          <svg className="w-4 h-4 text-clay-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-clay-600 leading-5">{error}</p>
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox