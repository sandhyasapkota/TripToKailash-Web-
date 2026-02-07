// Frontend/src/components/FormField.jsx
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

export const FormField = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  required = false,
  helpText,
  icon: Icon,
  autoComplete,
  min,
  max,
  pattern,
  ...props
}) => {
  const hasError = !!error;

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-3.5 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          min={min}
          max={max}
          pattern={pattern}
          required={required}
          className={`w-full px-4 py-3 ${Icon ? 'pl-12' : ''} border rounded-lg text-gray-700 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          className="text-red-500 text-sm mt-1 flex items-center gap-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.1-1.1H11V7h6.001a1 1 0 00.9-1.1 1 1 0 00-1-1H10a1 1 0 00-1 1v5H1.999a1 1 0 00-1.1 1.1 1 1 0 001 1h6v5a1 1 0 001 1h6.001a1 1 0 001-1 1 1 0 00-.9-1.1H11v-5h6.001a1 1 0 001-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}

      {helpText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helpText}</p>
      )}
    </motion.div>
  );
};

export default FormField;
