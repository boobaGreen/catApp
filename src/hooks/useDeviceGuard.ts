
import { useState, useEffect } from 'react';

type DeviceStatus = 'desktop' | 'mobile_web' | 'app' | 'loading';

export function useDeviceGuard() {
    const [status, setStatus] = useState<DeviceStatus>('loading');

    useEffect(() => {
        const checkDevice = () => {
            // 1. Check if running in Standalone Mode (PWA/TWA)
            const isStandalone =
                window.matchMedia('(display-mode: standalone)').matches ||
                // @ts-ignore - Safari specific
                (window.navigator.standalone === true) ||
                document.referrer.includes('android-app://');

            if (isStandalone) {
                setStatus('app');
                return;
            }

            // 2. Check if Desktop vs Mobile
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobile =
                /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

            if (isMobile) {
                setStatus('mobile_web');
            } else {
                setStatus('desktop');
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice); // Re-check on rotate/resize
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return status;
}
