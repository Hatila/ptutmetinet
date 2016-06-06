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
    /**
     * @TODO : Pas de champs vide envoyé
     * Ajouter la possibilité de supprimer une ligne vide
     */
    var requestType = req.body.KEYWORD;
    var nodeType = null;
    var nodeValue = null;
    var cypherRequest = null;
    var cypherRequestUnique = [];
    var boolean = true;
    var i = 0;
    var jsonData = [];
    
    if(typeof req.body.typeNode !== 'undefined'){
        nodeType = req.body.typeNode.replace(' ','_');
        nodeValue = nodeType.toString().toLowerCase();
    }
    
    switch(requestType){
        //Create state
        case 'CREATE':
            cypherRequest = {query : requestType+" ("+nodeValue+":"+nodeType+" {"};
            while(boolean){
                var obj = {};
                var attributeName = eval('req.body.attributesName'+i);
                var attributeValue = eval('req.body.attributesValue'+i);
                var uniqueConstraint = eval('req.body.uniqueConstraint'+i);
                
                if(typeof attributeName === 'undefined' || typeof attributeValue === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                    console.log("stop");
                } else {
                    attributeName = attributeName.replace(' ','_');
                    cypherRequest.query += attributeName+' : "'+attributeValue+'",';
                }
                if(typeof uniqueConstraint !== 'undefined'){
                    cypherRequestUnique.push('CREATE CONSTRAINT ON ('+nodeValue+':'+nodeType+') ASSERT '+nodeValue+'.'+attributeName+' IS UNIQUE; ');
                }
                i++;
            }
            cypherRequest.query+= '}) RETURN '+nodeValue+';';
            break;
        //Update state
        case 'SET':
            i=1;
            var attributesName0 = req.body.attributesName0.replace(' ','_');
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+attributesName0+':"'+req.body.attributesValue0+'"}) SET '};
            while(boolean){
                var attributeName = eval('req.body.attributesName'+i);
                var attributeValue = eval('req.body.attributesValue'+i);
                
                if(typeof attributeName === 'undefined' || typeof attributeValue === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                    console.log("stop");
                } else {
                    console.log(attributeName);
                    attributeName = attributeName.replace(' ','_');
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
            var attributeAim = req.body.attributeAim.replace(' ','_');
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+attributeAim+':"'+req.body.attributeAimValue+'"}) REMOVE '};
            while(boolean){
                var attributeName = eval('req.body.attributesName'+i);
                
                if(typeof attributeName === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                } else {
                    attributeName = attributeName.replace(' ','_');
                    cypherRequest.query += nodeValue+"."+attributeName+',';
                }
                i++;
            }
            cypherRequest.query += ' RETURN '+nodeValue+';';
            break;
        case 'RELATIONSHIP':
            var attributeAim = req.body.attributeAim.replace(' ','_');
            var relationshipName = req.body.relationshipName.replace(' ','_');
            var uniqueConstraint = eval('req.body.uniqueConstraint'+i);
            
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+')'};
            if(req.body.otherNodeType !== '' && otherNodeAttributeAim !== '' && req.body.otherNodeAttributeAimValue !== ''){
                var otherNodeType = req.body.otherNodeType.replace(' ','_');
                var otherNodeAttributeAim = req.body.otherNodeAttributeAim.replace(' ','_');
                
                cypherRequest.query += ', (r:'+req.body.otherNodeType+')';
                cypherRequest.query += ' WHERE '+nodeValue+'.'+attributeAim+'="'+req.body.attributeAimValue+'"';
                cypherRequest.query += ' AND r.'+otherNodeAttributeAim+'="'+req.body.otherNodeAttributeAimValue+'"';
                if(typeof uniqueConstraint !== 'undefined'){
                    cypherRequest.query += 'CREATE UNIQUE ('+nodeValue+')-[:'+relationshipName+']->(r)';
                } else {
                    cypherRequest.query += ' CREATE ('+nodeValue+')-[:'+relationshipName+']->(r)';
                }
            } else {
                cypherRequest.query += ' WHERE '+nodeValue+'.'+attributeAim+'="'+req.body.attributeAimValue+'"';
                if(typeof uniqueConstraint !== 'undefined'){
                    cypherRequest.query += 'CREATE UNIQUE ('+nodeValue+')-[:'+relationshipName+']->('+nodeValue+')';
                } else {
                    cypherRequest.query += ' CREATE ('+nodeValue+')-[:'+relationshipName+']->('+nodeValue+')';
                }
            }
            //}) CREATE ('+nodeValue+')-[:'+req.body.relationshipName+']->('+nodeValue+')'};
            break;
        case 'DELETE_RELATIONSHIP':
            var otherNodeType = null;
            var otherNodeValue = null;
            
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+')-'};
            if(req.body.otherNodeType !== '' && req.body.otherNodeAttributeAim !== '' && req.body.otherNodeAttributeAimValue !== ''){
                var random = randomize();
                
                var otherNodeAttributeAim = req.body.otherNodeAttributeAim.replace(' ','_');
                var attributeAim = req.body.attributeAim.replace(' ','_');
                var relationshipName = req.body.relationshipName.replace(' ','_');
                otherNodeType = req.body.otherNodeType.replace(' ','_');
                otherNodeValue = otherNodeType.toString().toLowerCase();
                otherNodeValue += random;
                
                cypherRequest.query += '[rel:'+relationshipName+']->('+otherNodeValue+':'+otherNodeType+')';
                cypherRequest.query += ' WHERE '+nodeValue+'.'+attributeAim+'="'+req.body.attributeAimValue+'"';
                cypherRequest.query += ' AND '+otherNodeValue+'.'+otherNodeAttributeAim+'="'+req.body.otherNodeAttributeAimValue+'"';
            } else {
                cypherRequest.query += '[rel:'+relationshipName+']->('+nodeValue+':'+nodeType+')';
                cypherRequest.query += ' WHERE '+nodeValue+'.'+attributeAim+'="'+req.body.attributeAimValue+'"';
            }
            
            cypherRequest.query += ' DELETE rel;';
            
            break;
        case 'UPDATE_RELATIONSHIP':
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+req.body.attributeAim+':"'+req.body.attributeAimValue+'"})-'};
            if(req.body.otherNodeType !== '' && req.body.otherNodeAttributeAim !== '' && req.body.otherNodeAttributeAimValue !== ''){
                var random = randomize();
                var otherNodeAttributeAim = req.body.otherNodeAttributeAim.replace(' ','_');
                var attributeAim = req.body.attributeAim.replace(' ','_');
                var relationshipName = req.body.relationshipName.replace(' ','_');
                var newRelationshipName = req.body.newRelationshipName.replace(' ','_');
                otherNodeType = req.body.otherNodeType;
                otherNodeValue = otherNodeType.toString().toLowerCase()+random;
                
                cypherRequest.query += '[rel:'+relationshipName+']->('+otherNodeValue+':'+otherNodeType+' {'+otherNodeAttributeAim+':"'+req.body.otherNodeAttributeAimValue+'"})';
                cypherRequest.query += ' CREATE ('+nodeValue+')-[rel2:'+newRelationshipName+']->('+otherNodeValue+')';
            } else {
                cypherRequest.query += '[rel:'+relationshipName+']->('+nodeValue+':'+nodeType+' {'+attributeAim+':'+req.body.attributeAimValue+'})';
                cypherRequest.query += ' CREATE ('+nodeValue+')-[rel2:'+newRelationshipName+']->('+nodeValue+')';
            }
            
            cypherRequest.query += ' SET rel2 = rel WITH rel DELETE rel'
            break;
        case 'DELETE_DATABASE':
            cypherRequest = {query : 'MATCH (n) DETACH DELETE n;'};
            break;
        default:
            //@TODO
    }
    
    
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
    
    if(cypherRequestUnique.length > 0){
        for(var i = 0; i< cypherRequestUnique.length; i++){
            r.post({
                uri: txUrl,
                json: {
                    statements: [{
                        statement: cypherRequestUnique[i],
                        resultDataContents: ["graph"]
                    }]
                }
            },
            function (err, result) {
                if (err) {
                    throw err
                };
            });
        }
    }
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


function randomize(){
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + s4() + s4();
}