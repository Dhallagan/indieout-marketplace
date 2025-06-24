import React, { forwardRef, useState } from 'react'
import TextField from './TextField'

interface NumberFieldProps {
  label?: string
  value: number | string
  onChange: (value: number) => void
  error?: string
  helpText?: string
  requiredIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
  tone?: 'neutral' | 'success' | 'warning' | 'critical'
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  min?: number
  max?: number
  step?: number
  precision?: number
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Parse the number
    const parsedValue = parseFloat(newValue)
    
    if (newValue === '' || newValue === '-') {
      onChange(0)
      return
    }

    if (!isNaN(parsedValue)) {
      // Apply min/max constraints
      let constrainedValue = parsedValue
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max
      }

      // Apply precision
      if (precision > 0) {
        constrainedValue = Math.round(constrainedValue * Math.pow(10, precision)) / Math.pow(10, precision)
      } else {
        constrainedValue = Math.round(constrainedValue)
      }

      onChange(constrainedValue)
    }
  }

  const handleBlur = () => {
    // Format the display value on blur
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      let formattedValue = numValue
      
      // Apply min/max constraints
      if (min !== undefined && formattedValue < min) {
        formattedValue = min
      }
      if (max !== undefined && formattedValue > max) {
        formattedValue = max
      }

      // Format based on precision
      if (precision > 0) {
        setInputValue(formattedValue.toFixed(precision))
      } else {
        setInputValue(formattedValue.toString())
      }
      
      onChange(formattedValue)
    } else {
      setInputValue('0')
      onChange(0)
    }
  }

  // Sync with external value changes
  React.useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(value.toString())
    if (!isNaN(numValue)) {
      if (precision > 0) {
        setInputValue(numValue.toFixed(precision))
      } else {
        setInputValue(numValue.toString())
      }
    }
  }, [value, precision])

  return (
    <TextField
      {...props}
      ref={ref}
      type="number"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      step={step}
      min={min}
      max={max}
    />
  )
})

NumberField.displayName = 'NumberField'

export default NumberField