// Frontend/src/utils/validationUtils.js

/**
 * Unified validation error handling
 * Converts Zod errors to a flat object format
 */
export const getValidationErrors = (zodError) => {
  const errors = {};
  if (zodError?.flatten?.fieldErrors) {
    const fieldErrors = zodError.flatten().fieldErrors;
    Object.keys(fieldErrors).forEach((key) => {
      if (fieldErrors[key] && fieldErrors[key].length > 0) {
        errors[key] = fieldErrors[key][0];
      }
    });
  }
  return errors;
};

/**
 * Safe form validation with proper error handling
 */
export const validateForm = (data, schema) => {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { valid: true, errors: {} };
    }
    return {
      valid: false,
      errors: getValidationErrors(result.error)
    };
  } catch (err) {
    console.error('Validation error:', err);
    return {
      valid: false,
      errors: { general: 'An unexpected validation error occurred' }
    };
  }
};

/**
 * Check if a field has an error
 */
export const hasError = (fieldName, errors) => {
  return !!(errors && errors[fieldName]);
};

/**
 * Get error message for a field
 */
export const getErrorMessage = (fieldName, errors) => {
  return errors && errors[fieldName] ? errors[fieldName] : '';
};

/**
 * Async validation with debounce for real-time validation
 */
export const validateFieldAsync = (fieldName, value, schema, debounceMs = 500) => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      try {
        const result = schema.pick({ [fieldName]: true }).safeParse({ [fieldName]: value });
        if (result.success) {
          resolve({ valid: true, error: null });
        } else {
          const errors = getValidationErrors(result.error);
          resolve({ valid: false, error: errors[fieldName] || 'Invalid' });
        }
      } catch (err) {
        console.error('Async validation error:', err);
        resolve({ valid: false, error: 'Validation error' });
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  });
};

export default {
  getValidationErrors,
  validateForm,
  hasError,
  getErrorMessage,
  validateFieldAsync
};