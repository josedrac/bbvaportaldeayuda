console.log(7);
var gadgetHelper = null;
var prefs = new _IG_Prefs();
var urlTable = prefs.getString("_table_query_url");
var subseccion = prefs.getString("subseccion"); 
_IG_RegisterOnloadHandler(loadVisualizationAPI);

function loadVisualizationAPI() {
  google.load("visualization", "1", {"packages": ["table"]});
}
  
function devicesCountry(pais){
  var gadgetHelper = new google.visualization.GadgetHelper();
  var opts = {dataType:'jsonp'};
  var queryDC = new google.visualization.Query(urlTable, opts);
   
  var queryDCtosend = "select *";

  queryDC.setQuery(queryDCtosend);			  
  queryDC.send(handleQueryResponseDC);

}

var DataTable= function(data){
  var HEADER_ROW = 0;
  var FIELDS = {
     id : 0,
     name: 1,
     image: 3
  };

  var dataDC = data;
  this.getId = function(row){
     return dataDC.getValue(row, FIELDS.id);
  }
  this.getHref = function(row){
     return 'https://sites.google.com/a/bbva.com/portaldeayuda/movilidad/detalle_app?app_id='+this.getId(row);
  }
  this.getNumberOfRows = function(){
     return dataDC.getNumberOfRows();
  }
  this.getName = function(row){
     return dataDC.getValue(row, FIELDS.name);
  }		
  this.getImage = function(row){
     return dataDC.getValue(row, FIELDS.image);
  }

  this.validateRow = function(row){
     return true;
  }

}

function handleQueryResponseDC(response){
   var dataDC = new DataTable(response.getDataTable());
  var filas = dataDC.getNumberOfRows();

     var html= "";
   html +='<div class=\"titulo\">' + subseccion + '</div>';
     html +='<ul id=\"botonera\">'; 
     for(var row=0;row<filas;row++){
       if( dataDC.validateRow(row)){
          html +="<li><a  href='"+dataDC.getHref(row)+"' target='_parent'>"+
          dataDC.getName(row)+"</a></li>";
       }
    }

  html +='</ul>';
  document.getElementById('content_div').innerHTML = html;

}

function cargaCompleta(){
  devicesCountry('EspaÃ±a');
}