//Ouverture d'une modal
function searchByNodeTypeAndValueDialog(){
    $('#modalSearchByNodeTypeAndNodeValue').modal();
}

function searchByNodeTypeDialog(){
    $("#modalSearchByNodeType").modal();
}

function searchByNodeAndAttributes(){
    $("#modalSearchByNodeWithAttributes").modal();
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
        $('#rowUpdate').append('<div id="rowUpdate'+indexAttributes+'" class="row">\n\
            <div class="col-md-4 champClone"><label for="attributesName'+indexAttributes+'">Nom</label>\n\
                <span class="glyphicon glyphicon-info-sign info-bulle" data-toggle="tooltip" data-placement="top" title="Nom de l\'attribut à modifier ou à ajouter s\'il n\'existe pas."></span>\n\
                <input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div>\n\
            <div class="col-md-4 champClone"><label for="attributesValue'+indexAttributes+'">Valeur</label>\n\
                <span class="glyphicon glyphicon-info-sign info-bulle" data-toggle="tooltip" data-placement="top" title="Valeur de l\'attribut à modifier ou à ajouter s\'il n\'existe pas."></span>\n\
                <input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div>\n\
            <div class="col-md-4 champClone"><label for="uniqueInput'+indexAttributes+'">Attribut unique</label>\n\
                <span class="glyphicon glyphicon-info-sign info-bulle" data-toggle="tooltip" data-placement="top" title="Permet de rendre unique la propriété existante ou ajouté."></span>\n\
                <input id="uniqueInput'+indexAttributes+'" name="uniqueConstraint'+indexAttributes+'" type="checkbox" /><label for="uniqueInput'+indexAttributes+'">\n\
                <span></span><ins><i>Unique</i></ins></label></div>\n\
            </div>');
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

function importDatabase(){
    $('#modalImportDatabase').modal();
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
    //S'il y a plus d'une ligne ET s'il ne s'agit pas de la ligne rowUpdate2 qui est un cas particulier (2 lignes minimum pour cette action)
    if(indexAttributes > 0 && subId !== 'rowUpdate2'){
        $('#'+id+' #'+id+''+indexAttributes).append('<div class="col-md-1" id="trashButton">\n\
            <span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span>\n\
        </div>');
    }
}

/**
 * Supprime la dernière ligne pour les noeuds
 * @param {HTMLElement} domElement
 */
function trashLastRowNode(domElement){
    //get div row id to delete
    var subId = domElement.id;
    //get main id
    var id = subId.replace(indexNodes,'');
    indexNodes--;
    domElement.remove();
    //S'il y a plus d'une ligne
    if(indexNodes > 0){
        $('#'+id+' #'+id+''+indexNodes).append('<div class="col-md-1" id="trashButton">\n\
            <span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRowNode('+id+indexNodes+')"></span>\n\
        </div>');
    }
}

//Variable permettant de rendre unique chaque input pour les attributs
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
            $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-6 champClone">\n\
                <input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div>\n\
            </div>');
        } else {
            //Si le button de suppression existe, on supprime celui de la ligne précédente afin de mettre le boutton sur la ligne suivante
            if($('#'+id+' #'+id+''+(indexAttributes-1)+' #trashButton').length !== 0){
                $('#'+id+' #'+id+''+(indexAttributes-1)+' #trashButton').remove();
            }
            if(id === 'rowSearchByNodeValueInput'){
                //Ajoute les inputs et le bouton de suppression de ligne
                $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-4 champClone">\n\
                    <input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" /></div>\n\
                    <div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" /></div>\n\
                    <div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div>\n\
                </div>');
            } else {
                //Ajoute les inputs, la selectbox et le bouton de suppression de ligne
                if(id === 'rowSearchWithAttributes'){
                    $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-3 champClone">\n\
                        <input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div>\n\
                        <div class="col-md-4 champClone"><select name="operator'+indexAttributes+'" id="selectOperator'+indexAttributes+'" class="form-control">\n\
                        <option value="<">Inférieur à</option><option value="<=">Inférieur ou égale à</option><option value=">">Supérieur à</option>\n\
                        <option value=">=">Supérieur ou égale à</option><option value="=">Égale à</option><option value="<>">Différent de</option></select></div>\n\
                        <div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div>\n\
                        <div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div>\n\
                    </div>');
                } else{
                    if(id === 'rowCreate'){
                        //Ajoute les inputs, le checkbox pour attribut unique et le bouton de suppression de ligne
                        $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-4 champClone">\n\
                            <input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div>\n\
                            <div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div>\n\
                            <div class="col-md-3"><input id="uniqueInput'+indexAttributes+'" name="uniqueConstraint'+indexAttributes+'" type="checkbox" />\n\
                            <label for="uniqueInput'+indexAttributes+'"><span></span><ins><i>Unique</i></ins></label></div><div class="col-md-1" id="trashButton">\n\
                            <span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div>\n\
                        </div>');
                    }
                    else {
                        //Ajoute les inputs, le checkbox pour attribut unique et le bouton de suppression de ligne
                        $('#'+id).append('<div id="'+id+''+indexAttributes+'" class="row"><div class="col-md-4 champClone">\n\
                            <input class="form-control" type="text" name="attributesName'+indexAttributes+'" id="nameInput'+indexAttributes+'" required /></div>\n\
                            <div class="col-md-4 champClone"><input class="form-control" type="text" name="attributesValue'+indexAttributes+'" id="valueInput'+indexAttributes+'" required/></div>\n\
                            <div class="col-md-3"><input id="uniqueInput'+indexAttributes+'" name="uniqueConstraint'+indexAttributes+'" type="checkbox" /><label for="uniqueInput'+indexAttributes+'">\n\
                            <span></span><ins><i>Unique</i></ins></label></div><div class="col-md-1" id="trashButton">\n\
                            <span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRow('+id+indexAttributes+')"></span></div>\n\
                        </div>');
                    }
                }
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

//Variable permettant de rendre unique chaque input pour les noeuds
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
        $('#'+id).append('<div id="'+id+''+indexNodes+'" class="row"><div class="col-md-6 champClone">\n\
            <input class="form-control" type="text" id="nodeType'+indexNodes+'" name="typeNode'+indexNodes+'" required /></div>\n\
            <div class="col-md-1" id="trashButton"><span class="glyphicon glyphicon-trash mt-20" aria-hidden="true" onclick="trashLastRowNode('+id+indexNodes+')"></span></div>\n\
        </div>');
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
    
    $("#modalCreateNode #uniqueInput0").attr('checked',false);
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

$('#modalDeleteNode').on("hidden.bs.modal", function(){
    $("#modalDeleteNode #typeNode0").val('');
    $("#modalDeleteNode #nameInput0").val('');
    $("#modalDeleteNode #valueInput0").val('');
})

 $("#modalDeleteNodeProperty").on("hidden.bs.modal", function () {
    if(indexAttributes > 0){
        for(var i = 1; i <= indexAttributes; i++){
            $("#rowPropertiesToDelete"+i).remove();
        }
        indexAttributes = 0;
    }
    indexNodes = 0;
    indexAttributes = 0;
    
    $('#modalDeleteNodeProperty #typeNode0').val('');
    $('#modalDeleteNodeProperty #attributeAim0').val('');
    $('#modalDeleteNodeProperty #attributeAimValue0').val('');
    $('#modalDeleteNodeProperty #nameInput0').val('');
});

 $("#modalSearchByNodeType").on("hidden.bs.modal", function () {
    if(indexNodes > 0){
        for(var i = 1; i <= indexNodes; i++){
            $("#rowSearchByNodeType"+i).remove();
        }
        indexNodes = 0;
    }
    indexNodes = 0;
    
    $('#modalSearchByNodeType #typeNode0').val('');
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
    
    
    $("#modalSearchByNodeTypeAndNodeValue #mainNode").val('');
    $("#modalSearchByNodeTypeAndNodeValue #typeNode0").val('');
    $("#modalSearchByNodeTypeAndNodeValue #nameInput0").val('');
    $("#modalSearchByNodeTypeAndNodeValue #valueInput0").val('');
})

$('#modalImportDatabase').on("hidden.bs.modal", function(){
    $('#modalImportDatabase #textareaDataContent').val('');
})

$('#modalSearchByNodeWithAttributes').on("hidden.bs.modal", function(){
    if(indexAttributes > 0){
        for(var i = 1; i <= indexAttributes; i++){
            $("#rowSearchWithAttributes"+i).remove();
        }
        indexAttributes = 0;
    }
    indexAttributes = 0;
    
    $('#modalSearchByNodeWithAttributes #typeNode0').val('');
    $('#modalSearchByNodeWithAttributes #nameInput0').val('');
    $('#modalSearchByNodeWithAttributes #selectOperator0 option[value="<"]').attr('selected','selected');
    $('#modalSearchByNodeWithAttributes #valueInput0').val('');
})

$('#modalDeleteNodeRelationship').on("hidden.bs.modal", function(){
    $('#modalDeleteNodeRelationship #relationshipName').val('');
    $('#modalDeleteNodeRelationship #typeNode0').val('');
    $('#modalDeleteNodeRelationship #attributeAim0').val('');
    $('#modalDeleteNodeRelationship #attributeAimValue0').val('');
    $('#modalDeleteNodeRelationship #otherNodeType').val('');
    $('#modalDeleteNodeRelationship #otherNodeAttributeAim0').val('');
    $('#modalDeleteNodeRelationship #otherNodeAttributeAimValue0').val('');
})

$('#modalUpdateNodeRelationship').on("hidden.bs.modal", function(){
    $('#modalUpdateNodeRelationship #typeNode0').val('');
    $('#modalUpdateNodeRelationship #attributeAim0').val('');
    $('#modalUpdateNodeRelationship #attributeAimValue0').val('');
    $('#modalUpdateNodeRelationship #originalRelationship').val('');
    $('#modalUpdateNodeRelationship #newRelationship').val('');
    $('#modalUpdateNodeRelationship #otherNodeType').val('');
    $('#modalUpdateNodeRelationship #otherNodeAttributeAim0').val('');
    $('#modalUpdateNodeRelationship #otherNodeAttributeAimValue0').val('');
})

//Fournis un exemple d'improt de base de données
function importExample(){
    $('#modalImportDatabase #textareaDataContent').val('LOAD CSV WITH HEADERS FROM "https://dl.dropboxusercontent.com/u/14493611/movies_setup.csv" AS row MERGE (m:Movie {title:row.title}) ON CREATE SET m.released = toInt(row.released), m.tagline = row.tagline MERGE (p:Person  {name:row.name}) ON CREATE SET p.born = toInt(row.born) WITH m,p,row WHERE row.type = "ACTED_IN" MERGE (p)-[r:ACTED_IN]->(m) ON CREATE SET r.roles = split(row.roles,";")[0..-1] RETURN p,m,r;');
}


