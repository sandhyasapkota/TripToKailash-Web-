// Frontend/src/components/LoadingSpinner.jsx
export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-16 w-16',
        lg: 'h-24 w-24',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`animate-spin rounded-full border-b-4 border-[#2B4C8F] ${sizes[size]}`}></div>
            {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;