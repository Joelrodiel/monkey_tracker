var express = require('express')
var app = express()

app.use(express.static(__dirname));

app.get('/', function(req, res) {
	res.header("Cross-Origin-Opener-Policy", "same-origin")
	res.header("Cross-Origin-Embedder-Policy", "require-corp")
	res.sendFile(__dirname + "/index.html")
});

// app.listen(4200, '192.168.1.232', () => {
app.listen(4200, () => {
	console.info("Server started on port 4200");
})
