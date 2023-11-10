function timeToDate(timeString){
    return new Date(Date.parse(timeString))
}

const removeProperty = (prop, { [prop]: exclProp, ...rest }) => rest;

// Saves options to chrome.storage
async function save_options() {
    var entropy = document.getElementById('entropy').value;
    var schedule = await getObjectFromLocalStorage('SCHEDULE');

    var count = 0;

    for(let weekday of weekdays)
    {
        if (await isScheduleActive(weekday))
        {
            var result = await getScheduleFromCard(weekday);
            if (schedule.count == null)           
            schedule[count.toString()] = new Array({start: result.start, pause: result.pause, hours: result.hours}) ;
        }
        else
        {
            if (schedule[count] != null){
                schedule = removeProperty(count.toString(), schedule);
            }
        }
        count++;
    }

    var showMonth = document.getElementById('showMonthInput').checked;
    var showWeek = document.getElementById('showWeekInput').checked;
    var showDay = document.getElementById('showDayInput').checked;

    await saveObjectInLocalStorage(ENTROPY_MINUTES, entropy);
    await saveObjectInLocalStorage(SCHEDULE, schedule);
    await saveObjectInLocalStorage(SHOW_FILL_MONTH, showMonth);
    await saveObjectInLocalStorage(SHOW_FILL_WEEK, showWeek);
    await saveObjectInLocalStorage(SHOW_FILL_DAY, showDay);

    // Update status to let user know options were saved.
    var status = document.getElementById('statusDiv');
    status.textContent = browser.i18n.getMessage('optionsSaved');
    setTimeout(function() {
        status.textContent = '';
    }, 750);
}

async function reset_to_defaults() {

    await set_defaults();
    await restore_options();

    // Update status to let user know options were saved.
    var status = document.getElementById('statusDiv');
    status.textContent = browser.i18n.getMessage('optionsRestored');
    setTimeout(function() {
        status.textContent = '';
    }, 750);
}

async function set_defaults(){
    await saveObjectInLocalStorage(ENTROPY_MINUTES, DEFAULT_ENTROPY_MINUTES);
    await saveObjectInLocalStorage(SCHEDULE, DEFAULT_SCHEDULE);
    await saveObjectInLocalStorage(SHOW_FILL_MONTH, DEFAULT_SHOW_FILL_MONTH);
    await saveObjectInLocalStorage(SHOW_FILL_WEEK, DEFAULT_SHOW_FILL_WEEK);
    await saveObjectInLocalStorage(SHOW_FILL_DAY, DEFAULT_SHOW_FILL_DAY);
}

function setScheduleValues(weekdayItem){
    setScheduleForCard('08:00', '12:00', '00:30', '08:00', weekdayItem);
}

function resetScheduleValues(weekdayItem){
    setScheduleForCard('', '', '', weekdayItem);
}

function toggleTimeOnClick(element){
    if (element.currentTarget.checked){
        setScheduleValues(element.currentTarget.getAttribute("data-weekday"));
    } else {
        resetScheduleValues(element.currentTarget.getAttribute("data-weekday"));
    }
}

async function createFormCheckRow(weekdayItem){
    let rowDiv = document.createElement('div');
    rowDiv.className = "form-group row";
    
    let rowMarginDiv = document.createElement('div');
    rowMarginDiv.className = 'ml-3';

    let rowFormCheckDiv = document.createElement('div');
    rowFormCheckDiv.className = 'col-sm form-check form-switch';

    let rowFormInputElement = document.createElement('input');
    rowFormInputElement.className = 'form-check-input';
    rowFormInputElement.type = 'checkbox';
    rowFormInputElement.id = weekdayItem + '-isActive';
    rowFormInputElement.setAttribute('aria-describedby', weekdayItem + '-isActiveHelp');
    rowFormInputElement.setAttribute('data-weekday', weekdayItem);
    rowFormInputElement.addEventListener('change', toggleTimeOnClick);

    let rowFormLabelElement = document.createElement('label');
    rowFormLabelElement.className = 'form-check-label';
    rowFormLabelElement.id = weekdayItem + '-isActiveHelp';
    rowFormLabelElement.setAttribute('for', weekdayItem + '-isActive');
    rowFormLabelElement.innerText = browser.i18n.getMessage('workdayEnabled');

    rowFormCheckDiv.append(rowFormLabelElement);
    rowFormCheckDiv.append(rowFormInputElement);

    rowMarginDiv.append(rowFormCheckDiv);

    rowDiv.append(rowMarginDiv);

    return rowDiv;
}

async function createFormInputRow(weekdayItem, label, type){
    let rowDiv = document.createElement('div');
    rowDiv.className = "form-group row";
    
    let rowColDiv = document.createElement('div');
    rowColDiv.className = 'col-sm';

    let rowFormInputElement = document.createElement('input');
    rowFormInputElement.className = 'form-control form-input';
    rowFormInputElement.type = 'time';
    rowFormInputElement.id = weekdayItem + '-' + type + '-timeInput';
    rowFormInputElement.setAttribute('aria-describedby', weekdayItem + '-' + type + '-timeInputLabel');

    let rowFormLabelElement = document.createElement('label');
    rowFormLabelElement.className = 'col-4 col-form-label';
    rowFormLabelElement.id = weekdayItem + '-' + type + '-timeInputLabel';
    rowFormLabelElement.setAttribute('for', weekdayItem + '-' + type + '-timeInput');
    rowFormLabelElement.innerText = label;

    rowColDiv.append(rowFormInputElement);

    rowDiv.append(rowFormLabelElement);
    rowDiv.append(rowColDiv);

    return rowDiv;
}

