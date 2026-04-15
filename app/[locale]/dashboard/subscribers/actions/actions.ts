'use server';

import { listAllSubscribers as listAllSubscribersAction } from '@/app/actions/events/actions';

// Re-export actions for dashboard use
export async function listAllSubscribers() {
  return listAllSubscribersAction();
}

