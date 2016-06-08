//Fonction permettant de récupérer les IDs des noeuds associés à un lien
function idIndex(a,id) {
    for (var i=0;i<a.length;i++) {
        if (a[i].id == id) return i;}
    return null;
}

//Fonction permettant de stocker les données JSON récupérées de Neo4j dans des arrays de liens et de noeuds
function initializeData(graph){
    graph.results[0].data.forEach(function (row) {
        row.graph.nodes.forEach(function (n) {
            if (idIndex(nodes, n.id) == null) {
                nodes.push({id: n.id, type: n.labels[0], properties: n.properties});
            }
        });
        links = links.concat(row.graph.relationships.map(function (r) {
            return {id: r.id, source: idIndex(nodes, r.startNode), target: idIndex(nodes, r.endNode), type: r.type};
        }));
    });
}

//Fonction permettant d'initialiser la zone dédiée à l'affichage du graph
function initializeSVG(){
    var width = 600;
    var height = 400;

    force = d3.layout.force().charge(-400).linkDistance(150).size([width, height]);

    svg = d3.select("#graph").append("svg")
        .attr("width", "100%").attr("height",  "100%")
        .attr("pointer-events", "all");
}
//Fonction permettant de créer et d'afficher les différents éléments (liens, noeuds) de la base sur le graph
function drawSVG(){
    //Création d'un svg:marker servant de flèche en bout de lien entre 2 noeuds
    var defs = svg.append('svg:defs');
    var marker = defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox","0 0 10 10")
        .attr("refX","10.5")
        .attr("refY","2")
        .attr("markerUnits","strokeWidth")
        .attr("markerWidth","30")
        .attr("markerHeight","30")
        .attr("orient","auto").append("svg:path")
        .attr("d", "M 0 0 L 4 2 L 0 4 z")
        .attr("fill", "#000");;

    //Création des liens sous forme de svg:path
    link = svg.selectAll(".link")
        .data(links).enter()
        .append("path").attr("class", "link")
        .attr("id", function (d){ return "link"+d.id; })
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("data-content", function (d) {
            return d.source.id + " " + d.target.id;
        })
        .attr("marker-end", "url(#arrow)");

    //Ajout des noms associés au différents liens du graph
    var linkText = svg.selectAll(".linkText")
        .data(links).enter()
        .append("text")
        .append("textPath").attr("class", "linkText")
        .attr("xlink:href", function (d){ return "#link"+d.id; })
        .attr("startOffset", "35%")
        .text( function (d) { return d.type;})
        .attr("font-family", "sans-serif")
        .attr("font-size", "7px")
        .attr("fill", "darkblue");

    //Création d'un conteneur permettant de stocker les noeuds et leurs textes associés
    node = svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .call(force.drag);

    //Création des noeuds sous forme de svg:circle
    var nodeCircle = node.append("circle")
        .attr("class", function (d) {
            return "node " + d.type
        })
        .attr("r", 20)
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "right")
        .attr("data-original-title", function (d) {
            return "Type : " + d.type + "\n" + "Id : " + d.id + "\n";
        })
        .attr("data-content", function (d) {
            var result = "";
            for (prop in d.properties) {
                result += prop + " : " + d.properties[prop] + "\n";
            }
            return result;
        });

    //Ajout des noms/id associés au différents noeuds du graph
    var text = node.append("text")
        .attr("text-anchor", "middle")
        .text( function (d) {
            var result = d.id;
            for (prop in d.properties) {
                if(prop === "name" || prop==="title"){
                    result="";
                    var res = d.properties[prop];
                    if(res.length < 10){
                        result +=res ;
                    }
                    else{
                        result = res.substring(0, 8) +"...";
                    }
                }
            }
            return result;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "7px")
        .attr("fill", "white");
}

//Fonction gérant les différents évènements de la zone de graph (scroll souris pour zoom, recalcul des coordonnées en cas de déplacement d'un noeud, etc.)
function manageEvents() {
//Calcul des coordonnées des différents éléments suivant qu'on les déplace dans le conteneur svg
    force.on("tick", function () {
        link.attr("d", function (d) {
            var result = "M "+ d.source.x + " " + d.source.y +" L "+d.target.x + " " + d.target.y;
            var existsNode = $("[data-content='" + $(this).attr("data-content") + "']");
            //Si on a plusieurs liens sur les mêmes noeuds
            if(existsNode.length > 1){
                var i = existsNode.index(this)+1;
                var dx = d.target.x - d.source.x;
                var dy = d.target.y - d.source.y;
                if(!i%2){
                    var dr = Math.sqrt(dx * dx + dy * dy)*i*2;
                    result =  "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                }else{
                    var dr = Math.sqrt(dx * dx + dy * dy)*(i-1);
                    result = "M" + d.source.x + "," + d.source.y + "A" + -1*dr + "," + -1*dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                }
            }
            return result;
        })

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
    });

    //Code permettant de rendre la zone svg zoomable et de la déplacer dans les 4 directions (haut, bas, gauche, droite)
    var graphPanZoom = svgPanZoom("#graph svg", {
        panEnabled: true
        , controlIconsEnabled: false
        , zoomEnabled: true
        , mouseWheelZoomEnabled: true
        , preventMouseEventsDefault: true
        , zoomScaleSensitivity: 0.5
        , minZoom: 0.001
        , maxZoom:10
        , fit: false
        , contain: true
        , center: true
        , refreshRate: 'auto'
    });

    graphPanZoom.zoom(0.01);
}

//Fonction générant le graph en svg dans la zone prévue à cet effet
function genererGraph(requete) {

    nodes = [], links = [];

    force= null, svg = null;

    link = null, node = null;

    //Assignation à la variable graph des données JSON récupérées du serveur
    var graph = requete;

    initializeData(graph, nodes, links);

    initializeSVG();

    force.nodes(nodes).links(links).start();

    drawSVG();

    manageEvents();
}