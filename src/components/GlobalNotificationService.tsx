import { useEffect, useRef, useState } from 'react';
import { useDarkStore } from '../store/darkStore';
import SocketService from '../utility/socket.service';
import { toast } from '../hooks/use-toast';
import { Button } from './ui/button';
import mySound from '/notification.mp3';

const GlobalNotificationService = () => {
  const audioRef = useRef(null);
  const { darkstoreId } = useDarkStore();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pendingSound, setPendingSound] = useState(false);
  const [interactionOccurred, setInteractionOccurred] = useState(false);

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        // Reset the audio to the beginning
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1.0;

        // Try to play the sound immediately when notification arrives
        const playPromise = audioRef.current.play();

        // Handle play() promise to catch any errors
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Sound played successfully
              setAudioEnabled(true);
              setPendingSound(false);
            })
            .catch(error => {
              // If autoplay was prevented, mark as pending
              if (error.name === 'NotAllowedError') {
                setPendingSound(true);

                // If user has interacted with the page before, try to play again
                if (interactionOccurred) {
                  setTimeout(() => {
                    audioRef.current.play().catch(e => console.error('Failed to play sound:', e));
                  }, 100);
                }
              }
            });
        }
      }
    } catch (err) {
      console.error('Error attempting to play sound:', err);
      setPendingSound(true);
    }
  };

  // Handler for manual audio enabling
  const enableAudio = () => {
    setAudioEnabled(true);
    setInteractionOccurred(true);

    if (audioRef.current) {
      // Play a silent sound to enable audio
      audioRef.current.volume = 0.01;
      audioRef.current
        .play()
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
          console.error('Error enabling audio:', err);
        });
    }
  };

  // Enable audio after any user interaction with the page
  useEffect(() => {
    const enableAudioOnInteraction = event => {
      setAudioEnabled(true);
      setInteractionOccurred(true);

      // If there was a pending sound notification, play it now
      if (pendingSound && audioRef.current) {
        setTimeout(() => {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error('Failed to play sound:', e));
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

  // Function to create an AudioContext and play a beep sound directly
  // This has a better chance of working on mobile browsers without prior interaction
  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create an oscillator for a simple beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz = A4

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // Stop after 0.5 seconds

      return true;
    } catch (err) {
      console.error('Failed to play beep sound:', err);
      return false;
    }
  };

  // Socket connection and event listener setup
  useEffect(() => {
    if (!darkstoreId) {
      return;
    }

    try {
      const socketService = SocketService.getInstance();
      socketService.connect(darkstoreId);

      // Handle the global notification event
      const handleNewOrderNotification = event => {
        // Try multiple sound methods in sequence
        const playWithAudio = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .then(() => {
                setAudioEnabled(true);
              })
              .catch(() => {
                // If HTML Audio fails, try Web Audio API as fallback
                if (!playBeepSound()) {
                  // Mark as pending if both methods fail
                  setPendingSound(true);
                }
              });
          } else {
            playBeepSound();
          }
        };

        // Try to play sound immediately
        playWithAudio();

        // Display toast notification
        const orderId = event.detail?.orderId || event.detail?.order?._id || 'Unknown';
        toast({
          title: 'New Order Notification',
          description: `New order received: ${orderId}`,
          variant: 'info',
        });

        // Try playing sound again after a slight delay (might work better after toast is rendered)
        setTimeout(playWithAudio, 50);
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
      console.error('Socket initialization error:', error);
    }
  }, [darkstoreId]);

  return (
    <>
      <audio ref={audioRef} src={mySound} preload="auto" style={{ display: 'none' }} />

      {/* Show enable sound button if needed */}
      {pendingSound && !audioEnabled && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-md rounded-md p-2 flex flex-col items-center">
          <p className="text-sm mb-2">Enable notification sounds?</p>
          <Button onClick={enableAudio} size="sm" variant="default">
            Enable Sound
          </Button>
        </div>
      )}
    </>
  );
};

export default GlobalNotificationService;
