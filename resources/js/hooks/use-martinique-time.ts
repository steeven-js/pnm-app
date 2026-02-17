import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Martinique';

export function useMartiniqueTime() {
    const [now, setNow] = useState(() => dayjs().tz(TZ));

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs().tz(TZ));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        now,
        timeString: now.format('HH:mm:ss'),
        dateString: now.format('dddd D MMMM YYYY'),
    };
}
