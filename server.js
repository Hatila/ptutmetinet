var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded());

var neo4j = require('node-neo4j');
db = new neo4j('http://neo4j:naruto@localhost:7474');


app.use(express.static(__dirname + '/assets'));
app.set("view engine", "ejs");

app.get('/', function(req, res) {
    var message = "Loïck ne sait pas coder";
    res.render('index.ejs', {param1: message});
});

app.get('/test', function(req, res) {
   res.render('test.ejs');
});

app.get('/graph', function(req, res) {
   res.render('graph.ejs');
});

app.get('/userFriendly', function(req, res) {
    res.render('interface-userFriendly.ejs');
});

app.get('/standard', function(req, res) {
    res.render('interface-standard.ejs', {requete: "null"});
});

app.post('/standard', function(req, res){
    var message = req.body.ntm;
    var json;
    db.cypherQuery(message, function(err, result){
        if(err){ throw err};
       json = result.data; // delivers an array of query results
//       json = JSON.parse(json);
       res.render('interface-standard.ejs', {requete: json});
    });
    
});

app.listen(8000);
