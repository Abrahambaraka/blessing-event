import React from 'react';
import TicketScanner from '../components/ticketing/TicketScanner';

interface CheckInPageProps {
  eventId?: string;
}

const CheckInPage: React.FC<CheckInPageProps> = ({ eventId }) => {
  return (
    <div className="pt-24 md:pt-32 pb-16 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <TicketScanner eventId={eventId} />
      </div>
    </div>
  );
};

export default CheckInPage;
