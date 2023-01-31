// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
'use strict';

/* MAIN */


async function fillToday(statusContainer, schedule, entropyMinutes) {
  var date = new Date();
  const startOfToday = startOfDay(date);
  const endOfToday = endOfDay(date);
  await fillFor(statusContainer, startOfToday, endOfToday, schedule, entropyMinutes);
}

async function fillCurrentMonth(statusContainer, schedule, entropyMinutes) {
  var currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfDay(currentDate);
  await fillFor(statusContainer, monthStart, monthEnd, schedule, entropyMinutes);
}

async function fillCurrentWeek(statusContainer, schedule, entropyMinutes) {
  var currentDate = new Date();
  const weekStart = getStartOfWeek(currentDate);
  const weekEnd = endOfDay(currentDate);
  await fillFor(statusContainer, weekStart, weekEnd, schedule, entropyMinutes);
}

var localSchedule = {};
var localEntropyMinutes = 0;
var showFillMonth = false;
var showFillWeek = true;
var showFillToday = false;
var allowEntriesInTheFuture = false;

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

  showFillMonth = await getObjectFromLocalStorage(SHOW_FILL_MONTH);
  if (!showFillMonth) {
    showFillMonth = DEFAULT_SHOW_FILL_MONTH;
    await saveObjectInLocalStorage(SHOW_FILL_MONTH, showFillMonth);
  }

  showFillWeek = await getObjectFromLocalStorage(SHOW_FILL_WEEK);
  if (!showFillWeek) {
    showFillWeek = DEFAULT_SHOW_FILL_WEEK;
    await saveObjectInLocalStorage(SHOW_FILL_WEEK, showFillWeek);
  }

  showFillToday = await getObjectFromLocalStorage(SHOW_FILL_DAY);
  if (!showFillToday) {
    showFillToday = DEFAULT_SHOW_FILL_DAY;
    await saveObjectInLocalStorage(SHOW_FILL_DAY, showFillToday);
  }

  /* Add button */
  const extDiv = document.createElement('div');
  extDiv.style.textAlign = 'center';
  extDiv.className = 'btn-group-kenbuddy';

  const monthBtn = document.createElement('button');
  const todayBtn = document.createElement('button');
  const weekBtn = document.createElement('button');
  
  if (showFillToday){
    todayBtn.type = 'button';
    todayBtn.innerText = browser.i18n.getMessage('fillAttendanceTodayTitle');
    extDiv.append(todayBtn);
  }

  if (showFillWeek) {
    weekBtn.type = 'button';
    weekBtn.innerText = browser.i18n.getMessage('fillAttendanceWeekTitle');
    extDiv.append(weekBtn);
  }

  if (showFillMonth){
    monthBtn.type = 'button';
    monthBtn.innerText = browser.i18n.getMessage('fillAttendanceMonthTitle');
    extDiv.append(monthBtn);
  }

  var selector = await checkElement('orgos-widget-attendance');

  var hasEntryForToday = false;
  var hasEntryForCurrentWeek = false;

  try {
    let date = new Date();
    const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));

    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = endOfDay(date);
    let auth = await getAuth();
    let user = await getUser(auth);
    hasEntryForToday = await userHasEntryFor(auth, user.ownerId, today);

    var count = 0;
    for (let day = startOfWeek; day <= endOfWeek; day.setDate(day.getDate() + 1)) {
      let result = await userHasEntryFor(auth, user.ownerId, day)
      if (!result && localSchedule[count.toString()] != null){
        hasEntryForCurrentWeek = false;
        break;
      }
      hasEntryForCurrentWeek = true;
      count++;
    }

  } catch (exception) {
    hasEntryForToday = false;
  }

  monthBtn.onclick = function() { this.disabled = "disabled"; fillCurrentMonth(this, localSchedule, localEntropyMinutes); }

  if (hasEntryForToday){
    todayBtn.disabled = true;
    todayBtn.innerText = browser.i18n.getMessage('attendanceFilledTitle');
  } else {
    todayBtn.onclick = function() { this.disabled = "disabled"; fillToday(this, localSchedule, localEntropyMinutes); }
  }

  if (hasEntryForCurrentWeek){
    weekBtn.disabled = true;
    weekBtn.innerText = browser.i18n.getMessage('attendanceFilledTitle');
  } else {
    weekBtn.onclick = function() { this.disabled = "disabled"; fillCurrentWeek(this, localSchedule, localEntropyMinutes); }
  }
  
  selector.append(extDiv);
})();