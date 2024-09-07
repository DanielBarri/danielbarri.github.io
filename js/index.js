import {EleResultados} from "./entities/elementoResultados.js"
import {Periodo} from "./entities/periodo.js"
import {Nasa} from "./entities/nasa.js"

//const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
//const estandarPesosMexicanos = Intl.NumberFormat("es-MX");


//const contenedorResultados = document.getElementById("contenedor-resultados");
const contenedorPeriodos = document.getElementById("contenedor-periodos");
const graficaGeneracion = document.getElementById('grafica-generacion');
const graficaFacturacion = document.getElementById('grafica-facturacion');

const consumosPeriodos = [];
const dataNasa = [];
const generacionMensual= {};
const promGeneracionBim = 0;
const resultadosCalculos = [];


const numPeriodos = 6;
const potenciaPanel = 580;
const factor = (0.8/1000);
const diasMes = 30;
const potenciaInversores = [1000,2000,3600,6000,8000,10000,15000];

//Funcion para cargar datos de irradiaciones NASA
const cargarDatosNasa = () => {
  fetch('./js/data/nasa.json')
    .then(response => response.json())
    .then(nasaJson => {
      nasaJson.forEach(elemento => {
        dataNasa.push(
          new Nasa(elemento.JAN,elemento.FEB,elemento.MAR,
                   elemento.APR,elemento.MAY,elemento.JUN,
                   elemento.JUL,elemento.AUG,elemento.SEP,
                   elemento.OCT,elemento.NOV,elemento.DIC));
      });
    })
    .then(() =>{ 
      
      dibujarContenedorPeriodos();
      consumosPeriodosLocalStorage();

      console.log("Generacion Mensual: ", generacionMensual);
      console.log("DataNasa: ", dataNasa);
      
    })
    .catch(error => {
      Swal.fire({
        Title: "Imposible realizar la carga",
        text: `Este es el error recibido: ${error}`,
        icon: "error"
      });
    })
    .finally(() => {
      console.log("Intento de carga finalizado");
    });
};

// Funcion para activar boton de cargar, guardar datos de consumos para hacer calculos
const crearEventoCalcular = () => {
  const evento = (ev) => {
    //Resetea las variables 
    consumosPeriodos.length = 0;
    resultadosCalculos.length = 0;
    
    for(let i = 0; i < numPeriodos; i++){
      const periodo = `periodo ${i+1}`;
      const consumo = document.getElementById(`periodo-${i+1}`).value;
      const datos = new Periodo(periodo,consumo);
      consumosPeriodos.push(datos);
    };

    let consumosPeriodosJson = JSON.stringify(consumosPeriodos);
    console.info("Consumos por periodo guardados:", consumosPeriodosJson);
    localStorage.setItem('consumosPeriodosJson', consumosPeriodosJson);
    
    dibujarContenedorPeriodos();

    Swal.fire({
      title: "¡Calculo realizado!",
      icon: "success",
    });
  }
  return evento;
};

// Crear celda de Inputs Periodos
const crearCeldaInput = (i) => {
  
  let input = document.createElement("input");
  input.className = "form-control";
  input.type = "number";
  input.placeholder = `Periodo ${i+1}`;
  input.id = `periodo-${i+1}`;

  let span = document.createElement("span");
  span.className = "input-group-text";
  span.id = "basic-addon2";
  span.textContent = "kWh";
  
  let celda= document.createElement("div");
  celda.className = "input-group mb-2";
  celda.appendChild(input);
  celda.appendChild(span);

  return celda;
}

//Dibujar contenedor Periodos
const dibujarContenedorPeriodos = () => {
  contenedorPeriodos.innerHTML = "";

  for(let i = 0; i < numPeriodos; i++){
    let contenedorCelda = crearCeldaInput(i);
    contenedorPeriodos.append(contenedorCelda);
  }

  let botonCalcular = document.createElement("Button");
  botonCalcular.className = "btn calcular";
  botonCalcular.type = "submit";
  botonCalcular.textContent = "Calcular";
  botonCalcular.onclick = crearEventoCalcular();

  let celdaBoton = document.createElement("div");
  celdaBoton.className = "d-grid gap-2";
  celdaBoton.id = "contenedor-bottonCalculo";
  celdaBoton.appendChild(botonCalcular);

  contenedorPeriodos.append(celdaBoton);
}



