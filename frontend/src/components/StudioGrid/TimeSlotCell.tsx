import React from 'react';
import { TimeSlot } from '../../types';
import { Studio } from './types';

interface TimeSlotCellProps {
  studio: Studio;
  slot: TimeSlot;
  isInCart: boolean;
  onClick: (studio: Studio, slot: TimeSlot) => void;
}

export const TimeSlotCell: React.FC<TimeSlotCellProps> = ({
  studio,
  slot,
  isInCart,
  onClick,
}) => {
  const getSlotClassName = () => {
    const baseClass = 'slot-cell';
    
    switch (slot.status) {
      case 'available':
        return `${baseClass} slot-available ${isInCart ? 'slot-selected' : ''}`;
      case 'booked':
        return `${baseClass} slot-booked`;
      case 'unavailable':
        return `${baseClass} slot-unavailable`;
      default:
        return baseClass;
    }
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
      tabIndex={slot.status === 'available' ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      <span className="slot-status">
        {getStatusIcon()}
      </span>
    </div>
  );
};
