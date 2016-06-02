function createNodeDialog(){
    $("#modalCreateNode").modal();
}

function updateNodeDialog(){
    $("#modalUpdateNode").modal();
    setTimeout(function(){
        addAttributes("rowUpdate");
    },0);
}

function deleteNodeDialog(){
    $("#modalDeleteNode").modal();
}

function deleteAttributeDialog(){
    $("#modalDeleteNodeProperty").modal();
}

function createNodeRelationshipDialog(){
    $("#modalCreateNodeRelationship").modal();
}

var indexAttributes = 0;
function addAttributes(id){
    indexAttributes++;
    if(id === 'rowPropertiesToDelete'){
        $('#'+id+"0").append('<div id="'+id+''+indexAttributes+'"><div class="col-md-6 champClone"><input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" /></div></div>');
    } else {
        $('#'+id+"0").append('<div id="'+id+''+indexAttributes+'"><div class="col-md-6 champClone"><input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" /></div><div class="col-md-6 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'"/></div></div>');
    }
}


var indexNodes = 0;
function addNodes(){
    indexNodes++;
    $('#rowNode0').append('<div id="rowNode'+indexNodes+'"><div class="col-md-6 champClone"><input class="form-control" type="text" id="nodeType'+indexNodes+'" /></div><div class="col-md-6 champClone"><input class="form-control" type="text" name="nodeValue'+indexNodes+'" id="valueNode'+indexNodes+'"/></div></div>');
}

function submit(id){
    $('#'+id).submit();
}