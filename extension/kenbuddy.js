// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
'use strict';

/* MAIN */

async function fillToday(statusContainer) {

  let date = new Date();
  const today = singleDay(date);
  await fillFor(statusContainer, today, today);
}

async function fillCurrentMonth(statusContainer) {
  let currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  await fillFor(statusContainer, monthStart, monthEnd);
}

async function fillCurrentWeek(statusContainer) {
  let currentDate = new Date();
  const weekStart = currentDate.getStartOfWeek();
  const weekEnd = currentDate.getEndOfWeek();
  await fillFor(statusContainer, weekStart, weekEnd);
}

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
  extDiv.style.textAlign = 'center';
  extDiv.className = 'btn-group btn-group-xs';

  if (localAllowPrefill){
    const monthBtn = document.createElement('button');
    monthBtn.type = 'button';
    monthBtn.innerText = 'Attendance: Fill Month';
    monthBtn.className = 'btn btn-primary';
    monthBtn.onclick = function() { this.disabled = "disabled"; fillCurrentMonth(this); }  
    extDiv.append(monthBtn);
  }

  let date = new Date();
  const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  
  const todayBtn = document.createElement('button');
  todayBtn.type = 'button';
  todayBtn.className = 'btn btn-primary';
  todayBtn.innerText = browser.i18n.getMessage('fillAttendanceTodayTitle');
 
  extDiv.append(todayBtn);

  const weekBtn = document.createElement('button');
  weekBtn.type = 'button';
  weekBtn.className = 'btn btn-primary';
  weekBtn.innerText = browser.i18n.getMessage('fillAttendanceWeekTitle');
  weekBtn.onclick = function() { this.disabled = "disabled"; fillCurrentWeek(this); }
  extDiv.append(weekBtn);

  var selector = await checkElement('orgos-widget-attendance');

  var hasEntryForToday = false;

  try {
    let auth = await getAuth();
    let user = await getUser(auth);
    hasEntryForToday = await userHasEntryFor(auth, user.ownerId, today);
  } catch (exception) {
    hasEntryForToday = false;
  }

  if (hasEntryForToday){
    todayBtn.disabled = "disabled";
    todayBtn.innerText = browser.i18n.getMessage('attendanceFilledTitle');
  } else {
    todayBtn.onclick = function() { this.disabled = "disabled"; fillToday(this); }
  }
  
  selector.append(extDiv);
})();