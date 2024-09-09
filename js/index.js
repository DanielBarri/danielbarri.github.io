import {EleResultados} from "./entities/elementoResultados.js"
import {Periodo} from "./entities/periodo.js"
import {Nasa} from "./entities/nasa.js"
import {Facturacion} from "./entities/facturacion.js"

//const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
//const estandarPesosMexicanos = Intl.NumberFormat("es-MX");



const contenedorPeriodos = document.getElementById("contenedor-periodos");
const contenedorResultados = document.getElementById("seccionInfo");
const graficaGeneracion = document.getElementById('grafica-generacion');
const contenedorGrafica = document.getElementById('contenedor-grafica');


const consumosPeriodos = [];
const dataNasa = [];
const facturacionBimestral = [];
const diasPorBimestre = [];

let chartInstance;


const promGeneracionBim = 0;
const resultadosCalculos = [];

const potenciaPanel = 580;
const factor = (0.8/1000);
const diasMes = 30;
const dataNasa2 = [{"JAN":4.26,"FEB":5.26,"MAR":6.33,"APR":6.91,"MAY":6.95,"JUN":6.66,"JUL":6.39,"AUG":6.33,"SEP":5.4,"OCT":5.16,"NOV":4.46,"DEC":4.12}];
const generacionMensual= [];
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
    facturacionBimestral.length = 0;
    diasPorBimestre.length = 0;
    
    for(let i = 0; i < numPeriodos; i++){
      const periodo = `periodo ${i+1}`;
      const consumo = document.getElementById(`periodo-${i+1}`).value;
      const datos = new Periodo(periodo,consumo);
      consumosPeriodos.push(datos);
    };

    let consumosPeriodosJson = JSON.stringify(consumosPeriodos);
    console.info("Consumos por periodo guardados:", consumosPeriodosJson);
    localStorage.setItem('consumosPeriodosJson', consumosPeriodosJson);
    
    resetCharts();
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
  input.type = 'number';
  input.placeholder = `Periodo ${i+1}`;
  input.id = `periodo-${i+1}`;

  let span = document.createElement("span");
  span.className = "input-group-text";
  span.id = "basic-addon2";
  span.textContent = "kWh";
  
  let celda= document.createElement("div");
  celda.className = "input-group mb-2";
  celda.append(input);
  celda.append(span);

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
        Number(elemento.consumo));

      consumosPeriodos.push(registro);
    });
    console.log("Consumos Periodos: ", consumosPeriodos);
  }
};

//funcion para calcular facturacion bimestral de consumos
const calcularFacturacionBimestral = () => {
  const consBasico = 1.039;
  const consIntermedio = 1.263;
  const consExcedente = 3.698;
  const tbase = 58.08;
  
  consumosPeriodos.forEach(obj => {
    let periodo = obj.periodo;
    let consumo = 0;
    if (obj.consumo < 150) {
      consumo = Math.round(obj.consumo * consBasico + tbase);
    } else if (obj.consumo < 280) {
      consumo = Math.round((obj.consumo-150)*consIntermedio + 150*consBasico + tbase);
    } else {
      consumo = Math.round((obj.consumo-280)*consExcedente + 130*consIntermedio + 150*consBasico + tbase);
    }
    let elementoFacturacion = new Facturacion(periodo,consumo)
    facturacionBimestral.push(elementoFacturacion);
      
  });
  console.log("Facturacion Bimestral: ", facturacionBimestral);
  return facturacionBimestral;
};


//funcion para calcular Generacion Promedio Bimestral
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
  return consumoBimestral;
};



//Calcular numero de Paneles
const calcularNumPaneles = () => {
  let prom = consumosPromedioBimestral();
  let gen = calcularPromedio(generacionMensual)*2;
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
  llenarResultados("R4","Potencia del Inversor: ",potenciaInversor,"W");
  llenarResultados("R5","Generación bimestral promedio: ",genPromedio,"kWh");
  llenarResultados("R6","Consumo bimestral promedio:",prom,"kWh");
  
  const genMenSistema = [];

  const generacionSysMes =(data) => {
    data.forEach(object => { 
      let genSys = {};
      Object.keys(object).forEach(mes => {
        genSys[mes] = object[mes]*numPaneles;
      })
      genMenSistema.push(genSys);
    })
  }

  const generacionSysBim = (data) => {
    
    const mesesArray = Object.values(data[0]);

    for(let i = 0; i < mesesArray.length; i += 2) {
      const diasBimestre = Math.round(mesesArray[i] + (mesesArray[i+1] || 0));
      const periodo = `Periodo ${Math.floor(i/2)+1}`;
      let elementoGeneracion = new Facturacion(periodo, diasBimestre);
      diasPorBimestre.push(elementoGeneracion);
    }
    return diasPorBimestre;
  }
  
  generacionSysMes(generacionMensual);
  calcularFacturacionBimestral();
  const diasBimestres = generacionSysBim(genMenSistema);

  console.log("Generacion Mensual Sistema: ", genMenSistema);
  console.log("Generacion por bimestre: ", diasBimestres);
  dibujarGraficaFacturacion(facturacionBimestral);
  dibujarGraficaGeneracion();

  return diasBimestres;
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
  
  let header = document.createElement("h3");
  header.textContent = "Resultados de los calculos";

  let titulo = document.createElement("div");
  titulo.className = "row mt-2 mb-4";
  titulo.appendChild(header);

  let info = document.createElement("div");
  info.id = "contenedor-resultados"; 

  resultadosCalculos.forEach(resultado => {
    let contenedorRow = crearFilaResultado(resultado); 
    info.appendChild(contenedorRow);
  })

  contenedorResultados.appendChild(titulo);
  contenedorResultados.appendChild(info);

};


const llenarResultados = (id,descripcion,resultado,unidadMedida) => {
  resultadosCalculos.push(new EleResultados(id,descripcion,resultado,unidadMedida));
}

const resetCharts = () => {
  contenedorGrafica.innerHTML = "";
}

const dibujarGraficaFacturacion = (facturacionBimestral) => {

    let grafica = document.createElement("canvas");
    grafica.id = "grafica-facturacion";
    contenedorGrafica.appendChild(grafica);

    chartInstance = new Chart(document.getElementById('grafica-facturacion'), {
        type: 'bar',
        data: {
          datasets: [{
            data: facturacionBimestral,
            label: 'Facturacion bimestral ($MXN)',
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

    new Chart(graficaGeneracion, {
        type: 'bar',
        data: {
          datasets: [{
            data: diasPorBimestre,
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




//cargarValoresInputs();

//funcion facturacionAnualActual
//funcion facturacionAnualPaneles
//Funcion AhorroAnualEst


cargarDatosNasa();




