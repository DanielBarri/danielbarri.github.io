import {Periodo} from "./entities/periodo.js"
import {EleResultados} from "./entities/elementoResultados.js"

const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
const estandarPesosMexicanos = Intl.NumberFormat("es-MX");

const contenedorPeriodos = document.getElementById("contenedor-periodos");
const contenedorResultados = document.getElementById("contenedor-resultados");
const graficaGeneracion = document.getElementById('grafica-generacion');
const graficaFacturacion = document.getElementById('grafica-facturacion');

const periodos = [];
const elementosResultados = [];

const cargarDatos = () => {

    fetch('./js/data/periodos.json')
        .then(response => response.json())
        .then(periodosJson => {
            console.info("periodosJson", periodosJson);

            periodosJson.forEach(elementoJson => {
                periodos.push(
                    new Periodo(elementoJson.id, 
                        elementoJson.nombre, elementoJson.periodo));   
            });
            
        })
        .then(() => {
            dibujarContenedorPeriodos();
            
        })
        .catch(error => {
            Swal.fire({
                title: "Imposible realizar la carga",
                text: `Este es el error recibifo: ${error}`,
                icon: "error"
              })
        })
        .finally(() => {
            console.info("Intento de carga finalizado");
        });
    
    fetch('./js/data/elementosResultados.json')
    .then(response => response.json())
    .then(elementosResJson => {
        console.info("elementosResJson", elementosResJson);

        elementosResJson.forEach(elementoJson => {
            elementosResultados.push(
                new EleResultados(elementoJson.id, 
                    elementoJson.descripcion, elementoJson.unidadMedida));   
        });
        
    })
    .then(() => {
        dibujarContenedorResultados();
        
    })
    .catch(error => {
        Swal.fire({
            title: "Imposible realizar la carga",
            text: `Este es el error recibifo: ${error}`,
            icon: "error"
            })
    })
    .finally(() => {
        console.info("Intento de carga finalizado");
    });

    
}

cargarDatos();

/**const cargarIrradiacionesNasa = () => {
    fetch('./data/nasa.json')
    .then(response => {
        if (!response.ok){
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(irradiacionesNasa => {
        return irradiacionesNasa;
    })
    .catch(error => {
        console.error('Error al leer el archivo JSON:', error);
    });
    
};
**/




const crearContenedorPeriodos = (periodo) => {
    let input = document.createElement("input");
    input.className = "form-control";
    input.type = "number";
    input.width = "15";
    input.placeholder = `Periodo ${periodo.id}`;

    let span = document.createElement("span");
    span.className = "input-group-text";
    span.id = "basic-addon2";
    span.textContent = "kWh";

    let inputGroup = document.createElement("div");
    inputGroup.className = "input-group mb-2";
    inputGroup.appendChild(input);
    inputGroup.appendChild(span);


    return inputGroup;
}

const dibujarContenedorPeriodos = () => {
    contenedorPeriodos.innerHTML = "";

    periodos.forEach(periodo => {
        let contenedorPeriodo = crearContenedorPeriodos(periodo);
        contenedorPeriodos.append(contenedorPeriodo)
    });
}

dibujarContenedorPeriodos();

const crearContenedorResultados = (EleResultados) => {
    //Descripcion
    let col1 = document.createElement("div");
    col1.className = "col-8";
    col1.textContent = `${EleResultados.descripcion}`;
    //Unidad de Medida
    let col2 = document.createElement("div");
    col2.className = "col-3";
    col2.textContent = `0 ${EleResultados.unidadMedida}`;

    let row = document.createElement("div");
    row.className = "row mt-2 mb-2";
    row.appendChild(col1);
    row.appendChild(col2);

    return row;
}

const dibujarContenedorResultados = () => {
    contenedorResultados.innerHTML= "";

    elementosResultados.forEach(EleResultados => {
        let contenedorRes = crearContenedorResultados(EleResultados);
        contenedorResultados.append(contenedorRes)
    });
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

dibujarGraficaGeneracion()
dibujarGraficaFacturacion()


//funcion calcularCantidadPaneles
//const potenciaPanel = 590
//funcion calcularPotenciaSistema 
//funcion calcularPotenciaInversor
//funcion calcularGeneracionBimestralProm
//funcion calcularConsumoBimestralProm
//funcion facturacionAnualActual
//funcion facturacionAnualPaneles
//Funcion AhorroAnualEst







