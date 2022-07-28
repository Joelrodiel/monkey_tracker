const $ = (x) => document.querySelector(x);
const $$ = (x) => document.querySelectorAll(x);

var noteCellNum = 32;

const audioCtx = new AudioContext();
var noteBuffer = [];

const lineRegex = new RegExp();

var interVal;
var noteNum = 0;
var noteElem;
var noteSpd = 500;
var noteMarks;
var noteCells = [];
var looping = false;
var accidentMode = 0;

function init() {
    generateNoteTable();
    noteMarks = $$(".noteMark td");
    document.getElementById('playBtn').onclick = playAction;
    loadSample("assets/piano-C4.wav");
    $("#acclNatural").checked = true;
}

const loadSample = (path) => {
  const request = new XMLHttpRequest();
  request.open("GET", path);
  request.responseType = "arraybuffer";
  request.onload = function() {
    let undecodedAudio = request.response;
    audioCtx.decodeAudioData(undecodedAudio, (data) => noteBuffer = data);
  };
  request.send();
}

function playAction() {
    audioCtx.resume();
    noteNum = 0;
    noteElem = document.getElementById('ch1n0');
    noteCellElem = document.getElementById('ch1cll0');
    interVal = setInterval(stepAction, noteSpd);
}

function stepAction() {
    if (noteNum > 0) {
        noteMarks[noteNum].textContent = '';
    }
    if (noteNum >= noteCellNum) {
        if (!looping) {
            console.log("Cleared!");
            clearInterval(interVal);
            return;
        }
        noteNum = 0;
    }
    noteMarks[noteNum + 1].textContent = '↓';
    
    for (const n of noteCells[noteNum]) {
        let note = n.note;
        for (const [effect, val] of Object.entries(n.effects)) {
            if (effect === "acc") {
                val > 1 ? note-- : note++;
            }
        }
        playNote(note, n.vol);
    }

    console.log("Step " + noteNum);
    noteNum++;
}

function playNote(note, vol) {
    const source = audioCtx.createBufferSource();
    source.buffer = noteBuffer;
    source.playbackRate.value = 2 ** ((note - 60) / 12);
    var gain = audioCtx.createGain();
    gain.gain.setValueAtTime(vol / 150, 0);
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start(0);
}

function stopAction() {
    clearInterval(interVal)
    if (noteNum > 0) {
        noteMarks[noteNum].textContent = '';
    }
}

function onCheck(row, col) {
    // console.log("Row:", row, " & Col:", col, " check!");
    let rm = false;
    let rmEffs = {};
    for (const [i, n] of noteCells[col].entries()) {
        if (n.row == row) {
            rmEffs = n.effects;
            noteCells[col].splice(i, 1);
            rm = true;
        }
    }
    if (!rm) {
        let noteVol = $('#noteVol').valueAsNumber;
        let noteNum = rowToNote[row];
        let effects = {};
        if (accidentMode > 0) {
            effects.acc = accidentMode;
        }

        spawnNote(row, col, noteNum, 1, noteVol, effects, false);
    } else {
        removeNote(row, col, rmEffs, true);
    }
    console.log(noteCells);
}

function spawnNote(row, col, noteNum, inst, vol, effs, chk = true) {
    let note = {row: row, note: noteNum, instrument: inst, vol: vol, effects: effs};
    let noteElem = $(`#n${row}\\,${col}`);

    for (const [key, val] of Object.entries(effs)) {
        if (key === "acc" && val > 0) {
            const pp = document.createElement("p");
            pp.innerHTML = val == 1 ? "&#9839;" : "&#9837;";
            pp.id = `acc${row},${col}`;
            pp.classList.add("accidental");
            pp.classList.add(`accidental${val}`);
            noteElem.parentElement.appendChild(pp);
        }
    }
    // console.log(note);

    noteCells[col].push(note);

    if (chk) {
        noteElem.checked = true;
    }
}

