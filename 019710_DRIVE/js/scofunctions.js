/*
SCOFunction BAYER

Caracter&iacute;sticas y l&iacute;nea para ActionScript:
-----------------------------------------------
1) Session_time: Tiempo de permanencia del &uacute;ltimo acceso.
Autom&aacute;tico

2) Lesson_location: &uacute;ltima p&aacute;gina visitada.
_root.getURL("javascript:getLocation('modulo3')"); //Obtiene la &uacute;ltima p&aacute;gina visitada para el ID modulo3
_root.getURL("javascript:setLocation('10')"); // Fija la p&aacute;gina 10 como visitada

3) lesson_status: Estado del SCO (incompleted, passed y failed)
a) Cambia el modulo a completo
_root.getURL("javascript:setCompleted()"); 

b) Agrega el puntaje y eval&uacute;a si en el promedio total de los ejericios es mayor al 74%
cod_ejercicio = "3";
ultimo="1";
_root.getURL("javascript:setObScore(\'"+cod_ejercicio+"\',\'"+Porcentaje+"\',\'"+ultimo+"\')");

4) cmi.objectives.'+nro_objetivo+'.score.raw: Puntaje del ejercicio n&uacute;mero "nro_objetivo".
a) Agrega el puntaje (Porcentaje) del ejercicio (cod_ejercicio)
cod_ejercicio = "3";
_root.getURL("javascript:setObScore(\'"+cod_ejercicio+"\',\'"+Porcentaje+"\')"); 

5)  setComment(comentario) para agregar notas desde la aplicaci&oacute;n en flash.
Se agrega la siguiente l&iacute;nea en AS
_root.getURL("javascript:setComment(\'"+txt+"\')");

Caracter&iacute;stica Particular
----------------------------

Eval&uacute;a si es correcto o incorrecto (passed o failed) si el promedio de todos los ejercicios es  mayor o igual a un 75% del total, por
lo que usa la variable 'ultimo' en la p&aacute;gina que se decida dar por finalizado el modulo.

*/

var ocurre_error = "nada";
var api = null;
var startDate;
var lesson_location_global;
var Q_contador = 0;
// set this to false to turn debugging off and get rid of those annoying alert boxes.
var _Debug = false;

//var lesson_location_global = 1;

/*******************************************************************************
 **  Comprobamos que el LMS est&eacute; inicializado.
 **  Si no, lo inicializamos
 **  nro_objetivo  cantidad de ejercicios
 *******************************************************************************/
//function loadPage(id_flash, nro_objetivo) {
function inicializa() {
    api = getAPIHandle();
	doInitialize(); //AJG 15-12-09: añadido para que el test de ADL no arroje error. La comprobaci&oacute;n posterior LMSIsInitialized se mantiene por si acaso.
	msg = 'No se pudo conectar con el LMS, cierre esta ventana y vuelva a intentarlo.\n\nSi el problema persiste, pongase en contacto con el administrador del curso.';
    if (api == null) {
        window.status = msg;
		//mensaje_alerta("index",msg);
        return 'false';
    }
    else	{
        var result = 'false';
        var init = LMSIsInitialized();
        if (init == false) {
            if (_Debug == true) {
				window.status = msg;
				//mensaje_alerta("index",msg);
            }
            result = doInitialize();
        }
        else 	{
            if (_Debug == true) {
                alert('inicializa(): LMS ya inicializado.');
            }
            result = 'true';
        }
    }
	
	
	
    return result;
}

var datos_pagina = new Array();
var paginas_vistas;

function loadPage() {
		
	if(curso_scorm == true){
		var result = inicializa();//doLMSInitialize();
		
		if (result == "true") {
			startTimer();
			
			
		   // lesson_location_global = lesson_location_global*1;
	
		   //* if (lesson_location_global < 1) {
		   //     lesson_location_global = 1;
			//}  
			var lesson_status = doGetValue("cmi.core.lesson_status");
			if (lesson_status != "completed") {
				if(lesson_status != "passed"){
					param = "incomplete"
					doSetValue("cmi.core.lesson_status", param);
				}
			}
			//setEjercicios(1);
			//setEvalCompleted();
			//getObScore(nro_objetivo, id_flash);
		}
	}
	
	contador = doGetValue("cmi.core.lesson_location");
	datos_guardados = doGetValue('cmi.suspend_data');



	
	if(contador == undefined || contador == ""){
	
		contador = 1;
	}
	
	
	if(datos_guardados != undefined){
		spliteo_dg = datos_guardados.split(",");
	}
		
	paginas_vistas = 0;
		
	for(i=0; i<= total; i++){
		
		if(spliteo_dg[0] == undefined || spliteo_dg[0] == ""){
			datos_pagina[i]	= "0|0";
			//alert("datos_pagina["+i+"] "+ datos_pagina[i]);
		}else{
			if(spliteo_dg[i] != undefined || spliteo_dg[i] != ""){
				datos_pagina[i]	= spliteo_dg[i];
			}
		}
				
		if(datos_pagina[i].charAt(0) == 3){
			paginas_vistas++;
		}

	}


		
	return
}

