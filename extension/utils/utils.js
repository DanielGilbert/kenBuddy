function padTimeIfNeeded(time){
  if (time == '' || time == null)
  {
      return '';
  }

  let values = time.split(':');
  
  let hours = parseInt(values[0]);
  let minutes = parseInt(values[1]);
  
  let hoursResult = hours < 10 ? '0' + hours : hours;
  let minutesResult = minutes < 10 ? '0' + minutes : minutes;
  
  return hoursResult + ':' + minutesResult;
}

/**
 * Migrate the old Schedule without Pause Start into the new format.
 * @param {*} obj 
 * @returns 
 */
async function runScheduleWithPauseStartMigration(obj) {
  try {
    let result = obj;
    for(let i = 1; i <= 7; i++)
    {
      if (!(i in result) || result[i].length == 0)
        continue;

      var singleElement = result[i].map(element => {
      if (!element.hasOwnProperty('pauseStart')) {
        //Calculate a reasonable pause start time
        var start = hhmmToMinutes(element.start);
        var hours = hhmmToMinutes(element.hours) / 2;
        var pauseStart = start + hours;

        return { ...element, pauseStart: padTimeIfNeeded(MinutesToHhmm(pauseStart)) };
      }});
      if (singleElement[0] !== undefined){
        result[i] = singleElement;
      }
    }
    await saveObjectInLocalStorage(SCHEDULE, result);
    return result;
    } catch (ex) {
      console.log(ex);
  }
  return obj;
}

/**
 * Retrieve object from Chrome's Local StorageArea
 * @param {string} key 
 */
const getObjectFromLocalStorage = async function(key) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(key, function(value) {
          resolve(value[key]);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };
  
/**
 * Save Object in Chrome's Local StorageArea
 * @param {*} obj 
 */
const saveObjectInLocalStorage = async function(key, obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({[key]: obj}, function() {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

/**
 * Removes Object from Chrome Local StorageArea.
 *
 * @param {string or array of string keys} keys
 */
const removeObjectFromLocalStorage = async function(keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(keys, function() {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

async function userHasEntryFor(auth, user, date) {
  try {
    var result = await getUserAttendance(auth, user, date);

    return (result != null && result.length > 0);
  } catch(err) {
    console.error(err);
  }
}

/* HELPERS */
function startOfDay(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}

function endOfDay(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
}

function startOfMonth(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0));
}

function endOfMonth(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999));
}

function getStartOfWeek(date) {
  var currentDate = startOfDay(date);
  return new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
}

function getEndOfWeek(date) {
  var currentDate = endOfDay(date);
  return new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
}

/**
 * Format a date range for week display (e.g., "Dec 30 - Jan 5")
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {string}
 */
function formatWeekRange(startDate, endDate) {
  const options = { month: 'short', day: 'numeric' };
  const startStr = startDate.toLocaleDateString('en-US', options);
  const endStr = endDate.toLocaleDateString('en-US', options);
  return `${startStr} - ${endStr}`;
}

/**
 * Format a month for display (e.g., "December 2025")
 * @param {Date} date
 * @returns {string}
 */
function formatMonthYear(date) {
  const options = { month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Generate an array of week options for the dropdown
 * @param {number} weeksBack - Number of past weeks to include (default 12)
 * @returns {Array<{label: string, startDate: Date, endDate: Date, isCurrent: boolean, value: string}>}
 */
function generateWeekOptions(weeksBack = 12) {
  const weeks = [];
  const today = new Date();

  for (let i = 0; i <= weeksBack; i++) {
    const referenceDate = new Date(today);
    referenceDate.setDate(referenceDate.getDate() - (i * 7));

    const weekStart = getStartOfWeek(referenceDate);
    const weekEnd = getEndOfWeek(referenceDate);

    // For current week, end at today (matching current behavior)
    const effectiveEnd = i === 0 ? endOfDay(today) : weekEnd;

    weeks.push({
      label: formatWeekRange(weekStart, i === 0 ? today : weekEnd),
      startDate: weekStart,
      endDate: effectiveEnd,
      isCurrent: i === 0,
      value: `${weekStart.toISOString()}|${effectiveEnd.toISOString()}`
    });
  }

  return weeks;
}

/**
 * Generate an array of month options for the dropdown
 * @param {number} monthsBack - Number of past months to include (default 3)
 * @returns {Array<{label: string, startDate: Date, endDate: Date, isCurrent: boolean, value: string}>}
 */
function generateMonthOptions(monthsBack = 3) {
  const months = [];
  const today = new Date();

  for (let i = 0; i <= monthsBack; i++) {
    const referenceDate = new Date(today.getFullYear(), today.getMonth() - i, 1);

    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);

    // For current month, end at today (matching current behavior)
    const effectiveEnd = i === 0 ? endOfDay(today) : monthEnd;

    months.push({
      label: formatMonthYear(referenceDate),
      startDate: monthStart,
      endDate: effectiveEnd,
      isCurrent: i === 0,
      value: `${monthStart.toISOString()}|${effectiveEnd.toISOString()}`
    });
  }

  return months;
}

/**
 * Parse a dropdown value back into date range
 * @param {string} value - ISO date string pair separated by |
 * @returns {{ startDate: Date, endDate: Date }}
 */
function parseDateRangeValue(value) {
  const [startStr, endStr] = value.split('|');
  return {
    startDate: new Date(startStr),
    endDate: new Date(endStr)
  };
}

function hhmmToMinutes(str) {
  return str.split(':').reduce((acc, curr) => (acc*60) + +curr);
}

function MinutesToHhmm(minutes) {

  var m = minutes % 60;
  
  return (minutes-m)/60 + ":" + m;
}

const checkElement = async selector => {
  while ( document.querySelector(selector) === null) {
    await new Promise( resolve => requestAnimationFrame(resolve) )
  }
  return document.querySelector(selector);
};