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

export interface SlotPlacement {
  slot: TimeSlot;
  /** Zero-based index of the grid row the slot begins on */
  rowIndex: number;
  /** Number of grid rows the slot occupies: 2 for an hour on a half-hour grid */
  rowSpan: number;
}

export interface GridLayout {
  /** Row labels, at the shortest slot length any room uses */
  times: string[];
  /** Minutes per grid row */
  step: number;
  /** room id -> row label -> the slot that begins on that row */
  startingAt: Map<string, Map<string, SlotPlacement>>;
}

/**
 * Lay the rooms out on a single grid even when they sell different slot
 * lengths. Rows run at the shortest slot length in play and a longer slot
 * spans several rows, so one hour in a studio stays a single cell sitting
 * beside two half-hour cells in a makeup room.
 */
export const buildGridLayout = (availability: AvailabilityResponse): GridLayout => {
  const rooms = availability.rooms.filter(room => room.slots.length > 0);

  if (rooms.length === 0) {
    return { times: [], step: 60, startingAt: new Map() };
  }

  const step = Math.min(...rooms.map(room => roomSlotMinutes(room.slots)));

  let earliest = Number.POSITIVE_INFINITY;
  let latest = Number.NEGATIVE_INFINITY;

  for (const room of rooms) {
    const duration = roomSlotMinutes(room.slots);
    for (const slot of room.slots) {
      const start = toMinutes(slot.time);
      earliest = Math.min(earliest, start);
      latest = Math.max(latest, start + duration);
    }
  }

  const times: string[] = [];
  for (let minute = earliest; minute < latest; minute += step) {
    times.push(fromMinutes(minute));
  }

  const startingAt = new Map<string, Map<string, SlotPlacement>>();

  for (const room of rooms) {
    const duration = roomSlotMinutes(room.slots);
    const rowSpan = Math.max(1, Math.round(duration / step));
    const roomStarts = new Map<string, SlotPlacement>();

    for (const slot of room.slots) {
      const rowIndex = Math.round((toMinutes(slot.time) - earliest) / step);
      if (rowIndex < 0 || rowIndex >= times.length) continue;
      roomStarts.set(times[rowIndex], { slot, rowIndex, rowSpan });
    }

    startingAt.set(room.id, roomStarts);
  }

  return { times, step, startingAt };
};
