const audioCtx = new AudioContext();

if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({"audio": true})
    .then((stream) => {
        const mic = audioCtx.createMediaStreamSource(stream);
    }).catch((err) => {
        alert("Error:", err);
    });
} else {
    alert("Error: Unable to access media devices... Please update browser.");
}