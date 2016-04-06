function idIndex(a,id) {
    for (var i=0;i<a.length;i++) {
        if (a[i].id == id) return i;}
    return null;
}

function genererGraph(requete) {
	var width = 800, height = 800;
  // force layout setup
  var force = d3.layout.force()
          .charge(-200).linkDistance(30).size([width, height]);

  // setup svg div
  var svg = d3.select("#graph").append("svg")
          .attr("width", "100%").attr("height", "100%")
          .attr("pointer-events", "all");

  // load graph (nodes,links) json from /graph endpoint
    var nodes=[], links=[];

    var graph = requete;

    graph.results[0].data.forEach(function (row) {
        row.graph.nodes.forEach(function (n) {
            if (idIndex(nodes,n.id) == null)
                nodes.push({id:n.id,label:n.labels[0],title:n.properties.name});
        });
        links = links.concat( row.graph.relationships.map(function(r) {
            return {start:idIndex(nodes,r.startNode),end:idIndex(nodes,r.endNode),type:r.type};
        }));
    });
    //viz = {nodes:nodes, links:links};

      force.nodes(nodes).links(links).start();

      // render relationships as lines
      var link = svg.selectAll(".link")
              .data(links).enter()
              .append("line").attr("class", "link")
			  .attr("fill", "none")
			  .attr("stroke", "black");

      // render nodes as circles, css-class from label
      var node = svg.selectAll(".node")
              .data(nodes).enter()
              .append("circle")
              .attr("class", function (d) { return "node "+d.label })
              .attr("r", 10)
              .call(force.drag);
			  
			  /*Code pour affichage infos noeud survol
	  nodeEnter = node.enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) { 
      return "translate(" + source.y0 + "," + source.x0 + ")"; 
  })
  .on("click", click)
  .on("mouseover", function(d) {
      var g = d3.select(this); // The node
      // The class is used to remove the additional text later
      var info = g.append('text')
         .classed('info', true)
         .attr('x', 20)
         .attr('y', 10)
         .text('More info');
  })
  .on("mouseout", function() {
      // Remove the info text on mouse out.
      d3.select(this).select('text.info').remove();
  });

      // html title attribute for title node-attribute
      node.append("title")
              .text(function (d) { return d.title; })

      // force feed algo ticks for coordinate computation
      force.on("tick", function() {
          link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
                  .attr("cy", function(d) { return d.y; });
      });
 /*
  var res  =
{ "results": [
    {
      "columns": ["path"],
      "data"   : [{
          "graph": {
            "nodes": [
              {"id": "1", "labels": ["Person"], "properties": {"name": "Peter"}},
              {"id": "2", "labels": ["Person"], "properties": {"name": "Michael"}}
             ],
            "relationships": [
              {"id": "0", "type": "KNOWS", "startNode": "1", "endNode": "2", "properties": {}}
             ]
          } // , {"graph": ...}, ...
      }]}
  ], "errors": []
}
  
  function idIndex(a,id) {
  for (var i=0;i<a.length;i++) {
    if (a[i].id == id) return i;}
  return null;
}
var nodes=[], links=[];
res.results[0].data.forEach(function (row) {
   row.graph.nodes.forEach(function (n) {
     if (idIndex(nodes,n.id) == null)
       nodes.push({id:n.id,label:n.labels[0],title:n.properties.name});
   });
   links = links.concat( row.graph.relationships.map(function(r) {
     return {start:idIndex(nodes,r.startNode),end:idIndex(nodes,r.endNode),type:r.type};
   }));
});
viz = {nodes:nodes, links:links};*/
}