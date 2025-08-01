import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
}
