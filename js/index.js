import {EleResultados} from "./entities/elementoResultados.js"
import {Periodo} from "./entities/periodo.js"
import {Nasa} from "./entities/nasa.js"

//const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
//const estandarPesosMexicanos = Intl.NumberFormat("es-MX");


const contenedorResultados = document.getElementById("contenedor-resultados");
const contenedorPeriodos = document.getElementById("contenedor-periodos");
const graficaGeneracion = document.getElementById('grafica-generacion');
const graficaFacturacion = document.getElementById('grafica-facturacion');

const consumosPeriodos = [];
const dataNasa = [];


const promGeneracionBim = 0;
const resultadosCalculos = [];


const numPeriodos = 6;
const potenciaInversores = [1000,2000,3600,6000,8000,10000,15000];

//Funcion para cargar datos de irradiaciones NASA OK
const cargarDatosNasa = () => {
  fetch('./js/data/nasa.json')
    .then(response => response.json())
    .then(nasaJson => {
      nasaJson.forEach(elemento => {
        dataNasa.push(
          new Nasa(elemento.JAN,elemento.FEB,elemento.MAR,
                   elemento.APR,elemento.MAY,elemento.JUN,
                   elemento.JUL,elemento.AUG,elemento.SEP,
                   elemento.OCT,elemento.NOV,elemento.DEC));
      });
    })
    .then(() =>{ 
      
      dibujarContenedorPeriodos();
      consumosPeriodosLocalStorage();
      
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

// Funcion para activar boton de cargar, guardar datos de consumos para hacer calculos OK
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
    calcularNumPaneles();
    dibujaSeccionResultados();

    Swal.fire({
      title: "¡Calculo realizado!",
      icon: "success",
    });
  }
  return evento;
};

// Crear celda de Inputs Periodos OK
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

//Dibujar contenedor Periodos OK
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



//Funcion para cargar localStorage de consumosPeriodos OK
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
const potenciaPanel = 580;
const factor = (0.8/1000);
const diasMes = 30;
const dataNasa2 = [{"JAN":4.26,"FEB":5.26,"MAR":6.33,"APR":6.91,"MAY":6.95,"JUN":6.66,"JUL":6.39,"AUG":6.33,"SEP":5.4,"OCT":5.16,"NOV":4.46,"DEC":4.12}];
const generacionMensual= [];

const calcularGeneracionMensual = (data, potencia, factor, dias) => {
  data.forEach(obj => {
    const nuevoObj = {};
    Object.keys(obj).forEach(mes => {
      nuevoObj[mes] = obj[mes] * potencia * factor * dias;
    });
    generacionMensual.push(nuevoObj);
  });
};

const calcularPromedio = (array) => {
  calcularGeneracionMensual(dataNasa2, potenciaPanel, factor, diasMes);
  const sumas = array.reduce((acumulador, obj) => {
    Object.values(obj).forEach(valor => {
      acumulador += valor;
    });
    return acumulador;
  }, 0);

  const totalValores = array.length * Object.keys(array[0]).length;
  return sumas / totalValores;
};

//funcion calcularConsumoBimestralPromedio
const consumosPromedioBimestral = () => {
  let sumaConsumo = 0;

  consumosPeriodos.forEach(periodo => {
    sumaConsumo += Number(periodo.consumo);
  });

  const consumoBimestral = sumaConsumo / consumosPeriodos.length;
  console.log("Suma de tu consumo es: ", sumaConsumo);
  console.log(`El consumo promedio es: ${consumoBimestral}`);
  return consumoBimestral;
};


//Calcular numero de Paneles
const calcularNumPaneles = () => {
  let prom = consumosPromedioBimestral();
  let gen = calcularPromedio(generacionMensual)*2;
  console.log("Prom: ", prom);
  console.log("gen", gen);
  const numPaneles = Math.ceil(prom/gen);
  let genPromedio = Math.round(gen*numPaneles);
  llenarResultados("R1","Cantidad de paneles: ",numPaneles,"paneles");
  const potenciaSistema = numPaneles*potenciaPanel;
  llenarResultados("R2","Potencia del sistema: ",potenciaSistema,"W");
  llenarResultados("R3","Potencia de paneles: ", potenciaPanel,"Wp");



  const numeroMasCercanoMayor = (lista, num) => {
    const mayores = lista.filter(n => n > num);
    if (mayores.length === 0) return null;
    return Math.min(...mayores);
  }

  const potenciaInversor = numeroMasCercanoMayor(potenciaInversores, potenciaSistema);
  console.log("Numero de Paneles: ", numPaneles);
  console.log("Potencia de sistema: ", potenciaSistema);
  console.log("Potencia de Inversor: ", potenciaInversor);
  llenarResultados("R4","Potencia del Inversor: ",potenciaInversor,"W");
  llenarResultados("R5","Generación bimestral promedio: ",genPromedio,"kWh");
  llenarResultados("R6","Consumo bimestral promedio:",prom,"kWh");
  return numPaneles;
}; 

//Funcion para dibujar seccion de Resultados de los calculos
const crearFilaResultado = (resultado) => {
  let col1 = document.createElement("div");
  col1.className = "col-8";
  col1.textContent = resultado.descripcion;
  
  let col2 = document.createElement("div");
  col2.className = "col-3";
  col2.textContent = `${resultado.resultado} ${resultado.unidadMedida}`;

  let row = document.createElement("div");
  row.className = "row mt-2 mb-2";
  row.appendChild(col1);
  row.appendChild(col2);

  return row;
}

const dibujaSeccionResultados = () => {
  contenedorResultados.innerHTML = "";
 
  resultadosCalculos.forEach(resultado => {
    let contenedorRow = crearFilaResultado(resultado); 
    contenedorResultados.append(contenedorRow);
  })
};


const llenarResultados = (id,descripcion,resultado,unidadMedida) => {
  resultadosCalculos.push(new EleResultados(id,descripcion,resultado,unidadMedida));
  console.log(resultadosCalculos);
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




