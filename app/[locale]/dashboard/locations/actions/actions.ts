'use server';

import {
  listLocations as listLocationsAction,
  getLocation as getLocationAction,
  createLocation as createLocationAction,
  updateLocation as updateLocationAction,
} from '@/app/actions/locations/actions';

// Re-export actions for dashboard use
export async function listLocations() {
  return listLocationsAction();
}

export async function getLocation(id: string) {
  return getLocationAction(id);
}

export async function createLocation(data: { city: string; address?: string }) {
  return createLocationAction(data);
}

export async function updateLocation(id: string, data: { city: string; address?: string }) {
  return updateLocationAction(id, data);
}

