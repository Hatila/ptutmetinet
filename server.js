var express = require('express');
var bodyParser = require('body-parser');
var r=require("request");
var app = express();
app.use(bodyParser.urlencoded());

var neo4j = require('node-neo4j');
db = new neo4j('http://neo4j:naruto@localhost:7474');


app.use(express.static(__dirname + '/assets'));
app.set("view engine", "ejs");

app.get('/', function(req, res) {
    res.render('index.ejs');
});

app.get('/test', function(req, res) {
   res.render('test.ejs');
});

app.get('/graph', function(req, res) {
   res.render('graph.ejs');
});

app.get('/userFriendly', function(req, res) {
    res.render('interface-userFriendly.ejs', {requete : null});
});

app.post('/userFriendly', function(req, res){
    var requestType = req.body.KEYWORD;
    var nodeType = null;
    var nodeValue = null;
    var cypherRequest = null;
    var boolean = true;
    var i = 0;
    var jsonData = [];
    
    if(typeof req.body.typeNode !== 'undefined'){
        nodeType = req.body.typeNode;
        nodeValue = nodeType.toString().toLowerCase();
    }
    
    console.log(req.body);
    switch(requestType){
        //Create state
        case 'CREATE':
            cypherRequest = {query : requestType+" ("+nodeValue+":"+nodeType+" "};
            while(boolean){
                //Ajoute la 1ère accolade nécessaire pour séparer les propriétés
                if(i === 0){
                    cypherRequest.query += '{';
                }
                var obj = {};
                var attributeName = eval('req.body.attributesName'+i);
                var attributeValue = eval('req.body.attributesValue'+i);
                if(typeof attributeName === 'undefined' || typeof attributeValue === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                    console.log("stop");
                } else {
                    cypherRequest.query += attributeName+' : "'+attributeValue+'",';
                }
                i++;
            }
            cypherRequest.query+= '}) RETURN '+nodeValue+';';
            break;
        //Update state
        case 'SET':
            i=1;
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+req.body.attributesName0+':"'+req.body.attributesValue0+'"}) SET '};
            while(boolean){
                var attributeName = eval('req.body.attributesName'+i);
                var attributeValue = eval('req.body.attributesValue'+i);
                if(typeof attributeName === 'undefined' || typeof attributeValue === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                    console.log("stop");
                } else {
                    cypherRequest.query += nodeValue+"."+attributeName+' = "'+attributeValue+'",';
                }
                i++;
            }
            cypherRequest.query += ' RETURN '+nodeValue+';';
            break;
        case 'DELETE':
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+req.body.attributesName0+':"'+req.body.attributesValue0+'"}) DETACH DELETE '+nodeValue};
            break;
        case 'DELETE_PROPERTY':
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+req.body.attributeAim+':"'+req.body.attributeAimValue+'"}) REMOVE '};
            while(boolean){
                var attributeName = eval('req.body.attributesName'+i);
                if(typeof attributeName === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                } else {
                    cypherRequest.query += nodeValue+"."+attributeName+',';
                }
                i++;
            }
            cypherRequest.query += ' RETURN '+nodeValue+';';
            break;
        case 'RELATIONSHIP':
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+')'};
            if(typeof req.body.otherNodeType !== 'undefined' && typeof req.body.otherNodeAttributeAim !== 'undefined' && typeof req.body.otherNodeAttributeAimValue !== 'undefined'){
                cypherRequest.query += ', (r:'+req.body.otherNodeType+')';
                cypherRequest.query += ' WHERE '+nodeValue+'.'+req.body.attributeAim+'="'+req.body.attributeAimValue+'"';
                cypherRequest.query += ' AND r.'+req.body.otherNodeAttributeAim+'="'+req.body.otherNodeAttributeAimValue+'"';
                cypherRequest.query += ' CREATE ('+nodeValue+')-[:'+req.body.relationshipName+']->(r)';
            } else {
                cypherRequest.query += ' WHERE '+nodeValue+'.'+req.body.attributeAim+'="'+req.body.attributeAimValue+'"';
                cypherRequest.query += ' CREATE ('+nodeValue+')-[:'+req.body.relationshipName+']->('+nodeValue+')';
            }
            //}) CREATE ('+nodeValue+')-[:'+req.body.relationshipName+']->('+nodeValue+')'};
            break;
        case 'DELETE_DATABASE':
            cypherRequest = {query : 'MATCH (n) DETACH DELETE n;'};
            break;
        default:
            //@TODO
    }
    
    console.log(cypherRequest.query);
//    console.log(jsonData);
//    var jsonData = {query : "CREATE (n:Person { name : 'name' }) RETURN n"};
//    var jsonData = { query: 'CREATE (n:NewType {name:"World"}) RETURN "hello", n.name' }
//    var txUrl = "http://neo4j:naruto@localhost:7474/db/data/cypher";
    var txUrl = "http://neo4j:naruto@localhost:7474/db/data/transaction/commit";
    
    r.post({
            uri: txUrl,
            json: {
                statements: [{
                    statement: cypherRequest.query,
                    resultDataContents: ["graph"]
                }]
            }
        },
        function (err, result) {
            if (err) {
                throw err
            };
            json = JSON.stringify(result.body); // delivers an array of query results
            console.log(json);
            res.render('interface-userFriendly.ejs', {requete: json});
        });
})

app.get('/standard', function(req, res) {
    res.render('interface-standard.ejs', {requete: "null"});
});

app.post('/standard', function(req, res) {
    // var message =req.body.ntm;
    // message =  '{"statement":"'+req.body.ntm+'", "resultDataContents":["graph"]} ';
    var json;
    
    /*
     db.beginTransaction(
     {statements:[{
     statement:req.body.ntm,
     resultDataContents:["graph"]}]},
     function(err, result){
     if(err){ throw err};
     console.log(result);
     json = result.data; // delivers an array of query results
     console.log(json);
     res.render('interface-standard.ejs', {requete: json});}
     );
     */
    var txUrl = "http://neo4j:naruto@localhost:7474/db/data/transaction/commit";
    r.post({
            uri: txUrl,
            json: {
                statements: [{
                    statement: req.body.ntm,
                    resultDataContents: ["graph"]
                }]
            }
        },
        function (err, result) {
            if (err) {
                throw err
            };
            json = JSON.stringify(result.body); // delivers an array of query results
            console.log(json);
            res.render('interface-standard.ejs', {requete: json});
        });
});
app.listen(8080);
