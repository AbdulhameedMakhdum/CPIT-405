import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastItem = ({ toast, removeToast }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [toast, removeToast]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const bgColors = {
        success: 'bg-darker border-green-900/50',
        error: 'bg-darker border-red-900/50',
        info: 'bg-darker border-blue-900/50'
    };

    return (
        <div className={`flex items-center p-4 mb-3 rounded-lg border shadow-xl backdrop-blur-sm animate-slideIn transition-all min-w-[300px] ${bgColors[toast.type] || bgColors.info}`}>
            <div className="mr-3">
                {icons[toast.type] || icons.info}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{toast.message}</p>
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} removeToast={removeToast} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
