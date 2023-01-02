// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
'use strict';

function USERWORK_URL(userId) {
  return `${API_URL}/user-work-db/${userId}/calendar`;
}


/* Fetch function */

async function fetchUrl(auth, url, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    headers.Authorization = auth;
  }

  try {
    const response = await fetch(url, { method, credentials: 'include', headers, body })

    if (!response.ok) {
      throw Error(`HTTP Code: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    throw new Error(`Failed performing request, reload the site and try again.\n\n${method} ${url}\n${err}`);
  }
}


/* AUTH */

async function getAuth() {
  const data = await fetchUrl(null, AUTH_COOKIE_URL);
  return `${data.token_type} ${data.access_token}`;
}

/* GET */

function getUser(auth) {
  return fetchUrl(auth, ME_URL);
}


function getUserCalendar(auth, userId) {
  return fetchUrl(auth, USERWORK_URL(userId));
}


function getCalendarTemplates(auth) {
  return fetchUrl(auth, TEMPLATES_URL);
}


/* POST */

function getCalendar(auth, calendarId) {
  return fetchUrl(
    auth,
    CALENDAR_URL,
    'POST',
    JSON.stringify({
      _id: calendarId
    })
  );
}


function getUserTimeOff(auth, userId, fromDate, toDate) {
  return fetchUrl(
    auth,
    TIMEOFF_URL,
    'POST',
    JSON.stringify({
      _from: { $gte: fromDate },
      _to: { $lte: toDate },
      _userId: userId
    })
  );
}


function addEntry(auth, userId, date, startTime, endTime, breakTime) {
  return fetchUrl(
    auth,
    ATTENDANCE_URL,
    'POST',
    JSON.stringify({
      ownerId: userId,
      date: date,
      startTime: startTime,
      endTime: endTime,
      breakTime: breakTime,
      _approved: false,
      _changesTracking: [],
      _deleted: false,
      _userId: userId
    })
  );
}


/* HELPERS */

function startOfMonth(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0));
}


function endOfMonth(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999));
}

function hhmmToMinutes(str) {
  return str.split(':').reduce((acc, curr) => (acc*60) + +curr);
}


/* MAIN */

var localSchedule = {};
var localEntropyMinutes = 0;
var localAllowPrefill = false;

async function fillToday(statusContainer) {
    try {
      let date = new Date();
      const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));

      /* Get user info */
      statusContainer.innerText = "Getting user info...";
      const auth = await getAuth();
      const user = await getUser(auth);
      statusContainer.innerText = "Getting user time off...";
      const timeOff = await getUserTimeOff(auth, user.ownerId, today.toISOString(), today.toISOString());
  
      /* Get calendar info */
      statusContainer.innerText = "Getting user calendar...";
      const userCalendar = await getUserCalendar(auth, user.ownerId);
      const calendars = await getCalendar(auth, userCalendar.calendarId);
      const templates = await getCalendarTemplates(auth);
      const template = templates.filter(tpl => tpl.templateKey == calendars[0]._calendarTemplateKey)[0];
  
      /* Parse non working days */
      statusContainer.innerText = "Processing non working days...";
      const nonWorkingDays = [];
  
      timeOff.forEach((t) => {
        nonWorkingDays.push({
          reason: t._policyName,
          start: new Date(Date.parse(t._from)),
          end: new Date(Date.parse(t._to))
        });
      });
  
      template.holidays.forEach((h) => {
        const start = new Date(Date.parse(`${h.holidayDate}T00:00:00.000Z`));
        const end = new Date(Date.parse(`${h.holidayDate}T23:59:59.999Z`));
  
        if (start >= today && start <= today) {
          nonWorkingDays.push({
            reason: h.holidayKey,
            start: start,
            end: end
          });
        }
      });
  
      calendars[0]._customHolidays.forEach((h) => {
        const holidayDate = h.holidayDate.split("T")[0];
  
        const start = new Date(Date.parse(`${holidayDate}T00:00:00.000Z`));
        const end = new Date(Date.parse(`${holidayDate}T23:59:59.999Z`));
  
        if (start >= today && start <= today) {
          nonWorkingDays.push({
            reason: h.holidayName,
            start: start,
            end: end
          });
        }
      });
  
      /* Generate month sheet */
      statusContainer.innerText = "Generating attendance sheet...";
      const entries = [];
      const skippedDays = [];
  
      
    /* Check if the day has a schedule */
    if (!(today.getDay() in localSchedule) || localSchedule[today.getDay()].length == 0) {
        return;
    }

    /* Check if the day should be skipped (holiday or time off) */
    const skipReasons = nonWorkingDays.filter((nwd) => today >= nwd.start && today <= nwd.end);

    if (skipReasons.length > 0) {
        skippedDays.push({ day: new Date(today.getTime()), reasons: skipReasons.map(sr => sr.reason) });
        return;
    }

    /* Produce an entry for this day */
    localSchedule[today.getDay()].forEach((sch) => {
        const start = hhmmToMinutes(sch.start) + Math.ceil(Math.random() * localEntropyMinutes);
        const pause = hhmmToMinutes(sch.pause);
        const end = start + pause + hhmmToMinutes(sch.hours);

        entries.push({
        date: today.toISOString(),
        start: start,
        end: end,
        pause: pause
        });
    });
      
  
      /* Store sheet */
      for (const [idx, ts] of entries.entries()) {
        statusContainer.innerText = `Saving day ${idx+1} of ${entries.length}...`;
        console.log(await addEntry(auth, user.ownerId, ts.date, ts.start, ts.end, ts.pause));
      }
  
      /* Show info to the user */
      statusContainer.innerText = "Done";
  
      let skippedTxt = "";
      skippedDays.forEach((s) => { skippedTxt += `\n${s.day.toISOString().split("T")[0]}: ${s.reasons.join(', ')}` });
  
      alert(`Created ${entries.length} entries.\n\nSkipped days:${skippedTxt}`);
  
      /* Reload page to reflect changes */
      location.assign(`${location.origin}/cloud/home`);
    } catch(err) {
      alert(`Kenjo Attendance Fill Month error:\n${err}`);
    }
  }

async function fillMonth(statusContainer) {
  try {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    /* Get user info */
    statusContainer.innerText = "Getting user info...";
    const auth = await getAuth();
    const user = await getUser(auth);
    statusContainer.innerText = "Getting user time off...";
    const timeOff = await getUserTimeOff(auth, user.ownerId, monthStart.toISOString(), monthEnd.toISOString());

    /* Get calendar info */
    statusContainer.innerText = "Getting user calendar...";
    const userCalendar = await getUserCalendar(auth, user.ownerId);
    const calendars = await getCalendar(auth, userCalendar.calendarId);
    const templates = await getCalendarTemplates(auth);
    const template = templates.filter(tpl => tpl.templateKey == calendars[0]._calendarTemplateKey)[0];

    /* Parse non working days */
    statusContainer.innerText = "Processing non working days...";
    const nonWorkingDays = [];

    timeOff.forEach((t) => {
      nonWorkingDays.push({
        reason: t._policyName,
        start: new Date(Date.parse(t._from)),
        end: new Date(Date.parse(t._to))
      });
    });

    template.holidays.forEach((h) => {
      const start = new Date(Date.parse(`${h.holidayDate}T00:00:00.000Z`));
      const end = new Date(Date.parse(`${h.holidayDate}T23:59:59.999Z`));

      if (start >= monthStart && start <= monthEnd) {
        nonWorkingDays.push({
          reason: h.holidayKey,
          start: start,
          end: end
        });
      }
    });

    calendars[0]._customHolidays.forEach((h) => {
      const holidayDate = h.holidayDate.split("T")[0];

      const start = new Date(Date.parse(`${holidayDate}T00:00:00.000Z`));
      const end = new Date(Date.parse(`${holidayDate}T23:59:59.999Z`));

      if (start >= monthStart && start <= monthEnd) {
        nonWorkingDays.push({
          reason: h.holidayName,
          start: start,
          end: end
        });
      }
    });

    /* Generate month sheet */
    statusContainer.innerText = "Generating attendance sheet...";
    const entries = [];
    const skippedDays = [];

    for (let day = monthStart; day <= monthEnd; day.setDate(day.getDate() + 1)) {
      /* Check if the day has an schedule */
      if (!(day.getDay() in localSchedule) || localSchedule[day.getDay()].length == 0) {
        continue;
      }

      /* Check if the day should be skipped (holiday or time off) */
      const skipReasons = nonWorkingDays.filter((nwd) => day >= nwd.start && day <= nwd.end);

      if (skipReasons.length > 0) {
        skippedDays.push({ day: new Date(day.getTime()), reasons: skipReasons.map(sr => sr.reason) });
        continue;
      }

      /* Produce an entry for this day */
      localSchedule[day.getDay()].forEach((sch) => {
        const start = hhmmToMinutes(sch.start) + Math.ceil(Math.random() * localEntropyMinutes);
        const pause = hhmmToMinutes(sch.pause);
        const end = start + pause + hhmmToMinutes(sch.hours);

        entries.push({
          date: day.toISOString(),
          start: start,
          end: end,
          pause: pause
        });
      });
    }

    /* Store sheet */
    for (const [idx, ts] of entries.entries()) {
      statusContainer.innerText = `Saving day ${idx+1} of ${entries.length}...`;
      console.log(await addEntry(auth, user.ownerId, ts.date, ts.start, ts.end, ts.pause));
    }

    /* Show info to the user */
    statusContainer.innerText = "Done";

    let skippedTxt = "";
    skippedDays.forEach((s) => { skippedTxt += `\n${s.day.toISOString().split("T")[0]}: ${s.reasons.join(', ')}` });

    alert(`Created ${entries.length} entries.\n\nSkipped days:${skippedTxt}`);

    /* Reload page to reflect changes */
    location.assign(`${location.origin}/cloud/home`);
    
  } catch(err) {
    alert(`Kenjo Attendance Fill Month error:\n${err}`);
  }
}

const checkElement = async selector => {
  while ( document.querySelector(selector) === null) {
    await new Promise( resolve =>  requestAnimationFrame(resolve) )
  }
  return document.querySelector(selector);
};

(async function() {
  /* Make schedule and entropy configurable */
  localSchedule = await getObjectFromLocalStorage(SCHEDULE);
  if (!localSchedule) {
    localSchedule = DEFAULT_SCHEDULE;
    await saveObjectInLocalStorage(SCHEDULE, localSchedule);
  }

  localEntropyMinutes = await getObjectFromLocalStorage(ENTROPY_MINUTES);
  if (!localEntropyMinutes) {
    localEntropyMinutes = DEFAULT_ENTROPY_MINUTES;
    await saveObjectInLocalStorage(ENTROPY_MINUTES, localEntropyMinutes);
  }

  localAllowPrefill = await getObjectFromLocalStorage(ALLOW_PREFILL);
  if (!localAllowPrefill) {
    localAllowPrefill = DEFAULT_ALLOW_PREFILL;
    await saveObjectInLocalStorage(ALLOW_PREFILL, localAllowPrefill);
  }

  /* Add button */
  const extDiv = document.createElement('div');
  extDiv.style.textAlign = "center";

  const monthBtn = document.createElement('button');
  monthBtn.type = 'button';
  monthBtn.innerText = 'Attendance: Fill Month';
  if (!localAllowPrefill)
  monthBtn.disabled = "disabled";
else
    monthBtn.onclick = function() { this.disabled = "disabled"; fillMonth(this); }


  const todayBtn = document.createElement('button');
  todayBtn.type = 'button';
  todayBtn.innerText = 'Attendance: Fill Today';
  todayBtn.onclick = function() { this.disabled = "disabled"; fillToday(this); }

  extDiv.append(monthBtn);
  extDiv.append(todayBtn);

  checkElement('orgos-widget-attendance').then((selector) => {
      selector.append(extDiv);
  });
})();