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

function init() {
    generateNoteTable();
    noteMarks = $$(".noteMark td");
    document.getElementById('playBtn').onclick = playAction;
    loadSample("assets/piano-C4.wav");
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
        console.log("Cleared!");
        clearInterval(interVal);
        return;
    }
    noteMarks[noteNum + 1].textContent = '↓';
    
    for (const n of noteCells[noteNum]) {
        playNote(n);
    }

    console.log("Step " + noteNum);
    noteNum++;
}

function playNote(n) {
    const source = audioCtx.createBufferSource();
    source.buffer = noteBuffer;
    console.log(n);
    source.playbackRate.value = 2 ** ((n.note - 60) / 12);
    var gain = audioCtx.createGain();
    gain.gain.setValueAtTime(n.vol / 150, 0);
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
    for (const [i, n] of noteCells[col].entries()) {
        if (n.row == row) {
            noteCells[col].splice(i, 1);
            rm = true;
        }
    }
    if (!rm) {
        let noteVol = $('#noteVol').valueAsNumber;
        noteCells[col].push({row: row, note: rowToNote[row], instrument: 1, vol: noteVol});
    }
    console.log(noteCells);
}

function generateNoteTable() {
    var noteRows = $$(".noteRow");

    for (const [i, row] of noteRows.entries()) {
        for (let j = 0; j < noteCellNum; j++) {
            let noteCell = document.createElement("td");
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
            let chk = $(`#n${n.row}\\,${i}`);
            chk.checked = false;
        }
        noteCells[i].length = 0;
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
    noteSpd = 60000 / num;
    console.log("Note spd is now " + noteSpd);
}

// TODO: Save song metadata (spd, etc...)
function saveSong() {
    let out = '';
    for (const [i, col] of noteCells.entries()) {
        for (const n of col) {
            out += `${i},${n.row},${n.note},${n.instrument},${n.vol}\n`;
        }
    }
    console.log(out);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(out));
    element.setAttribute('download', 'song.txt');

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
    clearNotes();
    const lines = contents.matchAll(/^(\d+),(\d+),(\d+),(\d+),(\d+)$/gm);
    for (const n of lines) {
        noteCells[n[1]].push({row: parseInt(n[2]), note: parseInt(n[3]), instrument: parseInt(n[4]), vol: parseInt(n[5])});
        $(`#n${parseInt(n[2])}\\,${parseInt(n[1])}`).checked = true;
    }
    console.log(noteCells);
}

init();

const rowToNote = [
    69, 67, 65, 64, 62, 60, 59, 57, 55, 53, 52, 50, 48, 47
]