function timeToDate(timeString){
    return new Date(Date.parse(timeString))
}

// Saves options to chrome.storage
async function save_options() {
    var entropy = document.getElementById('entropy').value;
    //var schedule = JSON.parse(document.getElementById('schedule').value);
    var allowPrefill = document.getElementById('allowPrefill').checked;

    await saveObjectInLocalStorage('ENTROPY_MINUTES', entropy);
    //await saveObjectInLocalStorage('SCHEDULE', schedule);
    await saveObjectInLocalStorage('ALLOW_PREFILL', allowPrefill);

    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '';
    }, 750);
}

async function reset_to_defaults() {

    await set_defaults();
    await restore_options();

    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options restored.';
    setTimeout(function() {
        status.textContent = '';
    }, 750);
}

async function set_defaults(){
    await saveObjectInLocalStorage('ENTROPY_MINUTES', DEFAULT_ENTROPY_MINUTES);
    await saveObjectInLocalStorage('SCHEDULE', DEFAULT_SCHEDULE);
    await saveObjectInLocalStorage('ALLOW_PREFILL', DEFAULT_ALLOW_PREFILL);
}

function changeBorderOnClick(element){
    if (element.checked != null){

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
    rowFormInputElement.addEventListener('click', changeBorderOnClick);

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
    rowFormInputElement.className = 'form-control';
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
    const timeEdits = ["start", "pause", "hours"];

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

function padTimeIfNeeded(time){
    let values = time.split(':');
    
    let hours = parseInt(values[0]);
    let minutes = parseInt(values[1]);
    
    let hoursResult = hours < 10 ? '0' + hours : hours;
    let minutesResult = minutes < 10 ? '0' + minutes : minutes;
    
    return hoursResult + ':' + minutesResult;
}

async function setScheduleForCard(scheduleItem, weekday){
    var activeSwitch = document.getElementById(weekday + '-isActive');
    activeSwitch.checked = 'checked';

    var startInput =  document.getElementById(weekday + '-start-timeInput');
    startInput.value = padTimeIfNeeded(scheduleItem[0].start);

    var pauseInput =  document.getElementById(weekday + '-pause-timeInput');
    pauseInput.value = padTimeIfNeeded(scheduleItem[0].pause);

    var hoursInput =  document.getElementById(weekday + '-hours-timeInput');
    hoursInput.value = padTimeIfNeeded(scheduleItem[0].hours);
}

async function setSchedule(schedule){
    let weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    var i = 0;

    for(let singleWeekday of weekdays){
        if (schedule[i] == null){
            i++;
            continue;
        }
       
        await setScheduleForCard(schedule[i], singleWeekday);
        i++;
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restore_options() {
    let entropy_minutes = await getObjectFromLocalStorage('ENTROPY_MINUTES');
    let schedule = await getObjectFromLocalStorage('SCHEDULE');
    let allowPrefill = await getObjectFromLocalStorage('ALLOW_PREFILL');

    if (entropy_minutes == null || schedule == null || allowPrefill == null){
        await set_defaults();

        entropy_minutes = await getObjectFromLocalStorage('ENTROPY_MINUTES');
        schedule = await getObjectFromLocalStorage('SCHEDULE');
        allowPrefill = await getObjectFromLocalStorage('ALLOW_PREFILL');
    }

    document.getElementById('entropy').value = entropy_minutes;
    await setSchedule(schedule);
    //document.getElementById('schedule').value = schedule;
    document.getElementById('showMonthInput').checked = allowPrefill;
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

async function domLoaded(){
    await loadLocalizations();
    await createScheduleLayout();
    await restore_options();
}

document.addEventListener('DOMContentLoaded', domLoaded);

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('reset').addEventListener('click', reset_to_defaults);