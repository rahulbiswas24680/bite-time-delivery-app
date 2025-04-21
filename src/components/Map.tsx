
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { restaurantLocation, getCustomerLocation, estimateTravelTime } from '../data/locations';
import { useAuth } from '../contexts/AuthContext';

// In a real app, you would get this from an environment variable
// For this demo, we're using a temporary public token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2ttMzVjYXl2MDZpeDJwbzNqY3Rha3dzZSJ9.ez8RaRNnPJJ9QuG5r9xjJQ';

interface MapProps {
  customerId?: string;
  showRoute?: boolean;
}

const Map: React.FC<MapProps> = ({ customerId, showRoute = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { currentUser } = useAuth();
  const [travelInfo, setTravelInfo] = useState<{ minutes: number; distance: number }>({ minutes: 0, distance: 0 });
  
  // Use the currentUser's id if customerId is not provided
  const userId = customerId || (currentUser?.role === 'customer' ? currentUser.id : '');

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [restaurantLocation.longitude, restaurantLocation.latitude],
      zoom: 13,
    });
    
    map.current = newMap;

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add restaurant marker
    const restaurantEl = document.createElement('div');
    restaurantEl.className = 'restaurant-marker';
    restaurantEl.style.backgroundColor = '#F97316';
    restaurantEl.style.width = '20px';
    restaurantEl.style.height = '20px';
    restaurantEl.style.borderRadius = '50%';
    restaurantEl.style.border = '2px solid white';
    
    new mapboxgl.Marker(restaurantEl)
      .setLngLat([restaurantLocation.longitude, restaurantLocation.latitude])
      .setPopup(new mapboxgl.Popup().setHTML('<p>Restaurant Location</p>'))
      .addTo(newMap);
    
    // If we have a user ID, add customer marker and route
    if (userId) {
      const customerLocation = getCustomerLocation(userId);
      
      if (customerLocation) {
        // Add customer marker
        const customerEl = document.createElement('div');
        customerEl.className = 'customer-marker';
        customerEl.style.backgroundColor = '#22C55E';
        customerEl.style.width = '20px';
        customerEl.style.height = '20px';
        customerEl.style.borderRadius = '50%';
        customerEl.style.border = '2px solid white';
        
        new mapboxgl.Marker(customerEl)
          .setLngLat([customerLocation.longitude, customerLocation.latitude])
          .setPopup(new mapboxgl.Popup().setHTML('<p>Your Location</p>'))
          .addTo(newMap);
        
        // Fit bounds to include both markers
        const bounds = new mapboxgl.LngLatBounds()
          .extend([restaurantLocation.longitude, restaurantLocation.latitude])
          .extend([customerLocation.longitude, customerLocation.latitude]);
        
        newMap.fitBounds(bounds, { padding: 100 });
        
        // Calculate and display travel info
        const info = estimateTravelTime(userId);
        setTravelInfo(info);
        
        // Add route if showRoute is true
        if (showRoute) {
          newMap.on('load', () => {
            getRoute(newMap, [customerLocation.longitude, customerLocation.latitude], [restaurantLocation.longitude, restaurantLocation.latitude]);
          });
        }
      }
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userId, showRoute]);
  
  // Function to get route between two points
  const getRoute = async (
    map: mapboxgl.Map, 
    start: [number, number], 
    end: [number, number]
  ) => {
    try {
      // In a real app, you'd make an actual API call to the Mapbox Directions API
      // For this demo, we'll simulate a route with a straight line between points
      
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
      
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [start, end]
          }
        }
      });
      
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    } catch (error) {
      console.error('Error adding route:', error);
    }
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {travelInfo.minutes > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <h3 className="font-bold text-food-orange">Estimated Travel</h3>
          <p className="text-food-darkGray">Time: <span className="font-medium">{travelInfo.minutes} minutes</span></p>
          <p className="text-food-darkGray">Distance: <span className="font-medium">{(travelInfo.distance / 1000).toFixed(1)} km</span></p>
        </div>
      )}
    </div>
  );
};

export default Map;
