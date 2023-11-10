async function fillFor(statusContainer, fromDate, toDate, localSchedule, localEntropyMinutes) {
  try {
    /* Get user info */
    statusContainer.innerText = "Getting user info...";
    const auth = await getAuth();
    const user = await getUser(auth);

    statusContainer.innerText = "Getting user time off...";

    /* Get calendar info */
    statusContainer.innerText = "Getting user calendar...";
    const userCalendar = await getUserCalendar(auth, user.ownerId);
    const calendars = await getCalendar(auth, userCalendar.calendarId);
    const templates = await getCalendarTemplates(auth);
    const template = templates.filter(tpl => tpl.templateKey == calendars[0]._calendarTemplateKey)[0];

    /* Parse non working days */
    statusContainer.innerText = "Processing non working days...";
    const nonWorkingDays = [];

    template.holidays.forEach((h) => {
      const start = new Date(Date.parse(`${h.holidayDate}T00:00:00.000Z`));
      const end = new Date(Date.parse(`${h.holidayDate}T23:59:59.999Z`));

      if (start >= fromDate && start <= toDate) {
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

      if (start >= fromDate && start <= toDate) {
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

    for (let day = fromDate; day <= toDate; day.setDate(day.getDate() + 1)) {
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
        const pauseStart = hhmmToMinutes("12:00") + Math.ceil(Math.random() * localEntropyMinutes);
        const pauseEnd = pauseStart + pause;
        const end = start + pause + hhmmToMinutes(sch.hours);

        entries.push({
          date: day.toISOString(),
          start: start,
          end: end,
          pause: pause,
          pauseStart: pauseStart,
          pauseEnd: pauseEnd
        });
      });
    }

    /* Store sheet */
    for (const [idx, ts] of entries.entries()) {
      if (! await userHasEntryFor(auth, user.ownerId, ts.date)){
        statusContainer.innerText = `Saving day ${idx+1} of ${entries.length}...`;
        console.log(await addEntry(auth, user.ownerId, ts.date, ts.start, ts.end, ts.pause, ts.pauseStart, ts.pauseEnd));
      }
    }

    /* Show info to the user */
    statusContainer.innerText = "Done";

    /* Reload page to reflect changes */
    location.assign(`${location.origin}/cloud/home`);
    
  } catch(err) {
    alert(`Kenjo Attendance Fill Month error:\n${err}`);
  }  
}