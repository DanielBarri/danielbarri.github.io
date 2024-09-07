import {ConsumoPeriodo} from "./entities/ConsumoPeriodo.js"
import {EleResultados} from "./entities/elementoResultados.js"

//const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
//const estandarPesosMexicanos = Intl.NumberFormat("es-MX");


//const contenedorResultados = document.getElementById("contenedor-resultados");
const graficaGeneracion = document.getElementById('grafica-generacion');
const graficaFacturacion = document.getElementById('grafica-facturacion');

const consumosPeriodos = [];
const dataNasa = {};



//const elementosResultados = [];
const numPeriodos = 6;
const potenciaPanel = 580;
const factor = (0.8/1000);
const diasMes = 30;
const potenciaInversores = [1000,2000,3600,6000,8000,10000,15000];


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

    consumosPeriodos.lenght = 0;
    
    for(let i = 0; i < numPeriodos; i++){
      const data = {};
      data.periodo = (`periodo ${i+1}`);
      data.consumo = document.getElementById(`periodo-${i+1}`).value;
      consumosPeriodos.push(data);
    };

    let consumosPeriodosJson = JSON.stringify(consumosPeriodos);
      console.info("Consumos por periodo guardados:", consumosPeriodosJson);
      localStorage.setItem('consumosPeriodosJson', consumosPeriodosJson); 
    
      
      calcularNumPaneles();    
  });
};

//Funcion para cargar localStorage de consumosPeriodos
const consumosPeriodosLocalStorage = () => {
  let consumoPeriodosTexto = localStorage.getItem("consumosPeriodosJson");
  //console.info('Consumos por periodo en local storage:', consumoPeriodosTexto);

  if(consumoPeriodosTexto) {
    let consumosPeriodosJson = JSON.parse(consumoPeriodosTexto);

    consumosPeriodosJson.forEach(elementoJson => {
        const elemento = new ConsumoPeriodo(
          elementoJson.periodo,
          elementoJson.consumo
        );
        consumosPeriodos.push(elemento);
      });
  }
};

//Funcion para cargar datos de irradiaciones NASA
const cargarDatosNasa = () => {
  fetch('./js/data/nasa.json')
    .then(response => response.json())
    .then(nasaJson => {
      Object.keys(nasaJson).forEach(key => {
        dataNasa[key] = nasaJson[key];
      });
    })
    .then(() =>{
      dibujarContenedorPeriodos();
      consumosPeriodosLocalStorage();
      cargarDatosConsumos();
      
      
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

cargarDatosNasa();
console.log("DataNasa: ", dataNasa);


//Funcion para calcular generacion mensual de paneles solares
const generacionMensualPanel = () => {
  // Filtra las claves cuyos valores son numéricos y genera el objeto resultante
  const genMesPanel = Object.entries(dataNasa)
    .filter(([key, value]) => !isNaN(value)) // Filtra solo los numéricos
    .reduce((result, [key, value]) => {
      result[key] = value * factor * potenciaPanel * diasMes; // Aplica el cálculo
      return result;
    }, {});

  console.log("Generación Mensual Panel: ", genMesPanel);
  return genMesPanel;
};

generacionMensualPanel();

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
  let gen = calcularGeneracionPanelMensual();
  console.log("Prom: ", prom);
  console.log("gen", gen);
  const numPaneles = (prom/gen);
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





const dibujarGraficaFacturacion = (generacionMensualPanel) => {
    const datosFacturacion = [{x:"Periodo 2",y:(generacionMensualPanel.JAN+generacionMensualPanel.FEB)},
                              {x:"Periodo 2",y:(generacionMensualPanel.JAN+generacionMensualPanel.FEB)},
                              {x:"Periodo 3",y:(generacionMensualPanel.JAN+generacionMensualPanel.FEB)},
                              {x:"Periodo 4",y:(generacionMensualPanel.JAN+generacionMensualPanel.FEB)},
                              {x:"Periodo 5",y:(generacionMensualPanel.JAN+generacionMensualPanel.FEB)},
                              {x:"Periodo 6",y:(generacionMensualPanel.JAN+generacionMensualPanel.FEB)}];

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






//dibujarGraficaGeneracion()
//dibujarGraficaFacturacion()



//cargarValoresInputs();

//funcion facturacionAnualActual
//funcion facturacionAnualPaneles
//Funcion AhorroAnualEst







