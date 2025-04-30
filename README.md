# PicklePro - Pickleball Court Reservation System

A modern web application for booking pickleball courts, built with Next.js 14, React, and Tailwind CSS.

## Features

- Browse available courts and time slots
- Book courts with a simple, user-friendly interface
- Receive confirmation of reservations
- View and manage existing reservations
- Contact form for inquiries
- Responsive design for desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Date Utilities**: date-fns
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pickleball-reservation.git
   cd pickleball-reservation
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app`: Pages using the Next.js App Router
- `/components`: Reusable React components
- `/components/ui`: UI primitive components
- `/lib`: Utilities, types, and API services
- `/public`: Static assets

## Development

### Mock Data

The application currently uses mock data for courts and reservations. In a production environment, this would be replaced with real API calls to a backend service.

### Adding New Features

When adding new features:
1. Create components in the `/components` directory
2. Add page routes in the `/app` directory
3. Update the API services in `/lib/api.ts`

## Deployment

The application can be deployed on Vercel for the best experience with Next.js:

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 