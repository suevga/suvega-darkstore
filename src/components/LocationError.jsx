import React from 'react'
import { AlertCircle, Settings } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'


export const LocationError = ({ 
  message, 
  onRetry, 
  onOpenSettings 
}) => {
  const isBlocked = message.includes('blocked')

  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Location Access Required</AlertTitle>
      <AlertDescription className="mt-2 whitespace-pre-line">
        {message}
      </AlertDescription>
      <div className="mt-4 flex gap-2">
        <Button onClick={onRetry} variant="outline">
          Retry Location Access
        </Button>
        {isBlocked && (
          <Button onClick={onOpenSettings} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Open Settings
          </Button>
        )}
      </div>
    </Alert>
  )
}

