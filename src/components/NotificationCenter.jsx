import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button.tsx';

export const NotificationCenter = () => {
  return (
    <Button variant="outline" size="icon">
      <Bell className="h-4 w-4" />
    </Button>
  );
};