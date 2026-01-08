import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        <div className="p-1.5 bg-red-50 rounded-full text-red-500">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
