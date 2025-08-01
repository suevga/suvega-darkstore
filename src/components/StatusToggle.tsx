import { Button } from './ui/button';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface StatusToggleProps {
  status: 'published' | 'private';
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'lg' | 'default';
}

export function StatusToggle({ status, onToggle, disabled = false, size = 'sm' }: StatusToggleProps) {
  const isPublished = status === 'published';
  
  return (
    <Button 
      onClick={onToggle} 
      variant={isPublished ? 'default' : 'outline'} 
      size={size}
      disabled={disabled}
      className={`mr-2 transition-all duration-200 ${
        isPublished 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      {isPublished ? (
        <>
          <ToggleRight className="mr-1 h-4 w-4" />
          Published
        </>
      ) : (
        <>
          <ToggleLeft className="mr-1 h-4 w-4" />
          Private
        </>
      )}
    </Button>
  );
}
