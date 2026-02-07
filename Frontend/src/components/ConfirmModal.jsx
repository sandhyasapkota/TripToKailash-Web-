import { motion, AnimatePresence } from 'framer-motion';

function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger', 'warning', 'info'
}) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            icon: (
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            confirmBtn: 'bg-red-600 hover:bg-red-700',
            iconBg: 'bg-red-100'
        },
        warning: {
            icon: (
                <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            confirmBtn: 'bg-amber-600 hover:bg-amber-700',
            iconBg: 'bg-amber-100'
        },
        info: {
            icon: (
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            confirmBtn: 'bg-blue-600 hover:bg-blue-700',
            iconBg: 'bg-blue-100'
        }
    };

    const styles = typeStyles[type] || typeStyles.danger;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 text-center">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                            {styles.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                        <p className="text-gray-600">{message}</p>
                    </div>
                    <div className="flex border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-colors border-r border-gray-200"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-4 text-white font-semibold transition-colors ${styles.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ConfirmModal;
