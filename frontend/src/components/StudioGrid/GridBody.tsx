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
  // One grid for the whole body, so a slot longer than a row can span rows and
  // stay a single cell: an hour in a studio next to two half hours in a makeup room
  const { times, startingAt } = useMemo(() => buildGridLayout(availability), [availability]);

  return (
    <div className="grid-body">
      {times.map((time, rowIndex) => (
        <div
          key={`time-${time}`}
          className={`time-cell ${time.endsWith(':00') ? '' : 'time-cell-half'}`}
          style={{ gridColumn: 1, gridRow: rowIndex + 1 }}
        >
          {time}
        </div>
      ))}

      {studios.map((studio, studioIndex) => {
        const column = studioIndex + 2;
        const roomStarts = startingAt.get(studio.id);

        // The room is not offered on this day at all
        if (!roomStarts) {
          return times.map((time, rowIndex) => (
            <div
              key={`${studio.id}-${time}`}
              className="slot-cell slot-unavailable"
              style={{ gridColumn: column, gridRow: rowIndex + 1 }}
            >
              <span className="slot-status">
                <i className="pi pi-minus text-gray-400"></i>
              </span>
            </div>
          ));
        }

        return times.map((time, rowIndex) => {
          const placement = roomStarts.get(time);

          // No cell here: a slot starting further up already covers this row
          if (!placement) return null;

          return (
            <TimeSlotCell
              key={`${studio.id}-${time}`}
              studio={studio}
              slot={placement.slot}
              isInCart={isInCart(studio.id, availability.date, placement.slot.time)}
              column={column}
              row={rowIndex + 1}
              rowSpan={placement.rowSpan}
              onClick={onSlotClick}
            />
          );
        });
      })}
    </div>
  );
};
