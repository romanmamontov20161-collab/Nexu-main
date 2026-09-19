import { useState, useEffect } from 'react';
import { Location } from '../types/app';
import { 
  requestLocationPermission, 
  getCurrentLocation, 
  watchLocation 
} from '../services/location';

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-detection disabled per user requirement
    console.log('🗺️ Location services disabled (Manual Selection Mode)');
    setHasPermission(true); // Pretend we have permission to bypass screens
    setLocation({ latitude: 54.9885, longitude: 73.3682 }); // Default Omsk coordinates
    setIsLoading(false);
  }, []);

  const requestPermission = async () => {
    // No-op for manual selection mode
    return true;
  };

  return {
    location,
    isLoading,
    hasPermission,
    error,
    requestPermission,
  };
};
