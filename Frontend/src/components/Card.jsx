// Frontend/src/components/Card.jsx
export const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <div 
            className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition ${
                hover ? 'hover:shadow-2xl hover:-translate-y-1' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;