//Referencias a los campos del formulario (se completan cuando el DOM está listo)
let cantidadGente, cantidadNoches, arrival, distanceArrival, transportation, origen, places;

document.addEventListener('DOMContentLoaded', function () {
    //Capturo los valores ingresados
    cantidadGente = document.getElementById("cantidadGente");
    cantidadNoches = document.getElementById("cantidadNoches");
    arrival = document.getElementById("arrival"); //Forma de transporte que usó para venir.
    distanceArrival = document.getElementById("distance"); //Km que recorrió para llegar.
    transportation = document.getElementById("transportation"); //Forma de transporte que usa en el destino.
    origen = document.getElementById("origen");//Lugar donde se hospedan

    //Consulto si va a visitar más de un lugar y muestro los diferentes municipios
    places = document.getElementsByName('places');
    for (let i = 0; i < places.length; i++) {
        places[i].addEventListener("click", destinations);
    }

    //Le doy la opción de agregar más de un destino a visitar
    document.getElementById("addVisit").addEventListener("click", addVisit);

    //Al oprimir el botón calcular, hago las validaciones
    document.getElementById("btn-calcular").addEventListener("click", validar);
});

function destinations(){
    var placesList = document.getElementById("placesList");
    if (places[1].checked) {
        show(placesList)
    }
    else{hide(placesList)}
}

//Funciones para mostrar y ocultar
function show(a){a.style.display="block"}
function hide(a){a.style.display="none"}

//Función para agregar más destinos
function addVisit(){
    var destinos = document.getElementById('destinos-list');
    var original = document.getElementById('listaLocalidades');
    var clone = original.cloneNode(true);
    clone.removeAttribute('id'); //Evita ids duplicados en el DOM
    clone.value = 'sin-elegir';
    destinos.appendChild(clone);
}

//Resaltar error
function resaltar(div){
    div.style.borderColor= "red";
    div.onclick=()=>{
        div.style.borderColor="var(--bs-border-color)";
    }

}

//Validación
function validar(){
    if(cantidadGente.value<1||cantidadGente.value==''){
        alert('Ingrese la cantidad de viajeros');
        resaltar(cantidadGente);
    }
    else if(cantidadNoches.value<0||cantidadNoches.value==''){
        alert('Ingrese la cantidad de noches que pasaron en Misiones');
        resaltar(cantidadNoches);
    }
    else if(arrival.value =='sin-elegir'){
        alert('Inique la forma de transporte que usó para viajar');
        resaltar(arrival);
    }
    else if(arrival.value !== 'no' && (distanceArrival.value<=0||distanceArrival.value=='')){
        alert('Ingrese la distancia que recorrió para llegar');
        resaltar(distanceArrival);
    }
    else if(transportation.value =='sin-elegir'){
        alert('Indique la forma de transporte que usó en la provincia');
        resaltar(transportation);
    }
    else if(origen.value =='sin-elegir'){
        alert('Indique dónde se hospedaron');
        resaltar(origen);
    }
    else{calcular()}
}

const fe={
    movilidad:{
        moto:0.1, //kgCO2/km
        auto:0.26,//kgCO2/km
        bus:0.15,//kgCO2/km
        avion:0.15//kgCO2/km.persona
    },
    energia:{
        electricidad: 0.41, //kgco2/kwh
    }
}

//Función principal para el cálculo
function calcular(){
    var distanciaLocal;
    var emisionesViaje, emisionesLocales, emisionesEnergia;

    var destinos = document.getElementsByName("destino");

    //Calculo las emisiones por el viaje de ida y vuelta en función del
    //medio de transporte utilizado.
    switch (arrival.value) {
        case 'moto':
            emisionesViaje = 2*fe.movilidad.moto * parseFloat(distanceArrival.value);
            break;

        case 'auto':
            emisionesViaje = 2*fe.movilidad.auto * parseFloat(distanceArrival.value);
            break;

        case 'bus':
            emisionesViaje = 2*fe.movilidad.bus * parseFloat(distanceArrival.value);
            break;
        case 'avion':
            emisionesViaje = 2*fe.movilidad.avion * parseFloat(distanceArrival.value)*parseFloat(cantidadGente.value);
            break;

        default:
            emisionesViaje = 0;
            break;
    }
    emisionesViaje = Math.floor(emisionesViaje);

    //Calculo la distancia recorrida dentro de la provincia.
    if (destinos[0].value !='sin-elegir'){
        for (let index = 0; index < destinos.length; index++) {
            if (index == 0) {
                distanciaLocal = dist[origen.value][destinos[0].value]
            }
            else{distanciaLocal+=dist[destinos[index-1].value][destinos[index].value]
            }
        }
    }
    //Si solo recorren un lugar, se toma un promedio de 25 km/dia de recorrido
    else{distanciaLocal = 25 * parseFloat(cantidadNoches.value)}

    //Calcuo las emisiones en función de la forma de transporte usado en la provincia.
    switch (transportation.value) {
        case 'moto':
            emisionesLocales = fe.movilidad.moto * distanciaLocal;
            break;

        case 'auto':
            emisionesLocales = fe.movilidad.auto * distanciaLocal;
            break;

        case 'bus':
            emisionesLocales = fe.movilidad.bus * distanciaLocal;
            break;
        case 'pie':
            emisionesLocales = 0;
            break;

        default:
            emisionesLocales = 0;
            break;
    }
    emisionesLocales = Math.floor(emisionesLocales)

    //Emisiones por electricidad
    //Se estiman teniendo en cuenta un consumo de 2.5 kwh/persona*dia
    emisionesEnergia = Math.floor(2.5*parseFloat(cantidadGente.value)*fe.energia.electricidad);

    var huellaDeCarbono = Math.floor(emisionesLocales + emisionesViaje + emisionesEnergia)

    var cantArboles = Math.floor(huellaDeCarbono/120)
    if (cantArboles==0) {
        cantArboles = 1;
    }

    //Muestro los resultados en el html
    hide(document.getElementById('calculadora-turismo'))
    show(document.getElementById('resultadosHuella'))

    document.getElementById('huellaValor').innerHTML = "<b>"+huellaDeCarbono+"</b>";

    document.getElementById('emisionesViaje').innerHTML=`
    <p class="lead"><b>${emisionesViaje}</b> kg CO2 generados debido debido al viaje</p>
    `

    document.getElementById('emisionesLocales').innerHTML=`
    <p class="lead"><b>${emisionesLocales+emisionesEnergia}</b> kg CO2 generados en la provincia</p>
    `

    document.getElementById('arboles').innerHTML=`
        <b>${cantArboles}</b>
    `
}
