import React from 'react';
import { TimeSlot } from '../../types';
import { Studio } from './types';

interface TimeSlotCellProps {
  studio: Studio;
  slot: TimeSlot;
  isInCart: boolean;
  /** This row is the lower half of a slot that is taller than one row */
  isContinuation?: boolean;
  /** This slot covers more than one grid row */
  spansRows?: boolean;
  onClick: (studio: Studio, slot: TimeSlot) => void;
}

export const TimeSlotCell: React.FC<TimeSlotCellProps> = ({
  studio,
  slot,
  isInCart,
  isContinuation = false,
  spansRows = false,
  onClick,
}) => {
  const getSlotClassName = () => {
    const classes = ['slot-cell'];

    switch (slot.status) {
      case 'available':
        classes.push('slot-available');
        if (isInCart) classes.push('slot-selected');
        break;
      case 'booked':
        classes.push('slot-booked');
        break;
      case 'unavailable':
        classes.push('slot-unavailable');
        break;
    }

    // Join the halves of a multi-row slot into one visual block
    if (spansRows) {
      classes.push(isContinuation ? 'slot-continuation' : 'slot-span-start');
    }

    return classes.join(' ');
  };

  const handleClick = () => {
    onClick(studio, slot);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(studio, slot);
    }
  };

  const getStatusIcon = () => {
    // Only the top half of a multi-row slot carries the icon
    if (isContinuation) return null;

    switch (slot.status) {
      case 'available':
        if (isInCart) {
          return <i className="pi pi-check text-white"></i>;
        }
        return <i className="pi pi-plus text-green-600"></i>;
      case 'booked':
        return <i className="pi pi-times text-red-600"></i>;
      case 'unavailable':
        return <i className="pi pi-minus text-gray-400"></i>;
      default:
        return null;
    }
  };

  return (
    <div
      className={getSlotClassName()}
      onClick={handleClick}
      role="button"
      tabIndex={slot.status === 'available' && !isContinuation ? 0 : -1}
      onKeyDown={handleKeyDown}
      aria-hidden={isContinuation ? true : undefined}
    >
      <span className="slot-status">
        {getStatusIcon()}
      </span>
    </div>
  );
};