curso_completo = false;

function setLocation(pagina,suspended_data) {
	//datos_pagina= "3|22,3|22,3|22,3|22,3|22"
	contador_paginas_vistas = 0;
	
	doSetValue("cmi.core.lesson_location", pagina);
	
	if(curso_completo == false){
		
		doSetValue('cmi.suspend_data',datos_pagina);
	
		for(c=0; c <= total; c++){
			
			if(datos_pagina[c].split("|")[0] == 3){  
				contador_paginas_vistas++;
				if(contador_paginas_vistas == total){
				   estado_SCO("completed")
				   curso_completo = true;
				   //alert("curso completo");
				}
			}
		}
	}
	
	doCommit();
	return;

}

function getLocation() {
	lesson_location_global = doGetValue("cmi.core.lesson_location");
	datos_notas = doGetValue('cmi.suspend_data');
}



function setea_nota(nota){

	doSetValue("cmi.core.score.raw", nota);
	doCommit();

}


function doQuit() {
    doSetValue( "cmi.core.exit", "" );
    computeTime();
    exitPageStatus = true;
    var result;
    result = doTerminate();
    //result = doLMSFinish();
}

// Funciones llamadas desde AS

function setComment(comentario) {
    var valor = doSetValue('cmi.comments',comentario);
    return;
}

/*
function getComments(id_flash) {
    var comentario_guardado = doGetValue('cmi.comments');
    if (window.document[id_flash]) {
        window.document[id_flash].SetVariable('txt',comentario_guardado);
    }
    if (navigator.appName.indexOf("Microsoft Internet")==-1) {
        if (document.embeds && document.embeds[id_flash]) {
            document.embeds[id_flash].SetVariable('txt',comentario_guardado);
        }
    }
    else {
        document.getElementById(id_flash).SetVariable('txt',comentario_guardado);
    }
}
*/



function estado_SCO(vStatus) {
   var valor = doSetValue('cmi.core.lesson_status',vStatus);
   return;
}




function unloadPage() {
    //setEvalCompleted();
    doQuit();
}

function setEvalCompleted(valor_eval1){
   //  var propiedad_eval1 = 'cmi.objectives.'+nro_objetivo+'.score.raw';
//    var valor_eval1 = parseInt(doGetValue(propiedad_eval1));
    if(valor_eval1 >= 75){
        setEvaluacion("passed")
    }else{
        setEvaluacion("failed")
    }
    return
}

function startTimer() {
    startDate = new Date().getTime();
}

function computeTime() {
    if ( startDate != 0 ) {
        var currentDate = new Date().getTime();
        var elapsedSeconds = ( (currentDate - startDate) / 1000 );
        var formattedTime = convertTotalSeconds( elapsedSeconds );
    }
    else 	{
        formattedTime = "00:00:00.0";
    }

    if (_Debug == true) {
        alert("computeTime(): formattedTime == "+formattedTime);
    }
    doSetValue( "cmi.core.session_time", formattedTime );
}
/*******************************************************************************
 ** this function will convert seconds into hours, minutes, and seconds in
 ** CMITimespan type format - HHHH:MM:SS.SS (Hours has a max of 4 digits &
 ** Min of 2 digits
 *******************************************************************************/
function convertTotalSeconds(ts) {
    var sec = (ts % 60);

    ts -= sec;
    var tmp = (ts % 3600);  //# of seconds in the total # of minutes
    ts -= tmp;              //# of seconds in the total # of hours

    // convert seconds to conform to CMITimespan type (e.g. SS.00)
    sec = Math.round(sec*100)/100;

    var strSec = new String(sec);
    var strWholeSec = strSec;
    var strFractionSec = "";

    if (strSec.indexOf(".") != -1) {
        strWholeSec =  strSec.substring(0, strSec.indexOf("."));
        strFractionSec = strSec.substring(strSec.indexOf(".")+1, strSec.length);
    }

    if (strWholeSec.length < 2) {
        strWholeSec = "0" + strWholeSec;
    }
    strSec = strWholeSec;

    if (strFractionSec.length) {
        strSec = strSec+ "." + strFractionSec;
    }


    if ((ts % 3600) != 0 )
        var hour = 0;
    else var hour = (ts / 3600);
    if ( (tmp % 60) != 0 )
        var min = 0;
    else var min = (tmp / 60);

    if ((new String(hour)).length < 2)
        hour = "0"+hour;
    if ((new String(min)).length < 2)
        min = "0"+min;

    var rtnVal = hour+":"+min+":"+strSec;

    if (_Debug == true) {
        alert("convertTotalSeconds(): rtnVal == "+rtnVal);
    }

    return rtnVal;
}

function enlace(ruta){
	 window.open(ruta);
}

function cerrar_ventana(){
	 top.close();
}

function cerrar_ventana2(){
	 parent.close();
}

function cerrar_ventana3(){
	 top.document.close();
}