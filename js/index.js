import {Periodo} from "./entities/periodo.js"

const estandarDolaresAmericanos = Intl.NumberFormat("en-US");
const estandarPesosMexicanos = Intl.NumberFormat("es-MX");

const periodos = [];
const irradiaciones =[];

/**const cargarIrradiacion = () => {
    fetch("./js/data/POWER_NASA_DATA.json")
        .then(respuesta => respuesta.json())
        .then(powerJS => {
            powerJS.forEach(elementoJson => {
                //Como recorrer la lista si los datos estan
                if elementoJson.properties {

                }
                irradiaciones.push(new irradiacion(
                    elementoJson.JAN,
                    elementoJson.FEB,
                    elementoJson.MAR,
                    elementoJson.APR,
                    elementoJson.MAY,
                    elementoJson.JUN,
                    elementoJson.JUL,
                    elementoJson.AGO,
                    elementoJson.SEP,
                    elementoJson.OCT,
                    elementoJson.NOV,
                    elementoJson.DIC
                ));    
            });
        });
        console.log("Irradiaciones completas", irradiaciones);
};

cargarIrradiacion();
**/


