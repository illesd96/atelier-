import { AvailabilityResponse, TimeSlot } from '../../types';

export const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

export const fromMinutes = (total: number): string => {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * How long one slot of this room lasts, read from the room's own slot list.
 * The studios sell whole hours, the makeup rooms half hours.
 */
export const roomSlotMinutes = (slots: TimeSlot[]): number => {
  if (slots.length < 2) return 60;
  const step = toMinutes(slots[1].time) - toMinutes(slots[0].time);
  return step > 0 ? step : 60;
};

export interface SlotCoverage {
  slot: TimeSlot;
  /** False on the second half of an hour-long slot shown on a half-hour grid */
  isStart: boolean;
  /** True when the slot is taller than one grid row */
  spansRows: boolean;
}

export interface GridLayout {
  /** Row labels, at the finest slot length any room uses */
  times: string[];
  /** room id -> row label -> the slot occupying that row */
  coverage: Map<string, Map<string, SlotCoverage>>;
}

/**
 * Lay the rooms out on a single grid even when they sell different slot
 * lengths. Rows use the shortest slot length in play, and a longer slot simply
 * covers several rows, which lets an hourly studio sit next to a half-hourly
 * makeup room in the same table.
 */
export const buildGridLayout = (availability: AvailabilityResponse): GridLayout => {
  const rooms = availability.rooms.filter(room => room.slots.length > 0);

  if (rooms.length === 0) {
    return { times: [], coverage: new Map() };
  }

  const step = Math.min(...rooms.map(room => roomSlotMinutes(room.slots)));

  let earliest = Number.POSITIVE_INFINITY;
  let latest = Number.NEGATIVE_INFINITY;

  const coverage = new Map<string, Map<string, SlotCoverage>>();

  for (const room of rooms) {
    const duration = roomSlotMinutes(room.slots);
    const spansRows = duration > step;
    const roomCoverage = new Map<string, SlotCoverage>();

    for (const slot of room.slots) {
      const start = toMinutes(slot.time);
      earliest = Math.min(earliest, start);
      latest = Math.max(latest, start + duration);

      for (let offset = 0; offset < duration; offset += step) {
        roomCoverage.set(fromMinutes(start + offset), {
          slot,
          isStart: offset === 0,
          spansRows,
        });
      }
    }

    coverage.set(room.id, roomCoverage);
  }

  const times: string[] = [];
  for (let minute = earliest; minute < latest; minute += step) {
    times.push(fromMinutes(minute));
  }

  return { times, coverage };
};
