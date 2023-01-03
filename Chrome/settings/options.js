// Saves options to chrome.storage
async function save_options() {
    var entropy = document.getElementById('entropy').value;
    var schedule = JSON.parse(document.getElementById('schedule').value);
    var allowPrefill = document.getElementById('allowPrefill').checked;

    await saveObjectInLocalStorage('ENTROPY_MINUTES', entropy);
    await saveObjectInLocalStorage('SCHEDULE', schedule);
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restore_options() {
    let entropy_minutes = await getObjectFromLocalStorage('ENTROPY_MINUTES');
    let schedule = JSON.stringify(await getObjectFromLocalStorage('SCHEDULE'), null, 2);
    let allowPrefill = await getObjectFromLocalStorage('ALLOW_PREFILL');

    if (entropy_minutes == null || schedule == null || allowPrefill == null){
        await set_defaults();

        entropy_minutes = await getObjectFromLocalStorage('ENTROPY_MINUTES');
        schedule = JSON.stringify(await getObjectFromLocalStorage('SCHEDULE'), null, 2);
        allowPrefill = await getObjectFromLocalStorage('ALLOW_PREFILL');
    }

    document.getElementById('entropy').value = entropy_minutes;
    document.getElementById('schedule').value = schedule;
    document.getElementById('allowPrefill').checked = allowPrefill;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('reset').addEventListener('click', reset_to_defaults);