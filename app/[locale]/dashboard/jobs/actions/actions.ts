'use server';

import {
  listJobs as listJobsAction,
  getJob as getJobAction,
  createJob as createJobAction,
} from '@/app/actions/jobs/actions';

// Re-export actions for dashboard use
export async function listJobs() {
  return listJobsAction();
}

export async function getJob(id: string) {
  return getJobAction(id);
}

export async function createJob(data: { name: string; nameAr: string; description?: string }) {
  return createJobAction(data);
}

