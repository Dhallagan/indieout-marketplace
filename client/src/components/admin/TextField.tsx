import { InputHTMLAttributes, TextareaHTMLAttributes, useState, forwardRef } from 'react'

interface BaseFieldProps {
  label?: string
  error?: string
  helpText?: string
  requiredIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'critical'
}

interface TextFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false
  connectedLeft?: React.ReactNode
  connectedRight?: React.ReactNode
}

interface TextAreaProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true
  autoHeight?: boolean
}

type Props = TextFieldProps | TextAreaProps

const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>((props, ref) => {
  const { 
    label, 
    error, 
    helpText, 
    requiredIndicator, 
    multiline, 
    size = 'medium',
    prefix,
    suffix,
    tone = 'neutral',
    disabled,
    ...inputProps 
  } = props
  
  const [isFocused, setIsFocused] = useState(false)
  
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  }
  
  // Tone classes
  const toneClasses = {
    neutral: {
      border: 'border-charcoal-300',
      focus: 'focus:border-blue-500 focus:ring-blue-500',
      bg: 'bg-white'
    },
    success: {
      border: 'border-forest-300',
      focus: 'focus:border-forest-500 focus:ring-forest-500',
      bg: 'bg-forest-50'
    },
    warning: {
      border: 'border-yellow-300',
      focus: 'focus:border-yellow-500 focus:ring-yellow-500',
      bg: 'bg-yellow-50'
    },
    critical: {
      border: 'border-clay-300',
      focus: 'focus:border-clay-500 focus:ring-clay-500',
      bg: 'bg-clay-50'
    }
  }
  
  const currentTone = error ? 'critical' : tone
  const currentToneClasses = toneClasses[currentTone]
  
  const baseClasses = `
    block w-full rounded-lg border transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-sand-50 disabled:text-charcoal-500 disabled:cursor-not-allowed
    placeholder:text-charcoal-400
    ${sizeClasses[size]}
    ${currentToneClasses.border}
    ${currentToneClasses.focus}
    ${disabled ? 'bg-sand-50' : currentToneClasses.bg}
    ${isFocused ? 'ring-2 ring-opacity-50' : ''}
  `.trim()
  
  const fieldId = inputProps.id || inputProps.name || `field-${Math.random().toString(36).substr(2, 9)}`
  
  const hasLeftContent = prefix || ('connectedLeft' in props && props.connectedLeft)
  const hasRightContent = suffix || ('connectedRight' in props && props.connectedRight)
  
  const leftPadding = hasLeftContent ? (size === 'large' ? 'pl-12' : size === 'small' ? 'pl-8' : 'pl-10') : ''
  const rightPadding = hasRightContent ? (size === 'large' ? 'pr-12' : size === 'small' ? 'pr-8' : 'pr-10') : ''
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={fieldId} 
          className={`
            block text-sm font-medium mb-2 transition-colors duration-200
            ${currentTone === 'critical' ? 'text-clay-700' : 'text-charcoal-700'}
            ${disabled ? 'text-charcoal-500' : ''}
          `}
        >
          {label}
          {requiredIndicator && <span className="text-clay-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left content */}
        {hasLeftContent && (
          <div className={`
            absolute left-0 inset-y-0 flex items-center pointer-events-none z-10
            ${size === 'large' ? 'pl-4' : size === 'small' ? 'pl-2.5' : 'pl-3'}
          `}>
            {prefix || ('connectedLeft' in props && props.connectedLeft)}
          </div>
        )}
        
        {multiline ? (
          <textarea
            {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={fieldId}
            disabled={disabled}
            className={`${baseClasses} ${leftPadding} ${rightPadding} resize-none`}
            rows={('autoHeight' in props && props.autoHeight) ? undefined : (inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>).rows || 4}
            onFocus={(e) => {
              setIsFocused(true)
              if ('onFocus' in inputProps && inputProps.onFocus) {
                inputProps.onFocus(e)
              }
            }}
            onBlur={(e) => {
              setIsFocused(false)
              if ('onBlur' in inputProps && inputProps.onBlur) {
                inputProps.onBlur(e)
              }
            }}
          />
        ) : (
          <input
            {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
            ref={ref as React.Ref<HTMLInputElement>}
            id={fieldId}
            disabled={disabled}
            className={`${baseClasses} ${leftPadding} ${rightPadding}`}
            onFocus={(e) => {
              setIsFocused(true)
              if ('onFocus' in inputProps && inputProps.onFocus) {
                inputProps.onFocus(e)
              }
            }}
            onBlur={(e) => {
              setIsFocused(false)
              if ('onBlur' in inputProps && inputProps.onBlur) {
                inputProps.onBlur(e)
              }
            }}
          />
        )}
        
        {/* Right content */}
        {hasRightContent && (
          <div className={`
            absolute right-0 inset-y-0 flex items-center z-10
            ${size === 'large' ? 'pr-4' : size === 'small' ? 'pr-2.5' : 'pr-3'}
          `}>
            {suffix || ('connectedRight' in props && props.connectedRight)}
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
      
      {helpText && !error && (
        <p className="mt-2 text-sm text-charcoal-500 leading-5">{helpText}</p>
      )}
    </div>
  )
})

TextField.displayName = 'TextField'

export default TextField