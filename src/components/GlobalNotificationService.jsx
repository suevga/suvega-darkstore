import React, { useEffect, useRef, useState } from 'react';
import { useDarkStore } from '../store/darkStore';
import SocketService from '../utility/socket.service';
import { toast } from '../hooks/use-toast';
import { Button } from './ui/button';
import mySound from '../../public/notification.mp3';

const GlobalNotificationService = () => {
  const audioRef = useRef(null);
  const { darkstoreId } = useDarkStore();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pendingSound, setPendingSound] = useState(false);
  
  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // If audio isn't enabled yet and user hasn't interacted, mark as pending
      if (!audioEnabled) {
        setPendingSound(true);
        return;
      }
      
      if (audioRef.current) {
        // Reset the audio to the beginning
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1.0;
        
        // Create a user interaction context by handling it within a user action
        const playPromise = audioRef.current.play();
        
        // Handle play() promise to catch any errors
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Sound played successfully
          }).catch(error => {
            // Try alternative approach if autoplay was prevented
            if (error.name === "NotAllowedError") {
              // Set pending flag to show enable button 
              setPendingSound(true);
            }
          });
        }
      }
    } catch (err) {
      console.error("Error attempting to play sound:", err);
    }
  };

  // Handler for manual audio enabling
  const enableAudio = () => {
    setAudioEnabled(true);
    
    if (audioRef.current) {
      // Play a silent sound to enable audio
      audioRef.current.volume = 0.01;
      audioRef.current.play()
        .then(() => {
          // If there was a pending sound, play it now
          if (pendingSound) {
            setTimeout(() => {
              audioRef.current.volume = 1.0;
              audioRef.current.currentTime = 0;
              audioRef.current.play();
              setPendingSound(false);
            }, 100);
          }
        })
        .catch(err => {
          console.error("Error enabling audio:", err);
        });
    }
  };

  // Enable audio after any user interaction with the page
  useEffect(() => {
    const enableAudioOnInteraction = () => {
      setAudioEnabled(true);
      
      // If there was a pending sound notification, play it now
      if (pendingSound && audioRef.current) {
        setTimeout(() => {
          audioRef.current.currentTime = 0;
          audioRef.current.play()
            .catch(e => console.error("Failed to play sound:", e));
          setPendingSound(false);
        }, 100);
      }
    };
    
    // These events typically signify user interaction with the page
    window.addEventListener('click', enableAudioOnInteraction);
    window.addEventListener('keydown', enableAudioOnInteraction);
    window.addEventListener('touchstart', enableAudioOnInteraction);
    
    return () => {
      window.removeEventListener('click', enableAudioOnInteraction);
      window.removeEventListener('keydown', enableAudioOnInteraction);
      window.removeEventListener('touchstart', enableAudioOnInteraction);
    };
  }, [pendingSound]);

  // Socket connection and event listener setup
  useEffect(() => {
    if (!darkstoreId) {
      return;
    }
    
    try {
      const socketService = SocketService.getInstance();
      socketService.connect(darkstoreId);
      
      // Handle the global notification event
      const handleNewOrderNotification = (event) => {
        playNotificationSound();
        
        const orderId = event.detail?.orderId || (event.detail?.order?._id || 'Unknown');
        toast({
          title: "New Order Notification",
          description: `New order received: ${orderId}`,
          variant: "info",
        });
      };
      
      // Add event listener for custom notification events
      window.addEventListener('newOrderNotification', handleNewOrderNotification);
      
      return () => {
        // Cleanup - remove event listener
        window.removeEventListener('newOrderNotification', handleNewOrderNotification);
        
        // Don't disconnect socket on unmount as it should stay connected globally
        // socketService.disconnect(); 
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
    }
  }, [darkstoreId]);

  return (
    <>
      <audio 
        ref={audioRef} 
        src={mySound}
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {/* Show enable sound button if needed */}
      {pendingSound && !audioEnabled && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-md rounded-md p-2 flex flex-col items-center">
          <p className="text-sm mb-2">Enable notification sounds?</p>
          <Button 
            onClick={enableAudio} 
            size="sm" 
            variant="default"
          >
            Enable Sound
          </Button>
        </div>
      )}
    </>
  );
};

export default GlobalNotificationService; 