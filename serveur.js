var express = require('express');

var app = express();

console.log(__dirname + '/assets');
app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
    var message = "Loïck ne sait pas coder";
    res.render('index.ejs', {param1: message});
});

app.get('/standard', function(req, res) {
    res.render('interface-standard.ejs');
});

app.listen(8000);
