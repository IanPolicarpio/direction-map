import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DirectionMap from '../Components/Map/DirectionMap.jsx';
import RouteForm from '../Components/RouteForm.jsx';
import RouteTable from '../Components/RouteTable.jsx';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [editData, setEditData] = useState(null);
    
    // --- BONUS FEATURE: DARK MODE STATE ---
    const [isDark, setIsDark] = useState(false);

    const fetchRoutes = async () => {
        const response = await axios.get('/api/routes');
        setRoutes(response.data);
    };

    useEffect(() => { fetchRoutes(); }, []);

    // --- BONUS FEATURE: DISTANCE CALCULATION ---
    const calculateMetrics = (route) => {
        if (!route || !route.coordinates || route.coordinates.length < 2) return null;
        
        const toRad = (value) => (value * Math.PI) / 180;
        const [lat1, lon1] = route.coordinates[0];
        const [lat2, lon2] = route.coordinates[route.coordinates.length - 1];

        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return {
            distance: distance.toFixed(2),
            duration: (distance / 40 * 60).toFixed(0) // 40km/h avg speed
        };
    };

    const metrics = calculateMetrics(selectedRoute);

    return (
        <div className={isDark ? 'dark' : ''}>
            <AuthenticatedLayout
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Map Dashboard</h2>
                        
                        {/* DARK MODE TOGGLE */}
                        <button 
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                        >
                            {isDark ? '☀️ Light' : '🌙 Dark'}
                        </button>
                    </div>
                }
            >
                <Head title="Dashboard" />

                <div className="py-6 bg-slate-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                        
                        {/* DISTANCE & DURATION OVERLAY */}
                        {metrics && (
                            <div className="mb-6 flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-900 flex-1">
                                    <p className="text-xs text-indigo-500 font-bold uppercase">Total Distance</p>
                                    <p className="text-2xl font-black dark:text-white">{metrics.distance} <span className="text-sm font-normal">km</span></p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-900 flex-1">
                                    <p className="text-xs text-indigo-500 font-bold uppercase">Est. Duration</p>
                                    <p className="text-2xl font-black dark:text-white">{metrics.duration} <span className="text-sm font-normal">mins</span></p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="lg:w-1/3 space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <RouteForm
                                        onRouteAdded={() => { fetchRoutes(); setEditData(null); }}
                                        editData={editData}
                                        onCancel={() => setEditData(null)}
                                    />
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Saved Routes</h3>
                                    </div>
                                    <RouteTable
                                        routes={routes}
                                        onDeleted={fetchRoutes}
                                        onBulkDelete={fetchRoutes}
                                        onEdit={setEditData}
                                        selectedRoute={selectedRoute}
                                        onSelect={setSelectedRoute}
                                        onReset={() => setSelectedRoute(null)}
                                    />
                                </div>
                            </div>

                            <div className="lg:w-2/3">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 h-[calc(100vh-180px)] min-h-[600px] sticky top-6">
                                    {/* PASSING isDark TO MAP TO CHANGE TILES */}
                                    <DirectionMap 
                                        routes={routes} 
                                        selectedRoute={selectedRoute} 
                                        isDark={isDark} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    );
}