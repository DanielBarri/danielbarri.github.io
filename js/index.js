import {ConsumoPeriodo} from "./entities/ConsumoPeriodo.js"
import {EleResultados} from "./entities/elementoResultados.js"

const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
const estandarPesosMexicanos = Intl.NumberFormat("es-MX");


const contenedorResultados = document.getElementById("contenedor-resultados");
const graficaGeneracion = document.getElementById('grafica-generacion');
const graficaFacturacion = document.getElementById('grafica-facturacion');

const consumosPeriodos = [];
const generacionMensualPaneles = [];
const elementosResultados = [];
const numPeriodos = 6;

// Dibujar contenedor Periodos
const dibujarContenedorPeriodos = () => {
  let content = "";

  for(let i = 0; i < numPeriodos; i++){
    content += `<div class="input-group mb-2">
                    <input class="form-control" type="number" width="15" placeholder="Periodo ${i+1}" id="periodo-${i+1}">
                    <span class="input-group-text" id="basic-addon2">kWh</span>
                </div>`;
  }
  document.getElementById("contenedor-periodos").innerHTML = content;
}

// Funcion para activar boton de cargar, guardar datos de consumos para hacer calculos
const cargarDatosConsumos = () => {
  
  document.getElementById("seccion-calculo").addEventListener("submit", (event) => {
    event.preventDefault();
    
    for(let i = 0; i < numPeriodos; i++){
      const data = {};
      data.periodo = (`periodo ${i+1}`);
      data.consumo = document.getElementById(`periodo-${i+1}`).value;
      consumosPeriodos.push(data);
    };

    //console.log("El consumo promedio Bimestral es: ", consumosPromedioBimestral(consumosPeriodos));
    console.log(consumosPeriodos);

    let consumosPeriodosJson = JSON.stringify(consumosPeriodos);
      console.info("Consumos por periodo guardados:", consumosPeriodosJson);
      localStorage.setItem('consumosPeriodosJson', consumosPeriodosJson);

  });
}

//Funcion para cargar localStorage de consumosPeriodos
const consumosPeriodosLocalStorage = () => {
  let consumoPeriodosTexto = localStorage.getItem("consumosPeriodosJson");
  console.info('Consumos por periodo en local storage:', consumoPeriodosTexto);

  if(consumoPeriodosTexto) {
    let consumosPeriodosJson = JSON.parse(consumoPeriodosTexto);

    consumosPeriodosJson.forEach(
      elementoJson => {
        let elemento = new ConsumoPeriodo(
          elementoJson.periodo,
          elementoJson.consumo
        );
        consumosPeriodos.push(elemento);
      }
    );
  }
};


//funcion calcularConsumoBimestralPromedio
const consumosPromedioBimestral = (consumosPeriodos, EleResultados) => {
  let sumaConsumo = 0;

  consumosPeriodos.forEach(periodo => {
    sumaConsumo += Number(periodo.consumo);
  });

  const promedioBimestral = sumaConsumo / consumosPeriodos.length;
  return promedioBimestral;
};

//funcion calcular cantidad paneles
const calcularCantidadPaneles = () => {

}







const dibujarGraficaFacturacion = () => {
    const datosFacturacion = [{x:"Periodo 2",y:3000},{x:"Periodo 2",y:3000},{x:"Periodo 3",y:3000},{x:"Periodo 4",y:3000},{x:"Periodo 5",y:3000},{x:"Periodo 6",y:3000}];

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



//crearObjetoBaseConsumos();
consumosPeriodosLocalStorage();
dibujarContenedorPeriodos();
cargarDatosConsumos();
//cargarValoresInputs();
dibujarGraficaGeneracion()
dibujarGraficaFacturacion()


//funcion calcularCantidadPaneles
//const potenciaPanel = 590
//funcion calcularPotenciaSistema 
//funcion calcularPotenciaInversor
//funcion calcularGeneracionBimestralProm
//funcion facturacionAnualActual
//funcion facturacionAnualPaneles
//Funcion AhorroAnualEst







