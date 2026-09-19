import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Location as LocationType } from '../types/app';
import { CONFIG } from '../config/environment';

export const requestLocationPermission = async (): Promise<boolean> => {
  console.log('📍 Location permission bypass (Manual Mode)');
  return true;
};

export const getCurrentLocation = async (): Promise<LocationType | null> => {
  console.log('🗺️ Location bypass: returning Omsk coordinates');
  return { latitude: 54.9885, longitude: 73.3682 };
};

export const watchLocation = (callback: (location: LocationType | null) => void) => {
  console.log('📍 Location watch bypass');
  callback({ latitude: 54.9885, longitude: 73.3682 });
  return () => {};
};
