function openDialog(){
    $("#modalCreateNode").modal();
}
var indexRow = 0;
function addAttributes(){
    indexRow++;
    $('#row0').append('<div id="row'+indexRow+'"><div class="col-md-6 champClone"><input class="form-control" type="text" name="nodeName'+indexRow+'" id="nameInput'+indexRow+'" /></div><div class="col-md-6 champClone"><input class="form-control" type="text" name="nodeValue'+indexRow+'" id="valueInput'+indexRow+'"/></div></div>');
}

function submit(){
    console.log('here');
    $('#formCreateNode').submit();
}