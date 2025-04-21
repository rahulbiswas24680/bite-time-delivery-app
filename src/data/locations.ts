
import { CustomerLocation } from '../utils/types';

// This would normally be stored in a database and updated in real-time
// For this demo, we'll use static data with functions to simulate updates
export const customerLocations: Record<string, CustomerLocation> = {
  '1': {
    latitude: 40.712776,
    longitude: -74.005974,
    address: '123 Main St, New York, NY',
    lastUpdated: '2025-04-21T11:30:00Z',
  },
  '3': {
    latitude: 40.714541,
    longitude: -74.007779,
    address: '456 Park Ave, New York, NY',
    lastUpdated: '2025-04-21T10:20:00Z',
  },
};

// Restaurant location (fixed)
export const restaurantLocation = {
  latitude: 40.718217,
  longitude: -74.013330,
  address: '789 Restaurant Ave, New York, NY',
};

// Helper functions for location data
export const getCustomerLocation = (customerId: string): CustomerLocation | undefined => {
  return customerLocations[customerId];
};

export const updateCustomerLocation = (
  customerId: string, 
  latitude: number, 
  longitude: number, 
  address?: string
): CustomerLocation => {
  const updatedLocation: CustomerLocation = {
    latitude,
    longitude,
    address: address || customerLocations[customerId]?.address,
    lastUpdated: new Date().toISOString(),
  };
  
  customerLocations[customerId] = updatedLocation;
  return updatedLocation;
};

// Calculate distance between two points (using Haversine formula)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in meters

  return distance;
};

// Estimate travel time based on distance (assuming average walking speed of 5 km/h)
export const estimateTravelTime = (
  customerId: string
): { minutes: number; distance: number } => {
  const customerLocation = getCustomerLocation(customerId);
  
  if (!customerLocation) {
    return { minutes: 0, distance: 0 };
  }
  
  const distanceInMeters = calculateDistance(
    customerLocation.latitude,
    customerLocation.longitude,
    restaurantLocation.latitude,
    restaurantLocation.longitude
  );
  
  // Walking speed: ~5 km/h = ~83 meters per minute
  const walkingSpeedMetersPerMinute = 83;
  const estimatedMinutes = Math.round(distanceInMeters / walkingSpeedMetersPerMinute);
  
  return {
    minutes: estimatedMinutes,
    distance: Math.round(distanceInMeters)
  };
};
