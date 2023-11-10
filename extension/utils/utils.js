/**
 * Migrate the old Schedule without Pause Start into the new format.
 * @param {*} obj 
 * @returns 
 */
async function runScheduleWithPauseStartMigration(obj) {
  try {
    for(let i = 1; i <= 7; i++)
    {
      if (!(i in obj) || obj[i].length == 0)
        continue;

      var result = obj[i].map(element => {
      if (!element.hasOwnProperty('pauseStart')) {
        //Calculate a reasonable pause start time
        var start = hhmmToMinutes(element.start);
        var hours = hhmmToMinutes(element.hours) / 2;
        var pauseStart = start + hours;

        return { ...element, pauseStart: MinutesToHhmm(pauseStart) };
      }});
      obj[i] = result;
    }
    await saveObjectInLocalStorage(SCHEDULE, obj);
    return obj;
    } catch (ex) {
      console.error(ex);
  }
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