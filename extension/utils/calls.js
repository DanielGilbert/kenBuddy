function USERWORK_URL(userId) {
    return `${API_URL}/user-work-db/${userId}/calendar`;
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
  
  function getUserAttendance(auth, userId, targetDate) {
    return fetchUrl(
      auth,
      ATTENDANCE_FIND_URL,
      'POST',
      JSON.stringify({
        _deleted: false,
        _userId: userId,
        date: targetDate
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