'use server';

import { listEvents as listAllEvents, getEventById as getEventByIdAction } from '@/app/actions/events/actions';

export async function listEvents() {
  const events = await listAllEvents();
  // Return only published events on the public site
  return events.filter((e: { published?: boolean | null }) => e.published === true);
}

export async function getEventById(id: string) {
  const event = await getEventByIdAction(id);
  
  // TODO: Add published check if needed
  // if (event && !event.published) {
  //   return null;
  // }
  
  return event;
}

