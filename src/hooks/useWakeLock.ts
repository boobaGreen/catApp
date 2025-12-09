import { useEffect, useRef, useState } from 'react';

export const useWakeLock = (enabled: boolean = true) => {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        // If disabled, release any existing lock
        if (!enabled) {
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => { });
                wakeLockRef.current = null;
                setIsLocked(false);
            }
            return;
        }

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator && !wakeLockRef.current) {
                    const wakeLock = await navigator.wakeLock.request('screen');
                    wakeLockRef.current = wakeLock;
                    setIsLocked(true);
                    console.log('💡 Screen Wake Lock active');

                    wakeLock.addEventListener('release', () => {
                        console.log('💡 Screen Wake Lock released');
                        // Only set locked to false if we didn't release it manually (e.g. system release)
                        // If we are still enabled, we might want to try re-acquiring or just update state.
                        if (wakeLockRef.current === null) {
                            setIsLocked(false);
                        } else {
                            // System released it (e.g. low battery?), try re-acquire if visible?
                            // For now just sync state.
                            wakeLockRef.current = null;
                            setIsLocked(false);
                        }
                    });
                }
            } catch (err) {
                console.warn(`Wake Lock failed: ${err}`);
            }
        };

        requestWakeLock();

        // Re-acquire lock if visibility changes (e.g. user tabs out and back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && enabled && !wakeLockRef.current) {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // We DO NOT release on unmount instantly if we want it to persist across simple re-renders, 
            // but in React StrictMode dev this fires twice. 
            // Proper cleanup:
            if (wakeLockRef.current) {
                wakeLockRef.current.release().then(() => {
                    wakeLockRef.current = null;
                    setIsLocked(false);
                }).catch(() => { });
            }
        };
    }, [enabled]);

    return { isLocked };
};
