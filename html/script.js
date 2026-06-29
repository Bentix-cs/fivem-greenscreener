// ============================================================================
//  fivem-greenscreener NUI
//  - Classic progress overlay (/screenshot, /customscreenshot, ... commands)
//  - /clothes control panel (selection, progress, ETA, pause/resume/stop)
// ============================================================================

const RES = 'fivem-greenscreener'; // must match the resource folder name

// POSTs a NUI callback to the client script (RegisterNuiCallbackType).
function post(name, data) {
    return fetch(`https://${RES}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data || {}),
    }).catch(() => {});
}

const $ = (id) => document.getElementById(id);

// --- Panel state ------------------------------------------------------------
let activeGender = 'female'; // 'male' | 'female' | 'both'
let isRunning = false;
let isPaused = false;
let isStopping = false; // stop requested, waiting for the job to actually finish

const panel = $('clothes-panel');

// Builds the selectable component chips from the config sent by the client.
// Chips start selected; clicking toggles them (locked while a run is active).
function renderChips(listEl, items) {
    listEl.innerHTML = '';
    (items || []).forEach((it) => {
        const chip = document.createElement('div');
        chip.className = 'chip on';
        chip.dataset.id = it.id;
        chip.textContent = it.name || it.id;
        chip.addEventListener('click', () => {
            if (isRunning) return;
            chip.classList.toggle('on');
        });
        listEl.appendChild(chip);
    });
}

// Reads the currently selected component ids, split into clothing and props.
function collectComponents() {
    const grab = (sel) => Array.from(document.querySelectorAll(`${sel} .chip.on`)).map((c) => parseInt(c.dataset.id));
    return { CLOTHING: grab('#list-clothing'), PROPS: grab('#list-props') };
}

function setGender(g) {
    activeGender = g;
    document.querySelectorAll('#gender-seg .seg-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.gender === g);
    });
}

function gendersArray() {
    return activeGender === 'both' ? ['male', 'female'] : [activeGender];
}

// Toggles the panel between idle and running: while running the selection is
// locked and only pause/stop are usable.
function setRunning(running) {
    isRunning = running;
    $('btn-start').disabled = running;
    $('btn-pause').disabled = !running;
    $('btn-stop').disabled = !running;
    $('btn-close').disabled = false;
    // lock selection while running
    document.querySelectorAll('#gender-seg .seg-btn, #toggle-all').forEach((b) => (b.disabled = running));
    document.querySelectorAll('.opt input').forEach((i) => (i.disabled = running));
    if (!running) {
        isPaused = false;
        isStopping = false;
        $('btn-pause').textContent = 'Pause';
    }
}

// Disables every control while a stop is in flight, until the job reports done.
function setStopping() {
    isStopping = true;
    $('btn-start').disabled = true;
    $('btn-pause').disabled = true;
    $('btn-stop').disabled = true;
    $('btn-close').disabled = true;
    $('prog-label').textContent = 'Stopping...';
}

// Renders a progress snapshot from the client onto the bar, counters and ETA.
function updateProgress(d) {
    $('bar-fill').style.width = (d.percent || 0) + '%';
    $('prog-counts').textContent = `${d.done || 0} / ${d.total || 0}`;
    $('prog-percent').textContent = (d.percent || 0) + '%';
    $('prog-eta').textContent = d.eta || '--:--';
    $('prog-rate').textContent = d.rate || '0.00';
    // keep showing "Stopping..." while the job winds down
    if (d.label && !isStopping) $('prog-label').textContent = d.label;
    isPaused = !!d.paused;
    if (!isStopping) $('btn-pause').textContent = isPaused ? 'Resume' : 'Pause';
}

// --- Buttons ----------------------------------------------------------------
document.querySelectorAll('#gender-seg .seg-btn').forEach((b) => {
    b.addEventListener('click', () => { if (!isRunning) setGender(b.dataset.gender); });
});

$('toggle-all').addEventListener('click', () => {
    if (isRunning) return;
    const chips = document.querySelectorAll('#clothes-panel .chip');
    const anyOff = Array.from(chips).some((c) => !c.classList.contains('on'));
    chips.forEach((c) => c.classList.toggle('on', anyOff));
});

$('btn-start').addEventListener('click', () => {
    const components = collectComponents();
    if (!components.CLOTHING.length && !components.PROPS.length) {
        $('prog-label').textContent = 'Select at least one component';
        return;
    }
    setRunning(true);
    $('prog-label').textContent = 'Calculating...';
    post('clothes:start', {
        genders: gendersArray(),
        components,
        includeTextures: $('opt-textures').checked,
        skipExisting: $('opt-skip').checked,
    });
});

$('btn-pause').addEventListener('click', () => {
    if (!isRunning) return;
    if (isPaused) { post('clothes:resume'); isPaused = false; $('btn-pause').textContent = 'Pause'; }
    else { post('clothes:pause'); isPaused = true; $('btn-pause').textContent = 'Resume'; }
});

// Stop is asynchronous: the current screenshot must finish first, so we lock
// the controls and wait for the 'done' message before re-enabling them.
$('btn-stop').addEventListener('click', () => {
    if (!isRunning || isStopping) return;
    setStopping();
    post('clothes:stop');
});

function closePanel() {
    if (isStopping) return;
    panel.classList.add('hidden');
    post('clothes:close');
}
$('btn-close').addEventListener('click', closePanel);

document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden') && !isRunning) closePanel();
});

// --- Messages from Lua ------------------------------------------------------
window.addEventListener('message', (event) => {
    const data = event.data || {};

    // ----- Panel /clothes -----
    if (data.action === 'open') {
        if (data.config) {
            renderChips($('list-clothing'), data.config.clothing);
            renderChips($('list-props'), data.config.props);
        }
        setRunning(!!data.running);
        if (!data.running) updateProgress({ done: 0, total: 0, percent: 0, eta: '--:--', rate: '0.00' });
        panel.classList.remove('hidden');
        return;
    }
    if (data.action === 'progress') {
        // Don't re-enable controls if a stop is in flight (progress can still
        // arrive for the screenshot that is finishing up).
        if (!isStopping) setRunning(true);
        updateProgress(data);
        return;
    }
    if (data.action === 'done') {
        setRunning(false);
        $('prog-label').textContent = data.stopped ? 'Stopped' : 'Finished';
        return;
    }
    if (data.action === 'state') {
        // How many images already exist on disk (informational).
        $('state-line').textContent = `${data.count || 0} images on disk`;
        return;
    }
    if (data.action === 'error') {
        setRunning(false);
        $('prog-label').textContent = data.error === 'weathersync' ? 'Disable the weathersync resource!' : 'Error';
        return;
    }

    // ----- Classic overlay (legacy chat commands) -----
    if (data.hasOwnProperty('type')) {
        $('text').innerHTML = `${data.value}/${data.max} ${data.type}`;
        return;
    }
    if (data.hasOwnProperty('start')) {
        $('text').innerHTML = 'Loading up ...';
        $('container').style.display = 'block';
        return;
    }
    if (data.hasOwnProperty('end')) {
        $('text').innerHTML = 'Finished!';
        setTimeout(() => { $('container').style.display = 'none'; }, 2000);
        return;
    }
    if (data.hasOwnProperty('error')) {
        $('text').innerHTML = data.error === 'weathersync' ? 'Disable weathersync resource!' : 'Error!';
        $('container').style.display = 'block';
        setTimeout(() => { $('container').style.display = 'none'; }, 2000);
    }
});
