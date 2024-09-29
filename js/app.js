const criptomonedasSelect = document.querySelector('#criptomonedas');
const monedaSelect = document.querySelector('#moneda');
const formulario = document.querySelector('#formulario');
const resultado = document.querySelector('#resultado');
const modal = document.getElementById('myModal');
const span = document.querySelector('.close');
const coinImage = document.getElementById('coinImage');
const originalImage = '/img/logobitcoin.png';
const roundImage = '/img/bitcoCointRound.png';
const downImage = '/img/bitCointDown.png';

// Agregar evento de mouseover
coinImage.addEventListener('mouseover', () => {
    coinImage.src = roundImage; // Cambia a la imagen redonda
});

// Agregar evento de mouseout
coinImage.addEventListener('animationend', () => {
    coinImage.src = downImage; // Cambia a la imagen hacia abajo
    setTimeout(() => {
        coinImage.src = originalImage; // Regresa a la imagen original
    }, 300); // Tiempo de espera antes de regresar a la imagen original
});


const objBusqueda = {
    moneda: '',
    criptomoneda: ''
}

// Crear un promise
const obtenerCriptomonedas = criptomonedas => new Promise (resolve => {
    resolve(criptomonedas);
});

document.addEventListener('DOMContentLoaded', () => {
    consultarCriptomonedas();

    formulario.addEventListener('submit', submitFormulario);

    criptomonedasSelect.addEventListener('change', leerValor);
    monedaSelect.addEventListener('change', leerValor);

    // Cerrar el modal al hacer clic en la "X"
    span.addEventListener('click', cerrarModal);

    // Cerrar el modal cuando se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            cerrarModal();
        }
    });
});

async function consultarCriptomonedas() {
    const url = 'https://min-api.cryptocompare.com/data/top/totalvolfull?limit=10&tsym=USD';

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();
        const criptomonedas = await obtenerCriptomonedas(resultado.Data);

        // Crear gráfico
        mostrarGraficoCriptomonedas(criptomonedas);

        selectCriptomonedas(criptomonedas);
    } catch (error) {
        console.log(error);
    }
}

function mostrarGraficoCriptomonedas(criptomonedas) {
    const nombresCriptomonedas = criptomonedas.map(cripto => cripto.CoinInfo.FullName);
    const valoresCriptomonedas = criptomonedas.map(cripto => cripto.RAW.USD.VOLUME24HOUR);

    const chartDom = document.getElementById('cryptoChart');
    const myChart = echarts.init(chartDom);

    const option = {
        title: {
            text: 'Volumen de Comercio de Criptomonedas (24h)',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            },
            formatter: function (params) {
                const value = params[0].value;
                return `${params[0].axisValue} <br/> Volumen: ${new Intl.NumberFormat().format(value)} USD`;
            }
        },
        xAxis: {
            type: 'category',
            data: nombresCriptomonedas,
            name: 'Criptomoneda',
        },
        yAxis: {
            type: 'value',
            name: 'Volumen (USD)',
            axisLabel: {
                formatter: function (value) {
                    if (value >= 1e9) {
                        return (value / 1e9).toFixed(1) + 'B'; // Billones
                    } else if (value >= 1e6) {
                        return (value / 1e6).toFixed(1) + 'M'; // Millones
                    } else if (value >= 1e3) {
                        return (value / 1e3).toFixed(1) + 'K'; // Miles
                    }
                    return value;
                }
            }
        },
        series: [{
            type: 'line',
            data: valoresCriptomonedas,
            itemStyle: {
                color: '#5470C6'
            },
            label: {
                show: true,
                position: 'top',
                formatter: function (param) {
                    const value = param.value;
                    return `${(value >= 1e9 ? (value / 1e9).toFixed(1) + 'B' : value >= 1e6 ? (value / 1e6).toFixed(1) + 'M' : value >= 1e3 ? (value / 1e3).toFixed(1) + 'K' : value)} USD`;
                }
            },
            areaStyle: {}  // Gráfico de área opcional
        }]
    };

    myChart.setOption(option);
}




