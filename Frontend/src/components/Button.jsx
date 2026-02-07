// Frontend/src/components/Button.jsx
export const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false,
    fullWidth = false,
    type = 'button',
    onClick,
    className = '',
    ...props 
}) => {
    const baseStyles = 'font-semibold rounded-lg transition transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2';
    
    const variants = {
        primary: 'bg-[#2B4C8F] text-white hover:bg-blue-800 hover:scale-[1.02] shadow-lg hover:shadow-xl',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline: 'border-2 border-[#2B4C8F] text-[#2B4C8F] hover:bg-blue-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
    };
    
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            <span>{loading ? 'Loading...' : children}</span>
        </button>
    );
};

export default Button;