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
    res.render('interface-userFriendly.ejs', {requete : "vide"});
});

app.post('/userFriendly', function(req, res){
    var json = null;
    var requestType = req.body.KEYWORD;
    var nodeType = null;
    var nodeValue = null;
    var cypherRequest = null;
    var cypherRequestUnique = [];
    var boolean = true;
    var i = 0;
    var jsonData = [];
    
    if(typeof req.body.typeNode !== 'undefined'){
        nodeType = req.body.typeNode.split(' ').join('_');
        nodeValue = nodeType.toString().toLowerCase();
    } else if(typeof req.body.typeNode0 !== 'undefined'){
        nodeType = req.body.typeNode0.split(' ').join('_');
        nodeValue = nodeType.toLowerCase();
    }
    
    switch(requestType){
        //Get all graph content
        case 'GET_GRAPH':
            cypherRequest = {query : 'MATCH (n) OPTIONAL MATCH (n)-[r]->() return n, r;'};
            break;
        //Search by node type
        case 'SEARCH_BY_NODE_TYPE':
            i = 1;
            console.log(req.body);
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+')'};
            var nodeArray = [nodeValue];
            while(boolean){
                var otherNodeType = eval('req.body.typeNode'+i);
                
                if(typeof otherNodeType === 'undefined'){
                    boolean = false;
                    console.log('stop');
                } else {
                    otherNodeType = otherNodeType.split(' ').join('_');
                    //Si le type de noeud est le même, on ajoute une valeur numérique afin de le rendre différent
                    if(otherNodeType === nodeType){
                        otherNodeType += i.toString();
                    }
                    otherNodeValue = otherNodeType.toLowerCase();
                    nodeArray.push(otherNodeValue);
                    nodeArray.push('r'+i);
                    //@TODO : Test if more than 3 nodeType
                    cypherRequest.query += '-[r'+i+']->('+otherNodeValue+')';
//                    cypherRequest.query += ',('+otherNodeValue+':'+otherNodeType+')';
                }
                i++;
            }
            cypherRequest.query += ' RETURN ';
            for(var j = 0; j < nodeArray.length;j++){
                cypherRequest.query += nodeArray[j]+',';
                if(j+1 === nodeArray.length){
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                }
            }
            break;
        case 'SEARCH_BY_NODE_TYPE_WITH_ATTRIBUTES':
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+') WHERE '};
            while(boolean){
                var attributesName = eval('req.body.attributesName'+i);
                var operator = eval('req.body.operator'+i);
                var attributesValue = eval('req.body.attributesValue'+i);
                
                if(typeof attributesName === 'undefined'){
                    boolean = false;
                    //Permet d'enlever le dernier ' AND ' inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-5));
                    console.log('stop');
                } else {
                    cypherRequest.query += nodeValue+'.'+attributesName+''+operator;
                    if(isNaN(attributesValue)){
                        cypherRequest.query += '"'+attributesValue+'" AND ';
                    } else {
                        cypherRequest.query += attributesValue+' AND ';
                    }
                }
                i++;
            }
            cypherRequest.query += ' RETURN '+nodeValue;
            break;
        case 'SEARCH_BY_NODE_TYPE_AND_NODE_VALUE':
            var mainNode = eval('req.body.mainTypeNode');
            mainNode = mainNode.toLowerCase();
            var attributeName = eval('req.body.attributesName'+i);
            var attributeValue = eval('req.body.attributesValue'+i);
            if(attributeName === ''){
                cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+')-[r'+i+']->('+mainNode+')'};
            } else {
                attributeName = attributeName.split(' ').join('_');
                cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+attributeName+':"'+attributeValue+'"})-[r'+i+']->('+mainNode+')'};
            }
            var nodeArray = [nodeValue,'r'+i];
            
            var otherNodeType = null;
            i=1;
            while(boolean){
                otherNodeType = eval('req.body.typeNode'+i);
                attributeName = eval('req.body.attributesName'+i);
                attributeValue = eval('req.body.attributesValue'+i);
                if(typeof otherNodeType === 'undefined'){
                    boolean = false;
                    console.log('stop');
                }
                else {
                    console.log('here');
                    otherNodeType = otherNodeType.split(' ').join('_');
                    var otherNodeValue = otherNodeType.toLowerCase();
                    otherNodeValue += i.toString();
                    nodeArray.push(otherNodeValue);
                    nodeArray.push('r'+i);
                    if(typeof attributeName === 'undefined'){
                        cypherRequest.query += ',('+otherNodeValue+':'+otherNodeType+')-[r'+i+']->('+mainNode+')';
                    } else {
                        attributeName = attributeName.split(' ').join('_');
                        cypherRequest.query += ',('+otherNodeValue+':'+otherNodeType+' {'+attributeName+':"'+attributeValue+'"})-[r'+i+']->('+mainNode+')';
                    }
                }
                i++;
            }
            nodeArray.push(mainNode);
            cypherRequest.query += ' RETURN ';
            for(var j = 0; j < nodeArray.length;j++){
                cypherRequest.query += nodeArray[j]+',';
                if(j+1 === nodeArray.length){
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                }
            }
            break;
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
                    attributeName = attributeName.split(' ').join('_');
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
            var attributesName0 = req.body.attributesName0.split(' ').join('_');
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
                    attributeName = attributeName.split(' ').join('_');
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
            var attributeAim = req.body.attributeAim.split(' ').join('_');
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+' {'+attributeAim+':"'+req.body.attributeAimValue+'"}) REMOVE '};
            while(boolean){
                var attributeName = eval('req.body.attributesName'+i);
                
                if(typeof attributeName === 'undefined'){
                    boolean = false;
                    //Permet d'enlever la dernière virgule inutile
                    cypherRequest.query = cypherRequest.query.substr(0, (cypherRequest.query.length-1));
                } else {
                    attributeName = attributeName.split(' ').join('_');
                    cypherRequest.query += nodeValue+"."+attributeName+',';
                }
                i++;
            }
            cypherRequest.query += ' RETURN '+nodeValue+';';
            break;
        case 'RELATIONSHIP':
            var attributeAim = req.body.attributeAim.split(' ').join('_');
            var relationshipName = req.body.relationshipName.split(' ').join('_');
            relationshipName = relationshipName.toUpperCase();
            var uniqueConstraint = eval('req.body.uniqueConstraint'+i);
            
            cypherRequest = {query : 'MATCH ('+nodeValue+':'+nodeType+')'};
            if(req.body.otherNodeType !== '' && otherNodeAttributeAim !== '' && req.body.otherNodeAttributeAimValue !== ''){
                var otherNodeType = req.body.otherNodeType.split(' ').join('_');
                var otherNodeAttributeAim = req.body.otherNodeAttributeAim.split(' ').join('_');
                
                cypherRequest.query += ', (r:'+req.body.otherNodeType+')';
                cypherRequest.query += ' WHERE '+nodeValue+'.'+attributeAim+'="'+req.body.attributeAimValue+'"';
                cypherRequest.query += ' AND r.'+otherNodeAttributeAim+'="'+req.body.otherNodeAttributeAimValue+'"';
                if(typeof uniqueConstraint !== 'undefined'){
                    cypherRequest.query += ' CREATE UNIQUE ('+nodeValue+')-[:'+relationshipName+']->(r)';
                } else {
                    cypherRequest.query += ' CREATE ('+nodeValue+')-[:'+relationshipName+']->(r)';
                }
            } else {
                cypherRequest.query += ' WHERE '+nodeValue+'.'+attributeAim+'="'+req.body.attributeAimValue+'"';
                if(typeof uniqueConstraint !== 'undefined'){
                    cypherRequest.query += ' CREATE UNIQUE ('+nodeValue+')-[:'+relationshipName+']->('+nodeValue+')';
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
                
                var otherNodeAttributeAim = req.body.otherNodeAttributeAim.split(' ').join('_');
                var attributeAim = req.body.attributeAim.split(' ').join('_');
                var relationshipName = req.body.relationshipName.split(' ').join('_');
                otherNodeType = req.body.otherNodeType.split(' ').join('_');
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
                var otherNodeAttributeAim = req.body.otherNodeAttributeAim.split(' ').join('_');
                var attributeAim = req.body.attributeAim.split(' ').join('_');
                var relationshipName = req.body.relationshipName.split(' ').join('_');
                var newRelationshipName = req.body.newRelationshipName.split(' ').join('_');
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
        case 'IMPORT_DATABASE':
            var dataContent = req.body.dataContent;
            cypherRequest = {query : dataContent};
            break;
        case 'DELETE_DATABASE':
            cypherRequest = {query : 'MATCH (n) DETACH DELETE n;'};
            break;
        //Default case will return all graph like GET_GRAPH case
        default:
            cypherRequest = {query : 'MATCH (n) OPTIONAL MATCH (n)-[r]->() return n, r;'};
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
