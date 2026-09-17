import React, { useMemo } from 'react';
import { AvailabilityResponse, TimeSlot } from '../../types';
import { TimeSlotCell } from './TimeSlotCell';
import { Studio } from './types';
import { buildGridLayout } from './slotUtils';

interface GridBodyProps {
  availability: AvailabilityResponse;
  studios: Studio[];
  isInCart: (studioId: string, date: string, time: string) => boolean;
  onSlotClick: (studio: Studio, slot: TimeSlot) => void;
}

export const GridBody: React.FC<GridBodyProps> = ({
  availability,
  studios,
  isInCart,
  onSlotClick,
}) => {
  // Rooms may sell different slot lengths, so rows run at the shortest one and
  // a longer slot covers several rows
  const { times, coverage } = useMemo(() => buildGridLayout(availability), [availability]);

  return (
    <div className="grid-body">
      {times.map(time => (
        <div key={time} className="grid-row">
          <div className={`time-cell ${time.endsWith(':00') ? '' : 'time-cell-half'}`}>
            {time}
          </div>
          {studios.map(studio => {
            const entry = coverage.get(studio.id)?.get(time);

            // The room is not open at this row at all
            if (!entry) {
              return (
                <div key={studio.id} className="slot-cell slot-unavailable">
                  <span className="slot-status">
                    <i className="pi pi-minus text-gray-400"></i>
                  </span>
                </div>
              );
            }

            const inCart = isInCart(studio.id, availability.date, entry.slot.time);

            return (
              <TimeSlotCell
                key={studio.id}
                studio={studio}
                slot={entry.slot}
                isInCart={inCart}
                isContinuation={!entry.isStart}
                spansRows={entry.spansRows}
                onClick={onSlotClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
