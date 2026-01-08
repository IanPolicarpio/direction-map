import { Trash2, Edit2, RotateCcw, Navigation } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import ConfirmationModal from './ConfirmationModal';

export default function RouteTable({ routes, onDeleted, onBulkDelete, onEdit, selectedRoute, onSelect, onReset }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, id: null });

    const toggleSelectAll = (e) => {
        setSelectedIds(e.target.checked ? routes.map(r => r.id) : []);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const triggerModal = (type, id = null) => {
        setModalConfig({ isOpen: true, type, id });
    };

    const handleConfirmAction = async () => {
        if (modalConfig.type === 'single') {
            await axios.delete(`/api/routes/${modalConfig.id}`);
            onDeleted();
        } else if (modalConfig.type === 'bulk') {
            await axios.post('/api/routes/bulk-delete', { ids: selectedIds });
            setSelectedIds([]);
            onBulkDelete();
        }
        setModalConfig({ isOpen: false, type: null, id: null });
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80 font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                    <tr>
                        <th className="px-4 py-3 text-left w-8">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                checked={routes.length > 0 && selectedIds.length === routes.length}
                                onChange={toggleSelectAll}
                            />
                        </th>
                        <th className="px-2 py-3 text-left">All Routes</th>
                        <th className="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                    {routes.map((route) => (
                        <tr
                            key={route.id}
                            onClick={() => onSelect(route)}
                            className={`group cursor-pointer transition-all ${selectedRoute?.id === route.id ? 'bg-slate-100' : 'hover:bg-gray-50'}`}
                        >
                            <td className="px-4 py-4 w-8">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={selectedIds.includes(route.id)}
                                    onChange={(e) => { e.stopPropagation(); toggleSelect(route.id); }}
                                />
                            </td>
                            <td className="px-2 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedRoute?.id === route.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Navigation size={14} />
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">
                                        {route.from_name} <span className="text-gray-400 font-normal mx-1">to</span> {route.to_name}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(route); }} className="p-1.5 text-gray-400 hover:text-indigo-600">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); triggerModal('single', route.id); }} className="p-1.5 text-gray-400 hover:text-red-600">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="p-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                {selectedIds.length > 0 ? (
                    <button onClick={() => triggerModal('bulk')} className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest">
                        DELETE SELECTED ({selectedIds.length})
                    </button>
                ) : (
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Select rows to delete</span>
                )}

                {selectedRoute && (
                    <button onClick={onReset} className="text-xs font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-widest">
                        <RotateCcw size={12} /> CLEAR VIEW
                    </button>
                )}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, type: null, id: null })}
                onConfirm={handleConfirmAction}
                title="Confirm Deletion"
                message={modalConfig.type === 'bulk'
                    ? `Are you sure you want to delete ${selectedIds.length} routes? This action cannot be undone.`
                    : "Are you sure you want to delete this route?"}
            />
        </div>
    );
}
