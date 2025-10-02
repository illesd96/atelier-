# StudioGrid Component

A modular, well-structured booking grid component for the photo studio booking system.

## Structure

```
StudioGrid/
├── StudioGrid.tsx      # Main container component
├── StudioGrid.css      # All styles for the grid
├── DateNavigation.tsx  # Date picker and navigation
├── Legend.tsx          # Status legend component
├── GridHeader.tsx      # Studio headers with prices
├── GridBody.tsx        # Main grid content
├── TimeSlotCell.tsx    # Individual time slot cells
├── LoadingState.tsx    # Loading skeleton
├── ErrorState.tsx      # Error display
├── types.ts           # Shared TypeScript types
├── index.ts           # Export barrel
└── README.md          # This documentation
```

## Components

### StudioGrid (Main Component)
- **Purpose**: Container component that orchestrates all other components
- **Props**: `onCartUpdate?: () => void`
- **Features**: State management, API calls, cart integration

### DateNavigation
- **Purpose**: Date selection and navigation controls
- **Features**: Previous/next day, today button, calendar picker
- **Responsive**: Stacks vertically on mobile

### Legend
- **Purpose**: Shows what different slot colors mean
- **Features**: Available, booked, selected, unavailable indicators

### GridHeader
- **Purpose**: Studio column headers with pricing
- **Features**: Studio names, hourly rates, responsive layout

### GridBody
- **Purpose**: Main grid content with time slots
- **Features**: Time rows, studio columns, slot interactions

### TimeSlotCell
- **Purpose**: Individual clickable time slot
- **Features**: Click handling, keyboard navigation, visual states
- **States**: Available (green), booked (red), selected (blue), unavailable (gray)

### LoadingState
- **Purpose**: Skeleton loading animation
- **Features**: PrimeReact Skeleton components

### ErrorState
- **Purpose**: Error display with retry option
- **Features**: Error icon, message, retry button

## Usage

```tsx
import { StudioGrid } from '../components/StudioGrid';

<StudioGrid onCartUpdate={handleCartUpdate} />
```

## Styling

All styles are contained in `StudioGrid.css` with:
- CSS Grid layout for responsive design
- Mobile-first responsive breakpoints
- Hover and focus states
- Smooth transitions
- Accessibility support

## Features

- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Accessibility**: Keyboard navigation, ARIA support
- ✅ **Visual Feedback**: Immediate slot state changes
- ✅ **Toast Notifications**: Success/info messages
- ✅ **Error Handling**: Graceful error states
- ✅ **Loading States**: Skeleton animations
- ✅ **Cart Integration**: Real-time cart updates

## Customization

### Adding New Studios
Update the `STUDIOS` array in `StudioGrid.tsx`:

```tsx
const STUDIOS: Studio[] = [
  { id: 'studio-a', name: 'Studio A' },
  { id: 'studio-b', name: 'Studio B' },
  { id: 'new-studio', name: 'New Studio' },
];
```

### Changing Hourly Rate
Update the `HOURLY_RATE` constant in `StudioGrid.tsx`.

### Styling Changes
Modify `StudioGrid.css` for visual customization.

## Performance

- **Optimized Re-renders**: Only updates when necessary
- **Efficient State Management**: Minimal API calls
- **CSS Grid**: Hardware-accelerated layout
- **Component Splitting**: Better code splitting and loading



