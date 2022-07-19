const $ = (x) => document.querySelector(x);
const $$ = (x) => document.querySelectorAll(x);

const CHANNELS = 13;
const NOTE_NUMS = 10;

const audioCtx = new AudioContext();
var noteBuffer = [];

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
    if (noteNum >= NOTE_NUMS) {
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
            break;
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
        for (let j = 0; j < NOTE_NUMS; j++) {
            let noteCell = document.createElement("td");
            let noteChk = document.createElement("input");
            noteChk.type = "checkbox";
            noteChk.onchange = onCheck.bind(null, i, j);
            noteCell.appendChild(noteChk);
            row.appendChild(noteCell);
        }
    }

    var noteMark = $(".noteMark");

    for (let i = 0; i < NOTE_NUMS; i++) {
        noteMark.appendChild(document.createElement("td"));
        noteCells.push([]);
    }
}

function onChangeNoteSpd() {
    noteSpd = document.getElementById("noteSpd").valueAsNumber;
    console.log("New Note Speed is " + noteSpd);
}

init();

const rowToNote = [
    69, 67, 65, 64, 62, 60, 59, 57, 55, 53, 52, 50, 48, 47
]