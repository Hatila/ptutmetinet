//Ouverture d'une modal
function searchByNodeTypeAndValueDialog(){
    $('#modalSearchByNodeTypeAndNodeValue').modal();
}

function searchByNodeTypeDialog(){
    $("#modalSearchByNodeType").modal();
}

function createNodeDialog(){
    $("#modalCreateNode").modal();        
}

function updateNodeDialog(){
    $("#modalUpdateNode").modal();
    /**
     * Cas particulier : Ajoute un champs dès l'ouverture de la modal pour réaliser correctement l'update
     */ 
    setTimeout(function(){
        indexAttributes++;
        $('#rowUpdate').append('<div id="rowUpdate'+indexAttributes+'" class="row"><div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div><div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div><div class="col-md-2"><input type="checkbox" name="uniqueConstraint'+indexAttributes+'" id="uniqueInput'+indexAttributes+'" class="checkbox mt-10"/></div></div>');
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

function updateNodeRelationshipDialog(){
    $('#modalUpdateNodeRelationship').modal();
}

function deleteRelationshipDialog(){
    $('#modalDeleteNodeRelationship').modal();
}

function deleteDatabase(){
    $("#modalDeleteDatabase").modal();
}

/**
 * Supprime la dernière ligne pour les attributs
 * @param {HTMLElement} domElement
 */
function trashLastRow(domElement){
    //get div row id to delete
    var subId = domElement.id;
    //get main id
    var id = subId.replace(indexAttributes,'');
    indexAttributes--;
    domElement.remove();
    console.log(subId);
    //S'il y a plus d'une ligne ET s'il ne s'agit pas de la ligne rowUpdate2 qui est un cas particulier (2 lignes minimum pour cette action)
    if(indexAttributes > 0 && subId !== 'rowUpdate2'){
        $('#'+id+' #'+id+''+indexAttributes).append('<div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div>');
    }
}

/**
 * Supprime la dernière ligne pour les noeuds
 * @param {HTMLElement} domElement
 */
function trashLastRowNode(domElement){
    console.log(domElement);
    //get div row id to delete
    var subId = domElement.id;
    //get main id
    var id = subId.replace(indexNodes,'');
    indexNodes--;
    domElement.remove();
    //S'il y a plus d'une ligne
    if(indexNodes > 0){
        console.log('here');
        console.log(id);
        console.log(indexNodes);
        $('#'+id+' #'+id+''+indexNodes).append('<div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRowNode('+id+indexNodes+')"></span></div>');
    }
}

var indexAttributes = 0;
/**
 * Fonction permettant d'ajouter des input aux modal
 * @param {string} id
 */
function addAttributes(id){
    /**
     * Récupère la valeur des derniers inputs (peut être les 1er si aucun n'a été ajouté)
     */
    var inputNameField = $('#'+id+' [name=attributesName'+indexAttributes+']');
    var inputValueField = $('#'+id+' [name=attributesValue'+indexAttributes+']');
    //Si au moins un input de la ligne en cours est vide, on ajoute pas de nouvelles lignes
    if(inputNameField.val() !== '' && inputValueField.val() !== ''){
        indexAttributes++;
        if(id === 'rowPropertiesToDelete'){
            $('#'+id).append('<div id="'+id+''+indexAttributes+'"><div class="col-md-6 champClone"><input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div></div>');
        } else {
            //Si le button de suppression existe, on supprime celui de la ligne précédente afin de mettre le boutton sur la ligne suivante
            if($('#'+id+' #'+id+''+(indexAttributes-1)+' #trashButton').length !== 0){
                $('#'+id+' #'+id+''+(indexAttributes-1)+' #trashButton').remove();
            }
            if(id === 'rowSearchByNodeValueInput'){
                //Ajoute les inputs, le checkbox pour attribut unique et le bouton de suppression de ligne
            $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div><div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div><div class="col-md-3"><div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div></div>');
            } else {
                //Ajoute les inputs, le checkbox pour attribut unique et le bouton de suppression de ligne
                $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div><div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div><div class="col-md-3"><input type="checkbox" name="uniqueConstraint'+indexAttributes+'" id="uniqueInput'+indexAttributes+'" class="checkbox mt-10" /></div><div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div></div>');
            }
        }
    } else {
        //Vérifie s'il existe déjà un id "warningInfo" dans la modal visé
        if($('#'+id).parent().siblings('div.modal-footer').find('#warningInfo').length === 0){
            $('#'+id).parent().siblings('div.modal-footer').append('<p id="warningInfo" class="alert alert-warning center">Veuillez renseigner le nom et la valeur de l\'attribut avant d\'ajouter une nouvelle ligne.</p>');
            
            //Supprime le message d'aide après 3 secondes
            setTimeout(function(){
               $('#'+id).parent().siblings('div.modal-footer').find('#warningInfo').remove(); 
            },3000);
        }
    }
}

var indexNodes = 0;
/**
 * Fonction permetttant d'ajouter des noeuds à une modal
 * @param {string} id
 */
function addNodes(id){    
    /**
     * Récupère la valeur des derniers inputs (peut être les 1er si aucun n'a été ajouté)
     */
    var inputNameField = $('#'+id+' [name=typeNode'+indexNodes+']');
    console.log(inputNameField);
    //Si au moins un input de la ligne en cours est vide, on ajoute pas de nouvelles lignes
    if(inputNameField.val() !== ''){
        indexNodes++;
        //Si le button de suppression existe, on supprime celui de la ligne précédente afin de mettre le boutton sur la ligne suivante
        if($('#'+id+' #'+id+''+(indexNodes-1)+' #trashButton').length !== 0){
            $('#'+id+' #'+id+''+(indexNodes-1)+' #trashButton').remove();
        }
        //Ajoute les inputs, le checkbox pour attribut unique et le bouton de suppression de ligne
        $('#'+id).append('<div id="'+id+''+indexNodes+'" class="row"><div class="col-md-5 champClone"><input class="form-control" type="text" id="nodeType'+indexNodes+'" name="typeNode'+indexNodes+'" required /></div><div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRowNode('+id+indexNodes+')"></span></div></div>');
    } else {
        //Vérifie s'il existe déjà un id "warningInfo" dans la modal visé
        if($('#'+id).parent().siblings('div.modal-footer').find('#warningInfo').length === 0){
            $('#'+id).parent().siblings('div.modal-footer').append('<p id="warningInfo" class="alert alert-warning center">Veuillez renseigner le type de noeud avant d\'ajouter une nouvelle ligne.</p>');
            
            //Supprime le message d'aide après 3 secondes
            setTimeout(function(){
               $('#'+id).parent().siblings('div.modal-footer').find('#warningInfo').remove(); 
            },3000);
        }
    }
}

function cancel(id){
    $('#'+id).modal('hide');
}

function deleteRowAttributes(){
    console.log('indexNodes');
    console.log(indexNodes);
    console.log('indexAttributes');
    console.log(indexAttributes);
}
 
 /*
  * Lors de la fermeture de la modal que ce soit lors d'une validation ou une fermeture prématurée, 
  * on vide tous les champs, remet la modal dans son état inital et réinitialise les variables globals indexNodes et indexAttributes
  */
$("#modalCreateNode").on("hidden.bs.modal", function () {
    if(indexAttributes > 0){
        for(var i = 1; i <= indexAttributes; i++){
            $("#rowCreate"+i).remove();
        }
        indexAttributes = 0;
    }
    $("#modalCreateNode #nameInput0").val('');
    $("#modalCreateNode #valueInput0").val('');
});

 $("#modalUpdateNode").on("hidden.bs.modal", function () {
    if(indexAttributes > 0){
        for(var i = 1; i <= indexAttributes; i++){
            $("#rowUpdate"+i).remove();
        }
        indexAttributes = 0;
    }
    $("#modalUpdateNode #nameInput0").val('');
    $("#modalUpdateNode #valueInput0").val('');
});

 $("#modalDeleteNodeProperty").on("hidden.bs.modal", function () {
    if(indexAttributes > 0){
        for(var i = 1; i <= indexAttributes; i++){
            $("#rowPropertiesToDelete"+i).remove();
        }
        indexAttributes = 0;
    }
    indexNodes = 0;
    indexAttributes = 0;
});

 $("#modalSearchByNodeType").on("hidden.bs.modal", function () {
    if(indexNodes > 0){
        for(var i = 1; i <= indexNodes; i++){
            $("#rowSearchByNodeType"+i).remove();
        }
        indexNodes = 0;
    }
    indexNodes = 0;
});

$('#modalSearchByNodeTypeAndNodeValue').on("hidden.bs.modal", function(){
    if(indexNodes > 0){
        for(var i = 1; i <= indexNodes; i++){
            $("#rowSearchByNodeTypeInput"+i).remove();
        }
        indexNodes = 0;
    }
    indexNodes = 0;
    
    
    if(indexAttributes > 0){
        for(var i = 1; i <= indexAttributes; i++){
            $("#rowSearchByNodeValueInput"+i).remove();
        }
        indexAttributes = 0;
    }
    indexAttributes = 0;
    
    
    $("#modalSearchByNodeTypeAndNodeValue #typeNode0").val('');
    $("#modalSearchByNodeTypeAndNodeValue #nameInput0").val('');
    $("#modalSearchByNodeTypeAndNodeValue #valueInput0").val('');
})