function selectCriptomonedas(criptomonedas) {
    criptomonedas.forEach(cripto => {
        const { FullName, Name } = cripto.CoinInfo;
        const option = document.createElement('option');
        option.value = Name;
        option.textContent = FullName;
        criptomonedasSelect.appendChild(option);
    });
}

function leerValor(e) {
    objBusqueda[e.target.name] = e.target.value;
}

function submitFormulario(e) {
    e.preventDefault();

    const { moneda, criptomoneda } = objBusqueda;

    if (moneda === '' || criptomoneda === '') {
        mostrarAlerta('Ambos campos son obligatorios');
        return;
    }

    // Consultar la API con los resultados
    consultarAPI();
}
function mostrarAlerta(msj){

    const existeError = document.querySelector('.error')

    if(!existeError){
        const divMensaje = document.createElement('div')
        divMensaje.classList.add('error')
    
        // Mensaje de error
        divMensaje.textContent = msj
    
        formulario.appendChild(divMensaje)
    
        setTimeout(() => {
            divMensaje.remove()
        }, 3000)
    }

}
async function consultarAPI() {
    const { moneda, criptomoneda } = objBusqueda;

    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${criptomoneda}&tsyms=${moneda}`;

    mostrarSpinner();

    try {
        const respuesta = await fetch(url);
        const cotizacion = await respuesta.json();
        mostrarCotizacionHTML(cotizacion.DISPLAY[criptomoneda][moneda]);
        abrirModal(); // Abre el modal con los resultados
    } catch (error) {
        console.log(error);
    }
}

function mostrarCotizacionHTML(cotizacion) {
    limpiarHTML();

    const { PRICE, HIGHDAY, LOWDAY, CHANGEPCT24HOUR, LASTUPDATE } = cotizacion;

    const precio = document.createElement('p');
    precio.classList.add('precio');
    precio.innerHTML = `Precio Actual: <span>${PRICE}</span>`;

    const precioAlto = document.createElement('p');
    precioAlto.innerHTML = `<p>Precio más alto del día: <span>${HIGHDAY}</span> </p>`;

    const precioBajo = document.createElement('p');
    precioBajo.innerHTML = `<p>Precio más bajo del día: <span>${LOWDAY}</span> </p>`;

    const ultimasHoras = document.createElement('p');
    ultimasHoras.innerHTML = `<p>Ultimas horas: <span>${CHANGEPCT24HOUR}</span> </p>`;

    const ultimaActualizacion = document.createElement('p');
    ultimaActualizacion.innerHTML = `<p>Última actualización: <span>${LASTUPDATE}</span> </p>`;

    resultado.appendChild(precio);
    resultado.appendChild(precioAlto);
    resultado.appendChild(precioBajo);
    resultado.appendChild(ultimasHoras);
    resultado.appendChild(ultimaActualizacion);
}

function limpiarHTML() {
    while (resultado.firstChild) {
        resultado.removeChild(resultado.firstChild);
    }
}

function mostrarSpinner() {
    limpiarHTML();

    const spinner = document.createElement('div');
    spinner.classList.add('spinner');

    spinner.innerHTML = `
        <div class="sk-cube-grid">
            <div class="sk-cube sk-cube1"></div>
            <div class="sk-cube sk-cube2"></div>
            <div class="sk-cube sk-cube3"></div>
            <div class="sk-cube sk-cube4"></div>
            <div class="sk-cube sk-cube5"></div>
            <div class="sk-cube sk-cube6"></div>
            <div class="sk-cube sk-cube7"></div>
            <div class="sk-cube sk-cube8"></div>
            <div class="sk-cube sk-cube9"></div>
        </div>
    `;

    resultado.appendChild(spinner);
}

// Función para abrir el modal
function abrirModal() {
    modal.style.display = 'block';
}

// Función para cerrar el modal
function cerrarModal() {
    modal.style.display = 'none';
}