function generateNoteTable() {
    var noteRows = $$(".noteRow");

    for (const [i, row] of noteRows.entries()) {
        for (let j = 0; j < noteCellNum; j++) {
            let noteCell = document.createElement("td");
            noteCell.style = "position: relative;";
            let noteChk = document.createElement("input");
            noteChk.type = "checkbox";
            noteChk.id = `n${i},${j}`;
            noteChk.onchange = onCheck.bind(null, i, j);
            noteCell.appendChild(noteChk);
            row.appendChild(noteCell);
        }
    }

    var noteMark = $(".noteMark");

    for (let i = 0; i < noteCellNum; i++) {
        noteMark.appendChild(document.createElement("td"));
        noteCells.push([]);
    }
}

function clearNotes() {
    for (const [i, col] of noteCells.entries()) {
        for (const n of col) {
            removeNote(n.row, i, n.effects);
        }
        noteCells[i].length = 0;
    }
}

function removeNote(row, col, effs, unchk = true) {
    if (unchk) {
        let chk = $(`#n${row}\\,${col}`);
        chk.checked = false;
    }

    for (const [effect, val] of Object.entries(effs)) {
        if (effect === "acc") {
            $(`#acc${row}\\,${col}`).remove();
        }
    }
}

function onChangeNoteSpd() {
    let num = document.getElementById("noteSpd").valueAsNumber;
    if (isNaN(num)) {
        num = 120;
        document.getElementById("noteSpd").valueAsNumber = num;
    } else if (num < 1) {
        num = 1;
        document.getElementById("noteSpd").valueAsNumber = num;
    }
    noteSpd = BPM_MILL / num;
    console.log("Note spd is now " + noteSpd);
}

function saveSong() {
    let out = `MNKY${noteCellNum},${noteSpd},${looping ? 1 : 0}`;
    for (const [i, col] of noteCells.entries()) {
        for (const n of col) {
            out += `\nn${i},${n.row},${n.note},${n.instrument},${n.vol}`;
            for (const [effect, val] of Object.entries(n.effects)) {
                out += `,(${effectIndex[effect]},${val})`;
            }
        }
    }
    console.log(out);

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(out));
    element.setAttribute('download', 'song.mnky');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function loadSongAction() {
    const fileInput = $("#loadSongInput");
    fileInput.click();
    fileInput.onchange = () => {
        loadSong(fileInput.files[0]);
    }
}

async function loadSong(file) {
    const contents = await file.text();

    // Check file signature
    if (!/^(MNKY)/g.test(contents)) {
        alert("Not a valid song file!");
        return;
    }

    clearNotes();

    const meta = Array.from(contents.matchAll(/^MNKY(\d+),(\d+),(\d+)$/gm))[0];
    // noteCellNum = parseInt(meta[1]);
    noteSpd = parseInt(meta[2]);
    document.getElementById("noteSpd").valueAsNumber = BPM_MILL / noteSpd;
    if (parseInt(meta[3]) != looping) {
        toggleLoop();
    }

    const lines = contents.matchAll(/^n(\d+),(\d+),(\d+),(\d+),(\d+)((?:,\(\d+,\d+\))*)$/gm);
    for (const n of lines) {
        let effects = {};
        if (n[6] !== "") {
            const parseEffs = n[6].matchAll(/(?:,\((\d+),(\d+)\))/gm);
            for (const e of parseEffs) {
                effects[Object.keys(effectIndex).find(key => effectIndex[key] === parseInt(e[1]))] = parseInt(e[2]);
            }
        }
        console.log(effects);

        spawnNote(parseInt(n[2]), parseInt(n[1]), parseInt(n[3]), parseInt(n[4]), parseInt(n[5]), effects);
    }
}

function toggleLoop() {
    const loopBtn = $("#loopBtn");
    if (looping) {
        looping = false;
        loopBtn.innerText = 'Looping: off';
    } else {
        looping = true;
        loopBtn.innerText = 'Looping: on';
    }
}

function onNoteTypeChange(type) {
    accidentMode = parseInt(type);
}

init();

const rowToNote = [
    69, 67, 65, 64, 62, 60, 59, 57, 55, 53, 52, 50, 48, 47
]

const BPM_MILL = 60000;

const effectIndex = {
    "acc": 0,
}