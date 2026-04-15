import { EventInput, EventItem, RegistrationInput } from '@/lib/validations/event';

type Registration = Omit<RegistrationInput, 'agreeToRequirements'> & { id: string; createdAt: number };

class EventsStore {
  private events: EventItem[] = [];
  private registrationsByEvent: Record<string, Registration[]> = {};

  list(): EventItem[] {
    return [...this.events].sort((a, b) => b.createdAt - a.createdAt);
  }

  getById(id: string): EventItem | undefined {
    return this.events.find((e) => e.id === id);
  }

  create(input: EventInput): EventItem {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: EventItem = { ...input, id, createdAt: Date.now() };
    this.events.push(item);
    return item;
  }

  register(input: RegistrationInput): Registration {
    const { eventId, agreeToRequirements, ...rest } = input;
    const event = this.getById(eventId);
    if (!event) throw new Error('Event not found');
    const reg: Registration = {
      ...rest,
      eventId,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    } as Registration;
    if (!this.registrationsByEvent[eventId]) this.registrationsByEvent[eventId] = [];
    this.registrationsByEvent[eventId].push(reg);
    return reg;
  }

  listRegistrations(eventId: string): Registration[] {
    return [...(this.registrationsByEvent[eventId] || [])].sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const eventsStore = new EventsStore();






