async function createScheduleLayout(){
    const weekdayCards = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const timeEdits = ["start", "pauseStart", "pause", "hours"];

    for (let weekdayItem of weekdayCards){
        let item = document.getElementById(weekdayItem + '-card');

        let cardDiv = document.createElement('div');
        cardDiv.className = 'card border-dark mb-3';
        
        let cardDivHeader = document.createElement('div');
        cardDivHeader.className = 'card-header';
        cardDivHeader.innerText = browser.i18n.getMessage(weekdayItem);

        var cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        var formCheckRow = await createFormCheckRow(weekdayItem);
        cardBody.append(formCheckRow);

        for (let timeItem of timeEdits){
            var inputRow = await createFormInputRow(weekdayItem, browser.i18n.getMessage(timeItem), timeItem);
            cardBody.append(inputRow)
        }

        cardDiv.append(cardDivHeader);
        cardDiv.append(cardBody);

        item.append(cardDiv);
    }
}

async function setScheduleForCard(start, pauseStart, pause, hours, weekday){
    var activeSwitch = document.getElementById(weekday + '-isActive');
    if (start != '' && pauseStart != '' && pause != '' && hours != '')
    {
        activeSwitch.checked = true;
    }
    else
    {
        activeSwitch.checked = false;
    }

    var startInput =  document.getElementById(weekday + '-start-timeInput');
    startInput.value = padTimeIfNeeded(start);

    var pauseStartInput =  document.getElementById(weekday + '-pauseStart-timeInput');
    pauseStartInput.value = padTimeIfNeeded(pauseStart);

    var pauseInput =  document.getElementById(weekday + '-pause-timeInput');
    pauseInput.value = padTimeIfNeeded(pause);

    var hoursInput =  document.getElementById(weekday + '-hours-timeInput');
    hoursInput.value = padTimeIfNeeded(hours);
}

async function isScheduleActive(weekday){
    var activeSwitch = document.getElementById(weekday + '-isActive');
    return activeSwitch.checked;
}

async function getScheduleFromCard(weekday){
    var startInput =  document.getElementById(weekday + '-start-timeInput');
    var pauseStartInput = document.getElementById(weekday + '-pauseStart-timeInput');
    var pauseInput =  document.getElementById(weekday + '-pause-timeInput');
    var hoursInput =  document.getElementById(weekday + '-hours-timeInput');

    schedule = {};
    schedule.start = startInput.value;
    schedule.pauseStart = pauseStartInput.value;
    schedule.pause = pauseInput.value;
    schedule.hours = hoursInput.value;

    return schedule;
}

async function setSchedule(schedule){
    var i = 0;

    for(let singleWeekday of weekdays){
        if (schedule[i] == null){
            i++;
            continue;
        }
       
        await setScheduleForCard(schedule[i][0].start, schedule[i][0].pauseStart, schedule[i][0].pause, schedule[i][0].hours, singleWeekday);
        i++;
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restore_options() {
    let entropyMinutes = await getObjectFromLocalStorage(ENTROPY_MINUTES);
    let schedule = await getObjectFromLocalStorage(SCHEDULE);
    let showFillMonth = await getObjectFromLocalStorage(SHOW_FILL_MONTH);
    let showFillWeek = await getObjectFromLocalStorage(SHOW_FILL_WEEK);
    let showFillDay = await getObjectFromLocalStorage(SHOW_FILL_DAY);
    
    if (showFillWeek == null || entropyMinutes == null || schedule == null || showFillMonth == null || showFillWeek == null || showFillDay == null){
               
        if (entropyMinutes == null)
        {
            await saveObjectInLocalStorage(ENTROPY_MINUTES, DEFAULT_ENTROPY_MINUTES);
        }

        if (schedule == null)
        {
            await saveObjectInLocalStorage(SCHEDULE, DEFAULT_SCHEDULE);
        }

        if (showFillMonth == null)
        {
            await saveObjectInLocalStorage(SHOW_FILL_MONTH, DEFAULT_SHOW_FILL_MONTH);
        }

        if (showFillWeek == null)
        {
            await saveObjectInLocalStorage(SHOW_FILL_WEEK, DEFAULT_SHOW_FILL_WEEK);
        }

        if (showFillDay == null)
        {
            await saveObjectInLocalStorage(SHOW_FILL_DAY, DEFAULT_SHOW_FILL_DAY);
        }

        entropyMinutes = await getObjectFromLocalStorage(ENTROPY_MINUTES);
        schedule = await getObjectFromLocalStorage(SCHEDULE);
        showFillMonth = await getObjectFromLocalStorage(SHOW_FILL_MONTH);
        showFillWeek = await getObjectFromLocalStorage(SHOW_FILL_WEEK);
        showFillDay = await getObjectFromLocalStorage(SHOW_FILL_DAY);
    }

    await setSchedule(schedule);

    document.getElementById('entropy').value = entropyMinutes;
    document.getElementById('showMonthInput').checked = showFillMonth;
    document.getElementById('showDayInput').checked = showFillDay;
    document.getElementById('showWeekInput').checked = showFillWeek;
}

async function loadLocalizations(){
    //Run for all elements with the tag
    document.querySelectorAll("[data-i18n-key]")
            .forEach(translateElement);
}

function translateElement(element) {
    const key = element.getAttribute("data-i18n-key");
    const translation =  browser.i18n.getMessage(key);
    element.innerText = translation;
}

async function setHandlers(){
    document.getElementById('saveBtn').addEventListener('click', save_options);
    document.getElementById('reset').addEventListener('click', reset_to_defaults);
}

async function domLoaded(){
    await loadLocalizations();
    await setHandlers();
    await createScheduleLayout();
    await restore_options();
}

document.addEventListener('DOMContentLoaded', domLoaded);