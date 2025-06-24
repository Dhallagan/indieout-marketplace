import { forwardRef } from 'react'

interface RadioOption {
  label: string
  value: string
  helpText?: string
  disabled?: boolean
}

interface RadioGroupProps {
  label?: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  helpText?: string
  requiredIndicator?: boolean
  tone?: 'neutral' | 'success' | 'warning' | 'critical'
  direction?: 'vertical' | 'horizontal'
  name?: string
}

const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(({
  label,
  options,
  value,
  onChange,
  error,
  helpText,
  requiredIndicator,
  tone = 'neutral',
  direction = 'vertical',
  name: propName,
  ...props
}, ref) => {
  const groupName = propName || `radio-group-${Math.random().toString(36).substr(2, 9)}`

  // Tone classes
  const toneClasses = {
    neutral: {
      radio: 'text-blue-600 border-charcoal-300 focus:ring-blue-500',
      label: 'text-charcoal-700'
    },
    success: {
      radio: 'text-forest-600 border-forest-300 focus:ring-forest-500',
      label: 'text-forest-700'
    },
    warning: {
      radio: 'text-yellow-600 border-yellow-300 focus:ring-yellow-500',
      label: 'text-yellow-700'
    },
    critical: {
      radio: 'text-clay-600 border-clay-300 focus:ring-clay-500',
      label: 'text-clay-700'
    }
  }

  const currentTone = error ? 'critical' : tone
  const currentToneClasses = toneClasses[currentTone]

  const radioClasses = `
    h-4 w-4 border transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-charcoal-50 disabled:cursor-not-allowed
    ${currentToneClasses.radio}
  `.trim()

  const containerClasses = direction === 'horizontal' 
    ? 'flex flex-wrap gap-6' 
    : 'space-y-3'

  return (
    <fieldset ref={ref} {...props} className="w-full">
      {label && (
        <legend className={`
          block text-sm font-medium mb-3 transition-colors duration-200
          ${currentToneClasses.label}
        `}>
          {label}
          {requiredIndicator && <span className="text-clay-500 ml-1" aria-label="required">*</span>}
        </legend>
      )}

      <div className={containerClasses}>
        {options.map((option) => {
          const optionId = `${groupName}-${option.value}`
          
          return (
            <div key={option.value} className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  id={optionId}
                  name={groupName}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={option.disabled}
                  className={radioClasses}
                />
              </div>
              
              <div className="flex-1">
                <label 
                  htmlFor={optionId}
                  className={`
                    text-sm font-medium cursor-pointer transition-colors duration-200
                    ${currentToneClasses.label}
                    ${option.disabled ? 'text-charcoal-500 cursor-not-allowed' : ''}
                  `}
                >
                  {option.label}
                </label>
                
                {option.helpText && (
                  <p className="mt-1 text-sm text-charcoal-500 leading-5">{option.helpText}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-3 flex items-start space-x-1">
          <svg className="w-4 h-4 text-clay-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-clay-600 leading-5">{error}</p>
        </div>
      )}

      {helpText && !error && (
        <p className="mt-3 text-sm text-charcoal-500 leading-5">{helpText}</p>
      )}
    </fieldset>
  )
})

RadioGroup.displayName = 'RadioGroup'

export default RadioGroup