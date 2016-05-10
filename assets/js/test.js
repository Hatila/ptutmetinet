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
            if (idIndex(nodes,n.id) == null){
                nodes.push({id:n.id,type:n.labels[0],properties:n.properties});
            }
        });
        links = links.concat( row.graph.relationships.map(function(r) {
            return {source:idIndex(nodes,r.startNode),target:idIndex(nodes,r.endNode),type:r.type};
        }));
    });
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
              .attr("class", function (d) { return "node "+d.type })
              .attr("r", 10)
              .call(force.drag)
          .attr("data-toggle","tooltip")
          .attr("data-placement","right")
          .attr("data-original-title",function(d){
              return "Type : "+d.type+"\n"+"Id : "+d.id+"\n";
          })
          .attr("data-content",function (d) {
              var result = "";
              for(prop in d.properties){
                  result+=prop+" : "+d.properties[prop]+"\n";
              }
              return result;
          })
          .on("mouseover",function(d){
              var result = "";
              for(prop in d.properties){
                  result+=prop+" : "+d.properties[prop]+"\n";
              }
              $("#detailedInfos").innerHTML = "<p>"+result+"</p>";
          })

      // force feed algo ticks for coordinate computation
      force.on("tick", function() {
          link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
                  .attr("cy", function(d) { return d.y; });
      });





}