//Funcion para cargar localStorage de consumosPeriodos
const consumosPeriodosLocalStorage = () => {
  if(localStorage.getItem("consumosPeriodosJson")) {
    let consumosPeriodosJson = JSON.parse(localStorage.getItem("consumosPeriodosJson"));

    consumosPeriodosJson.forEach(elemento => {
      let registro = new Periodo(
        elemento.periodo,
        elemento.consumo);

      consumosPeriodos.push(registro);
    });
    console.log("Consumos Periodos: ", consumosPeriodos);
  }
};


//funcion para calcular Generacion Promedio Bimestral
const genBimestralProm = () => {
  const sumaGeneracion = Object.values(generacionMensual).reduce((acumulador, valor) => acumulador + valor, 0);
  const promedioGen = sumaGeneracion/sumaGeneracion.length;
  console.log("Promedio",promedioGen);
}


//funcion calcularConsumoBimestralPromedio
const consumosPromedioBimestral = () => {
  let sumaConsumo = 0;

  consumosPeriodos.forEach(periodo => {
    sumaConsumo += Number(periodo.consumo);
  });

  const consumoBimestral = sumaConsumo / consumosPeriodos.length;
  console.log("Suma", sumaConsumo);
  console.log(`El consumo promedio es: ${consumoBimestral}`);
  return consumoBimestral;
};


//Calcular numero de Paneles
const calcularNumPaneles = () => {
  let prom = consumosPromedioBimestral();
  let gen = genBimestralProm();
  console.log("Prom: ", prom);
  console.log("gen", gen);
  const numPaneles = (prom/gen);
  llenarResultados("R1","Cantidad de paneles: ",numPaneles,"paneles");
  const potenciaSistema = numPaneles*potenciaPanel;

  const numeroMasCercanoMayor = (lista, num) => {
    const mayores = lista.filter(n => n > num);
    if (mayores.length === 0) return null;
    return Math.min(...mayores);
  }

  const potenciaInversor = numeroMasCercanoMayor(potenciaInversores, potenciaSistema);
  console.log("Numero de Paneles: ", numPaneles);
  console.log("Potencia de sistema: ", potenciaSistema);
  console.log("Potencia de Inversor: ", potenciaInversor);
  return numPaneles;
}; 

//Funcion para dibujar seccion de Resultados de los calculos
const dibujaSeccionResultados = () => {
  let content = "";
 
  resultadosCalculos.forEach(elemento => {
    content += `<div class="row mt-2 mb-2">
                  <div class="col-8">${resultadosCalculos.descripcion}</div>
                  <div class="col-3">10 paneles</div>
                </div>`;
  })
  document.getElementById("contenedor-resultados").innerHTML = content;
};



const llenarResultados = (id,descripcion,resultado,unidadMedida) => {
  resultadosCalculos.push(new EleResultados(id,descripcion,resultado,unidadMedida));
}


const dibujarGraficaFacturacion = () => {
    const datosFacturacion = [{x:"Periodo 1",y:(generacionMensual.JAN+generacionMensual.FEB)},
                              {x:"Periodo 2",y:(generacionMensual.JAN+generacionMensual.FEB)},
                              {x:"Periodo 3",y:(generacionMensual.JAN+generacionMensual.FEB)},
                              {x:"Periodo 4",y:(generacionMensual.JAN+generacionMensual.FEB)},
                              {x:"Periodo 5",y:(generacionMensual.JAN+generacionMensual.FEB)},
                              {x:"Periodo 6",y:(generacionMensual.JAN+generacionMensual.FEB)}];

    new Chart(graficaFacturacion, {
        type: 'bar',
        data: {
          datasets: [{
            data: datosFacturacion,
            label: 'Generacion bimestral (kWh)',
            borderWidth: 4
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
}


const dibujarGraficaGeneracion = () => {
    //prueba de graficado
    const datosFacturacion = [{x:"Periodo 2",y:3000},{x:"Periodo 2",y:3000},{x:"Periodo 3",y:3000},{x:"Periodo 4",y:3000},{x:"Periodo 5",y:3000},{x:"Periodo 6",y:3000}];

    new Chart(graficaGeneracion, {
        type: 'bar',
        data: {
          datasets: [{
            data: datosFacturacion,
            label: 'Generacion bimestral (kWh)',
            borderWidth: 4
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
}

dibujarGraficaFacturacion();




//dibujarGraficaGeneracion()
//dibujarGraficaFacturacion()



//cargarValoresInputs();

//funcion facturacionAnualActual
//funcion facturacionAnualPaneles
//Funcion AhorroAnualEst


cargarDatosNasa();




