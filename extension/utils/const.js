/* 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
const DEFAULT_SCHEDULE = {
    1: [{ start: '8:00', hours: '8:00', pause: '00:30', pauseStart: '12:00' }],
    2: [{ start: '8:00', hours: '8:00', pause: '00:30', pauseStart: '12:00' }],
    3: [{ start: '8:00', hours: '8:00', pause: '00:30', pauseStart: '12:00' }],
    4: [{ start: '8:00', hours: '8:00', pause: '00:30', pauseStart: '12:00' }],
    5: [{ start: '8:00', hours: '8:00', pause: '00:30', pauseStart: '12:00' }]
};

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
const DEFAULT_ENTROPY_MINUTES = 20;
const DEFAULT_SHOW_FILL_MONTH = false;
const DEFAULT_SHOW_FILL_WEEK = true;
const DEFAULT_SHOW_FILL_DAY = false;

const SHOW_FILL_MONTH = 'ALLOW_PREFILL';
const SHOW_FILL_WEEK = 'SHOW_FILL_WEEK';
const SHOW_FILL_DAY = 'SHOW_FILL_DAY';
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