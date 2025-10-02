import React from 'react';
import { AvailabilityResponse, TimeSlot } from '../../types';
import { TimeSlotCell } from './TimeSlotCell';
import { Studio } from './types';

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
  return (
    <div className="grid-body">
      {availability.rooms[0]?.slots.map((_, timeIndex) => (
        <div key={timeIndex} className="grid-row">
          <div className="time-cell">
            {availability.rooms[0].slots[timeIndex].time}
          </div>
          {studios.map(studio => {
            const room = availability.rooms.find(r => r.id === studio.id);
            const slot = room?.slots[timeIndex];
            
            if (!slot) {
              return (
                <div key={studio.id} className="slot-cell slot-unavailable">
                  <span className="slot-status">
                    <i className="pi pi-minus text-gray-400"></i>
                  </span>
                </div>
              );
            }
            
            const inCart = isInCart(studio.id, availability.date, slot.time);
            
            return (
              <TimeSlotCell
                key={studio.id}
                studio={studio}
                slot={slot}
                isInCart={inCart}
                onClick={onSlotClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
