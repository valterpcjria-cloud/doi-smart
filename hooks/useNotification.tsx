import toast from 'react-hot-toast';

interface NotificationOptions {
    duration?: number;
}

export const useNotification = () => {
    const success = (message: string, options?: NotificationOptions) => {
        toast.success(message, {
            duration: options?.duration || 4000,
            style: {
                background: '#10b981',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '16px',
                padding: '16px 24px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
            },
        });
    };

    const error = (message: string, options?: NotificationOptions) => {
        toast.error(message, {
            duration: options?.duration || 6000,
            style: {
                background: '#ef4444',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '16px',
                padding: '16px 24px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
            },
        });
    };

    const info = (message: string, options?: NotificationOptions) => {
        toast(message, {
            duration: options?.duration || 4000,
            style: {
                background: '#3b82f6',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '16px',
                padding: '16px 24px',
            },
            icon: 'ℹ️',
        });
    };

    const warning = (message: string, options?: NotificationOptions) => {
        toast(message, {
            duration: options?.duration || 5000,
            style: {
                background: '#f59e0b',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '16px',
                padding: '16px 24px',
            },
            icon: '⚠️',
        });
    };

    const confirm = async (
        message: string,
        onConfirm: () => void,
        onCancel?: () => void
    ): Promise<void> => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3">
                    <p className="font-semibold text-slate-800">{message}</p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                onCancel?.();
                            }}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                onConfirm();
                            }}
                            className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                },
            }
        );
    };

    return { success, error, info, warning, confirm };
};

export default useNotification;
