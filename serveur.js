var express = require('express');

var app = express();

app.get('/', function(req, res) {
    var message = "Alexandre ne sait pas coder";
    res.render('index.ejs', {param1: message});
});

app.listen(8000);
