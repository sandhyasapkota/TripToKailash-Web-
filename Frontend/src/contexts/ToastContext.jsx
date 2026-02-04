// Frontend/src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// Minimal inline Toast component so the context doesn't depend on an external file
function Toast({ message, title, type = 'info', onClose }) {
    const typeStyles = {
        success: 'bg-green-50 border-green-400 text-green-800',
        error: 'bg-red-50 border-red-400 text-red-800',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
        info: 'bg-blue-50 border-blue-400 text-blue-800',
        loading: 'bg-gray-50 border-gray-300 text-gray-800'
    };

    const style = typeStyles[type] || typeStyles.info;

    return (
        <div className={`max-w-sm w-full border-l-4 ${style} shadow-lg rounded-md p-4`} role="status" aria-live="polite">
            <div className="flex items-start">
                <div className="flex-1">
                    {title && <div className="font-semibold mb-1">{title}</div>}
                    <div className="text-sm">{message}</div>
                </div>
                <div className="ml-3 flex-shrink-0">
                    <button onClick={() => onClose && onClose()} aria-label="Close" className="text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000, title) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration, title };

        setToasts(prevToasts => [...prevToasts, newToast]);

        // Auto-remove after duration + animation time
        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration + 300);
        }

        return id;
    }, [removeToast]);

    const showSuccess = useCallback((message, title = 'Success!', duration = 4000) => {
        return addToast(message, 'success', duration, title);
    }, [addToast]);

    const showError = useCallback((message, title = 'Error!', duration = 5000) => {
        return addToast(message, 'error', duration, title);
    }, [addToast]);

    const showWarning = useCallback((message, title = 'Warning!', duration = 4500) => {
        return addToast(message, 'warning', duration, title);
    }, [addToast]);

    const showInfo = useCallback((message, title = 'Info', duration = 4000) => {
        return addToast(message, 'info', duration, title);
    }, [addToast]);

    const showLoading = useCallback((message, title = 'Loading...', duration = null) => {
        return addToast(message, 'loading', duration, title);
    }, [addToast]);

    const value = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-0 right-0 z-50 space-y-4 p-4">
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            transform: `translateY(${index * 10}px)`,
                            transition: 'transform 0.3s ease-out'
                        }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            title={toast.title}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};