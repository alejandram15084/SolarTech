// ======= GRÁFICO 1  =======

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("energyChart").getContext("2d");
    const entitySelect = document.getElementById("entitySelectGraf1");
    const countryContainer = document.getElementById("countryFilterContainer");
    const countrySelect = document.getElementById("countrySelectGraf1");
    let chart;
    let datosCSV = [];


    Papa.parse("../datos/datos_grafica1.csv", {
        download: true,
        header: true,
        complete: (results) => {
            datosCSV = results.data;
            cargarYGraficar("World");
        }
    });


    function cargarYGraficar(entidad, paisesSeleccionados = []) {
        const columnas = ["Hidráulica", "Eólica", "Solar", "Geotérmica", "Biocombustibles"];
        
        let dataFiltrada;
        if (entidad === "World") {
            dataFiltrada = datosCSV.filter(r => r.Entity === "World");
        } else if (paisesSeleccionados.length > 0) {
            dataFiltrada = datosCSV.filter(r => paisesSeleccionados.includes(r.Entity));
        } else {
            dataFiltrada = datosCSV.filter(r => r.Entity === entidad);
        }

        const years = [...new Set(dataFiltrada.map(r => r.Year))].sort((a, b) => a - b);

        const colores = ["#a5d8ff", "#8bcdcd", "#fcf876", "#cee397", "#3797a4"];
        const datasets = columnas.map((col, idx) => {
            const valores = years.map(year => {
                const rows = dataFiltrada.filter(r => r.Year == year);
                const suma = rows.reduce((acc, r) => acc + (parseFloat(r[col]) || 0), 0);
                return suma;
            });
            return {
                label: col,
                data: valores,
                backgroundColor: colores[idx]
            };
        });

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: "bar",
            data: { labels: years, datasets },
            options: {
                responsive: true,
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                plugins: {
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                            label: context =>
                                `${context.dataset.label}: ${context.parsed.y.toLocaleString("es-CO")} TWh`
                        }
                    }
                }
            }
        });
    }


    entitySelect.addEventListener("change", (e) => {
        const entidad = e.target.value;

        if (entidad === "World") {
            countryContainer.style.display = "none";
            cargarYGraficar("World");
        } else {

            countryContainer.style.display = "block";

            const paises = [...new Set(
                datosCSV
                    .filter(r => r.Continent === entidad && r.Entity !== entidad) 
                    .map(r => r.Entity)
            )].sort();

            countrySelect.innerHTML = paises.map(p => `<option value="${p}">${p}</option>`).join("");

            cargarYGraficar(entidad);
        }
    });

    countrySelect.addEventListener("change", () => {
        const seleccionados = [...countrySelect.selectedOptions].map(o => o.value);
        const continente = entitySelect.value;
        cargarYGraficar(continente, seleccionados);
    });
});







// ======= GRÁFICO 2 =======

const yearSelectPie = document.getElementById("yearSelectPie");
const entitySelectPie = document.getElementById("entitySelectPie");
const ctxPie = document.getElementById("energyPieChart").getContext("2d");
let pieChart;

Papa.parse("../datos/datos_grafica2.csv", {
    download: true,
    header: true,
    complete: function(results) {
        const columnasPie = ["Eólica","Solar","Hidráulica"];


        const entidades = [...new Set(results.data.map(r => r.Entity).filter(e => e !== undefined && e !== ""))];
        entitySelectPie.innerHTML = entidades.map(e => `<option value="${e}">${e}</option>`).join("");


        const years = [...new Set(results.data.map(r => r.Year).filter(y => y !== undefined && y !== "" && y !== null))].sort((a,b) => a - b);
        yearSelectPie.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");

        function updatePie(yearSelected, entitySelected){
            const row = results.data.find(r => r.Year == yearSelected && r.Entity == entitySelected);
            if(!row) return;

            const valores = columnasPie.map(col => parseFloat(String(row[col]).replace(',','.')) || 0);

            if(pieChart) pieChart.destroy();
            pieChart = new Chart(ctxPie,{
                type:"pie",
                data:{
                    labels: columnasPie,
                    datasets:[{
                        data: valores,
                        backgroundColor:["#8bcdcd","#fcf876","#B5DEFF"]
                    }]
                },
                options:{
                    responsive:true,
                    plugins:{
                        tooltip:{
                            callbacks:{
                                label: (c) => `${c.label}: ${valores[c.dataIndex].toFixed(2)} %`
                            }
                        }
                    }
                }
            });
        }

        yearSelectPie.addEventListener("change", e => updatePie(e.target.value, entitySelectPie.value));
        entitySelectPie.addEventListener("change", e => updatePie(yearSelectPie.value, e.target.value));

        if (years.length > 0) {
            yearSelectPie.value = years[years.length - 1];

            const worldEntity = entidades.includes("World") ? "World" : entidades[0];
            entitySelectPie.value = worldEntity;

            updatePie(years[years.length - 1], entidades[0]);
        }
    }
});

