/* 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
const DEFAULT_SCHEDULE = {
    1: [{ start: '8:00', hours: '8:00', pause: '00:30' }],
    2: [{ start: '8:00', hours: '8:00', pause: '00:30' }],
    3: [{ start: '8:00', hours: '8:00', pause: '00:30' }],
    4: [{ start: '8:00', hours: '8:00', pause: '00:30' }],
    5: [{ start: '8:00', hours: '8:00', pause: '00:30' }]
  };
  
const DEFAULT_ENTROPY_MINUTES = 20;
const DEFAULT_ALLOW_PREFILL = false;

const ALLOW_PREFILL = 'ALLOW_PREFILL';
const ENTROPY_MINUTES = 'ENTROPY_MINUTES';
const SCHEDULE = 'SCHEDULE';

/* API Endpoints */

const API_URL = 'https://api.kenjo.io';
const AUTH_COOKIE_URL = `${API_URL}/auth/cookie`;
const ME_URL = `${API_URL}/user-account-db/user-accounts/me`;
const TIMEOFF_URL = `${API_URL}/user-time-off-request/find`;
const CALENDAR_URL = `${API_URL}/calendar-db/find`;
const TEMPLATES_URL = `${API_URL}/calendar-template-db/templates`;
const ATTENDANCE_URL = `${API_URL}/user-attendance-db`;
const ATTENDANCE_FIND_URL = `${API_URL}/user-attendance-db/find`;