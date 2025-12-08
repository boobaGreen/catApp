import { useEffect, useRef, useState } from 'react';

export const useWakeLock = (enabled: boolean = true) => {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const wakeLock = await navigator.wakeLock.request('screen');
                    wakeLockRef.current = wakeLock;
                    setIsLocked(true);

                    console.log('💡 Screen Wake Lock active');

                    wakeLock.addEventListener('release', () => {
                        console.log('💡 Screen Wake Lock released');
                        setIsLocked(false);
                    });
                }
            } catch (err) {
                console.warn(`Wake Lock failed: ${err}`);
            }
        };

        requestWakeLock();

        // Re-acquire lock if visibility changes (e.g. user tabs out and back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && enabled) {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
    }, [enabled]);

    return { isLocked };
};
