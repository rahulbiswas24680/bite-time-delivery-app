
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Stroke } from 'ol/style';
import { restaurantLocation, getCustomerLocation, estimateTravelTime } from '../data/locations';
import { useAuth } from '../contexts/AuthContext';

interface MapProps {
  customerId?: string;
  showRoute?: boolean;
}

const MapComponent: React.FC<MapProps> = ({ customerId, showRoute = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const { currentUser } = useAuth();
  const [travelInfo, setTravelInfo] = React.useState<{ minutes: number; distance: number }>({ minutes: 0, distance: 0 });
  
  // Use the currentUser's id if customerId is not provided
  const userId = customerId || (currentUser?.role === 'customer' ? currentUser.id : '');

  useEffect(() => {
    if (!mapContainer.current) return;

    // Create vector sources for markers and route
    const markersSource = new VectorSource();
    const routeSource = new VectorSource();

    // Create vector layers
    const markersLayer = new VectorLayer({
      source: markersSource,
    });

    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: '#3887be',
          width: 4,
        }),
      }),
    });

    // Initialize map
    const initialMap = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        routeLayer,
        markersLayer,
      ],
      view: new View({
        center: fromLonLat([restaurantLocation.longitude, restaurantLocation.latitude]),
        zoom: 14,
      }),
    });

    map.current = initialMap;

    // Add restaurant marker
    const restaurantFeature = new Feature({
      geometry: new Point(fromLonLat([restaurantLocation.longitude, restaurantLocation.latitude])),
    });
    restaurantFeature.setStyle(
      new Style({
        image: new Icon({
          src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#F97316" stroke="white" stroke-width="4"/>
            </svg>
          `),
          scale: 1,
        }),
      })
    );
    markersSource.addFeature(restaurantFeature);

    // If we have a user ID, add customer marker and route
    if (userId) {
      const customerLocation = getCustomerLocation(userId);
      
      if (customerLocation) {
        // Add customer marker
        const customerFeature = new Feature({
          geometry: new Point(fromLonLat([customerLocation.longitude, customerLocation.latitude])),
        });
        customerFeature.setStyle(
          new Style({
            image: new Icon({
              src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#22C55E" stroke="white" stroke-width="4"/>
                </svg>
              `),
              scale: 1,
            }),
          })
        );
        markersSource.addFeature(customerFeature);

        // Add route if showRoute is true
        
        if (showRoute) {
          const start = [customerLocation.longitude, customerLocation.latitude];
          const end = [restaurantLocation.longitude, restaurantLocation.latitude];
          
          // Use OSRM service to get the actual route
          fetch(`https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`)
            .then(response => response.json())
            .then(data => {
              if (data.routes && data.routes[0]) {
                const coordinates = data.routes[0].geometry.coordinates;
                const transformedCoords = coordinates.map((coord: number[]) => fromLonLat(coord));
                
                const routeFeature = new Feature({
                  geometry: new LineString(transformedCoords)
                });
                
                routeSource.addFeature(routeFeature);
                
                // Fit view to include the route
                const extent = routeSource.getExtent();
                initialMap.getView().fit(extent, {
                  padding: [50, 50, 50, 50],
                  maxZoom: 16,
                });
              }
            })
            .catch(error => console.error('Error fetching route:', error));
        }

        // Fit view to include both markers
        const extent = markersSource.getExtent();
        initialMap.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 16,
        });

        // Calculate and display travel info
        const info = estimateTravelTime(userId);
        setTravelInfo(info);
      }
    }

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
      }
    };
  }, [userId, showRoute]);

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {travelInfo.minutes > 0 && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-lg shadow-lg z-10 max-w-[90%] md:max-w-[300px]">
          <h3 className="font-bold text-food-orange text-sm md:text-base">Estimated Travel</h3>
          <p className="text-food-darkGray text-sm md:text-base">Time: <span className="font-medium">{travelInfo.minutes} minutes</span></p>
          <p className="text-food-darkGray text-sm md:text-base">Distance: <span className="font-medium">{(travelInfo.distance / 1000).toFixed(1)} km</span></p>
        </div>
      )}
    </div>  );
};

export default MapComponent;
