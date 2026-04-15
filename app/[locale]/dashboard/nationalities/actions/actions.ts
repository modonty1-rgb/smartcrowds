'use server';

import {
  listNationalities as listNationalitiesAction,
  getNationality as getNationalityAction,
  createNationality as createNationalityAction,
  updateNationality as updateNationalityAction,
} from '@/app/actions/nationalities/actions';

// Re-export actions for dashboard use
export async function listNationalities() {
  return listNationalitiesAction();
}

export async function getNationality(id: string) {
  return getNationalityAction(id);
}

export async function createNationality(data: { nameAr: string; nameEn: string }) {
  return createNationalityAction(data);
}

export async function updateNationality(id: string, data: { nameAr: string; nameEn: string }) {
  return updateNationalityAction(id, data);
}