// ======= GRÁFICO 3  =======
document.addEventListener("DOMContentLoaded", () => {
    const ctxLine = document.getElementById("capacityLineChart").getContext("2d");
    const continentSelect = document.getElementById("continentSelectLine");
    const countryContainer = document.getElementById("countryFilterContainerLine");
    const countrySelect = document.getElementById("countrySelectGraf3");
    let lineChart;
    let datosCSV = [];

    Papa.parse("../datos/datos_grafica3.csv", {
        download: true,
        header: true,
        complete: (results) => {
            datosCSV = results.data.filter(r => r.Year);
            cargarYGraficar("World");
        }
    });

    function cargarYGraficar(entidad, paisesSeleccionados = []) {
        const columnas = ["Eólica", "Solar", "Geotérmica"];

        let dataFiltrada;
        if (entidad === "World") {
            dataFiltrada = datosCSV.filter(r => r.Entity === "World");
        } else if (paisesSeleccionados.length > 0) {
            dataFiltrada = datosCSV.filter(r => paisesSeleccionados.includes(r.Entity));
        } else {
            dataFiltrada = datosCSV.filter(r => r.Entity === entidad);
        }

        const years = [...new Set(dataFiltrada.map(r => r.Year))].sort((a, b) => a - b);

        const colores = ["#8BCDCD", "#FCF876", "#cee397"];
        const datasets = columnas.map((col, idx) => {
            const valores = years.map(year => {
                const rows = dataFiltrada.filter(r => r.Year == year);
                const suma = rows.reduce((acc, r) => acc + (parseFloat(r[col]) || 0), 0);
                return suma === 0 ? null : suma;;
            });
            return {
                label: col,
                data: valores,
                borderColor: colores[idx],
                backgroundColor: colores[idx],
                fill: false,
                tension: 0.3,
                spanGaps: false
            };
        });

        if (lineChart) lineChart.destroy();
        lineChart = new Chart(ctxLine, {
            type: "line",
            data: { labels: years, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                            label: context =>
                                `${context.dataset.label}: ${context.parsed.y.toLocaleString("es-CO")} GW`
                        }
                    },
                    title: {
                        display: true,
                        text: paisesSeleccionados.length > 1 ? `Suma de países seleccionados` : entidad
                    }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Capacidad instalada (GW)' } },
                    x: { title: { display: true, text: 'Año' } }
                }
            }
        });
    }

    continentSelect.addEventListener("change", (e) => {
        const entidad = e.target.value;

        if (entidad === "World") {
            countryContainer.style.display = "none";
            cargarYGraficar("World");
        } else {
            countryContainer.style.display = "block";

            const paises = [...new Set(
                datosCSV
                    .filter(r => r.Continent === entidad && r.Entity !== entidad) 
                    .map(r => r.Entity)
            )].sort();

            countrySelect.innerHTML = paises.map(p => `<option value="${p}">${p}</option>`).join("");
            cargarYGraficar(entidad);
        }
    });

    countrySelect.addEventListener("change", () => {
        const seleccionados = [...countrySelect.selectedOptions].map(o => o.value);
        const continente = continentSelect.value;
        cargarYGraficar(continente, seleccionados);
    });
});




// ======= GRÁFICO 4  =======

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("energyArea").getContext("2d");
    const entitySelect = document.getElementById("entitySelectGraf4");
    let chart;

    const columnas = [
        "Combustibles fósiles (TWh)",
        "Nuclear (TWh)",
        "Solar (TWh)",
        "Eólica (TWh)",
        "Hidroeléctrica (TWh)",
        "Geotérmica/Biomasa (TWh)"
];

    const colores = [
        "#EEF2E6", // Fossil fuels
        "#D6CDA4", // Nuclear
        "#fcf876", // Solar
        "#8bcdcd", // Wind
        "#B5DEFF", // Hydro
        "#cee397"  // Geo Biomass
    ];

    function cargarYGraficar(entity) {
        Papa.parse("../datos/datos_grafica4.csv", {
            download: true,
            header: true,
            complete: (results) => {
                const dataEntity = results.data.filter(row => row.Entity && row.Entity.trim().toLowerCase() === entity.trim().toLowerCase());

                const years = [...new Set(dataEntity.map(r => r.Year))].sort((a, b) => a - b);

                let datasets = columnas.map((col, idx) => {
                    const valores = years.map(year => {
                        const row = dataEntity.find(r => r.Year == year);
                        return parseFloat(String(row[col]).replace(",", ".")) || 0;
                    });
                    return {
                        label: col,
                        data: valores,
                        backgroundColor: colores[idx],
                        fill: true
                    };
                });

                datasets.sort((a, b) => {
                    const sumaA = a.data.reduce((acc, val) => acc + val, 0);
                    const sumaB = b.data.reduce((acc, val) => acc + val, 0);
                    return sumaA - sumaB;
                });

                if(chart) chart.destroy();
                chart = new Chart(ctx, {
                    type: "line",
                    data: { labels: years, datasets: datasets },
                    options: {
                        responsive: true,
                        plugins: {
                            tooltip: {
                                mode: "index",
                                intersect: false,
                                callbacks: {
                                    label: context => {
                                        const valor = context.parsed.y;
                                        return `${context.dataset.label}: ${valor.toFixed(3)} TWh`;
                                    }
                                }
                            },
                            legend: {
                                display: true,
                                position: 'bottom'
                            }
                        },
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                            x: { stacked: true, title: { display: true, text: 'Year' } },
                            y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Energy Consumption (TWh)' } }
                        }
                    }
                });
            }
        });
    }

    cargarYGraficar("World");

    entitySelect.addEventListener("change", (e) => {
        cargarYGraficar(e.target.value);
    });
});

