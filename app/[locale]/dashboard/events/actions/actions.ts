'use server';

import {
  listEvents as listEventsAction,
  getEventById as getEventByIdAction,
  getEventWithJobs as getEventWithJobsAction,
  listEventSubscribers as listEventSubscribersAction,
  getEventSubscriber as getEventSubscriberAction,
} from '@/app/actions/events/actions';
import { listJobs as listJobsAction } from '@/app/actions/jobs/actions';
import { listLocations as listLocationsAction } from '@/app/actions/locations/actions';

// Re-export actions for dashboard use
export async function listEvents() {
  return listEventsAction();
}

export async function getEventById(id: string) {
  return getEventByIdAction(id);
}

export async function getEventWithJobs(id: string) {
  return getEventWithJobsAction(id);
}

export async function listEventSubscribers(eventId: string, acceptedOnly: boolean = false) {
  return listEventSubscribersAction(eventId, acceptedOnly);
}

export async function getEventSubscriber(eventId: string, subscriberId: string) {
  return getEventSubscriberAction(eventId, subscriberId);
}

export async function listJobs() {
  return listJobsAction();
}

export async function listLocations() {
  return listLocationsAction();
}

