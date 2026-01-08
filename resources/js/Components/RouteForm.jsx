import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

export default function RouteForm({ onRouteAdded, editData, onCancel }) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setFrom(editData.from_name);
            setTo(editData.to_name);
        } else {
            setFrom('');
            setTo('');
        }
    }, [editData]);

    const geocode = async (query) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
        throw new Error(`Location "${query}" not found.`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fromCoords = await geocode(from);
            const toCoords = await geocode(to);
            const payload = {
                from_name: from, to_name: to,
                from_lat: fromCoords.lat, from_lng: fromCoords.lon,
                to_lat: toCoords.lat, to_lng: toCoords.lon,
            };

            if (editData) await axios.put(`/api/routes/${editData.id}`, payload);
            else await axios.post('/api/routes', payload);

            setFrom(''); setTo('');
            onRouteAdded();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                <h3 className="font-black text-gray-800 text-sm uppercase tracking-tighter">
                    {editData ? 'Modify Connection' : 'New Direction'}
                </h3>
            </div>

            <div className="space-y-3">
                <input
                    type="text" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl text-sm"
                    placeholder="From Location" required
                />
                <input
                    type="text" value={to} onChange={(e) => setTo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl text-sm"
                    placeholder="To Location" required
                />
            </div>

            <div className="flex flex-col gap-2">
                <button
                    type="submit" disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (editData ? 'Update Path' : 'Add Route')}
                    {!loading && <ArrowRight size={16} />}
                </button>
                {editData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-2 text-gray-500 hover:text-red-500 text-xs font-bold uppercase transition-colors"
                    >
                        Cancel Edit
                    </button>
                )}
            </div>
        </form>
    );
}
