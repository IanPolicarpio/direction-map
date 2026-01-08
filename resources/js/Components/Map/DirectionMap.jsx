import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon paths
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ routes, selectedRoute }) {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        const targetRoutes = selectedRoute ? [selectedRoute] : routes;
        if (targetRoutes && targetRoutes.length > 0) {
            const points = targetRoutes
                .filter(r => r.from_lat && r.to_lat)
                .flatMap(r => [
                    [parseFloat(r.from_lat), parseFloat(r.from_lng)],
                    [parseFloat(r.to_lat), parseFloat(r.to_lng)]
                ]);
            if (points.length > 0) {
                map.fitBounds(points, { padding: [50, 50], maxZoom: 12 });
            }
        }
    }, [routes, selectedRoute, map]);
    return null;
}

export default function DirectionMap({ routes = [], selectedRoute = null, isDark = false }) {
    const [roadPath, setRoadPath] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {
        if (selectedRoute) {
            fetch(`https://router.project-osrm.org/route/v1/driving/${selectedRoute.from_lng},${selectedRoute.from_lat};${selectedRoute.to_lng},${selectedRoute.to_lat}?overview=full&geometries=geojson`)
                .then(r => r.json())
                .then(data => {
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
                        setRoadPath(coords);
                        
                        setRouteInfo({
                            distance: (route.distance / 1000).toFixed(2),
                            duration: Math.round(route.duration / 60)
                        });
                    }
                })
                .catch(err => console.error("OSRM Fetch Error:", err));
        } else {
            setRoadPath([]);
            setRouteInfo(null);
        }
    }, [selectedRoute]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            
            {/* --- UPDATED ACTIVE ROUTE OVERLAY --- */}
            {routeInfo && (
                <div className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 p-5 rounded-2xl shadow-2xl border border-gray-200 dark:border-indigo-500/50 backdrop-blur-md min-w-[190px]">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-3">
                        Active Route
                    </p>
                    
                    <div className="space-y-3">
                        {/* Distance */}
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📏</span>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                                    {routeInfo.distance} <span className="text-xs font-medium opacity-60">km</span>
                                </p>
                            </div>
                        </div>

                        {/* Minutes */}
                        <div className="flex items-center gap-3">
                            <span className="text-lg">⏱️</span>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                                    {routeInfo.duration} <span className="text-xs font-medium opacity-60">mins</span>
                                </p>
                            </div>
                        </div>

                        {/* Hours (New Requirement) */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                            <span className="text-lg">🚗</span>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                                    {(routeInfo.duration / 60).toFixed(1)} <span className="text-xs font-medium opacity-60">hours</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <MapContainer
                center={[14.5995, 120.9842]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer 
                    url={isDark 
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    } 
                    attribution={isDark ? '&copy; CARTO' : '&copy; OpenStreetMap'}
                />

                <MapController routes={routes} selectedRoute={selectedRoute} />

                {routes.map(r => {
                    const isSelected = selectedRoute?.id === r.id;
                    return (
                        <React.Fragment key={r.id}>
                            <Marker
                                position={[parseFloat(r.from_lat), parseFloat(r.from_lng)]}
                                opacity={isSelected ? 1 : 0.5}
                            />
                            <Marker
                                position={[parseFloat(r.to_lat), parseFloat(r.to_lng)]}
                                opacity={isSelected ? 1 : 0.5}
                            />

                            {!isSelected && (
                                <Polyline
                                    positions={[
                                        [parseFloat(r.from_lat), parseFloat(r.from_lng)],
                                        [parseFloat(r.to_lat), parseFloat(r.to_lng)]
                                    ]}
                                    color={isDark ? "#4F46E5" : "#0096FF"}
                                    weight={3}
                                    opacity={0.4}
                                />
                            )}
                        </React.Fragment>
                    );
                })}

                {roadPath.length > 0 && (
                    <Polyline
                        positions={roadPath}
                        color={isDark ? "#818CF8" : "#0000FF"}
                        weight={6}
                        opacity={1}
                    />
                )}
            </MapContainer>
        </div>
    );
}