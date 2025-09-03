document.addEventListener('DOMContentLoaded', () => {
  const deptSelect = document.getElementById('departamento');
  const citySelect = document.getElementById('ciudad');

  // Variable para guardar datos HSP
  let HSP_DATA = null;

  // Función para normalizar textos (evita problemas con acentos/mayúsculas)
  function norm(str) {
    return (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Función para obtener HSP por ciudad o departamento
  function getHSP(departamento, ciudad) {
    if (!HSP_DATA) return 5.0; // valor promedio nacional por defecto
    const c = norm(ciudad);
    const d = norm(departamento);
    if (HSP_DATA.ciudades[c]) return HSP_DATA.ciudades[c];
    if (HSP_DATA.departamentos[d]) return HSP_DATA.departamentos[d];
    return HSP_DATA.nacional;
  }

  // Cargar JSON de ciudades
  fetch('Colombia/colombia-json-master/colombia.json')
    .then(res => res.json())
    .then(data => {
      data.forEach(dep => {
        const opt = document.createElement('option');
        opt.value = dep.departamento;
        opt.textContent = dep.departamento;
        deptSelect.appendChild(opt);
      });

      deptSelect.addEventListener('change', () => {
        citySelect.innerHTML = '<option value="">-- Selecciona una ciudad --</option>';
        const selectedDept = data.find(dep => dep.departamento === deptSelect.value);
        if (selectedDept) {
          selectedDept.ciudades.forEach(ciudad => {
            const opt = document.createElement('option');
            opt.value = ciudad;
            opt.textContent = ciudad;
            citySelect.appendChild(opt);
          });
        }
      });
    })
    .catch(err => console.error('Error cargando JSON de ciudades:', err));

  // Cargar JSON de radiación HSP
  fetch('Colombia/colombia-json-master/hsp_colombia.json')
    .then(res => res.json())
    .then(data => {
      HSP_DATA = data;
      console.log("Datos HSP cargados correctamente");
    })
    .catch(err => console.error('Error cargando JSON HSP:', err));

  // Función para capturar y calcular
window.capturarDatos = function() {
  const nombre = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const consumo = parseFloat(document.getElementById('consumo').value);
  const costoFactura = parseFloat(document.getElementById('costo').value);
  const departamento = document.getElementById('departamento').value;
  const ciudad = document.getElementById('ciudad').value;
  const terminos = document.getElementById('terms').checked;

  if (!nombre || !email || !telefono || !consumo || !costoFactura || !departamento || !ciudad || !terminos) {
    alert("Por favor, complete todos los campos y acepte los términos.");
    return;
  }

  const hsp = getHSP(departamento, ciudad);

  // Parámetros
  const potenciaPanelKw = 0.35;
  const capacidadBateriaKwh = 5;
  const costoPorPanel = 900000;
  const costoPorBateria = 6000000;
  const fraccionNocturna = 0.30;

  const kwhPorPanelMes = potenciaPanelKw * hsp * 30;

  // Cálculos
  const consumoDiario = consumo / 30;
  const consumoNocturno = consumoDiario * fraccionNocturna;
  const bateriasNecesarias = Math.max(1, Math.ceil(consumoNocturno / capacidadBateriaKwh));
  const panelesNecesarios = Math.max(1, Math.ceil(consumo / kwhPorPanelMes));
  const costoTotal = (panelesNecesarios * costoPorPanel) + (bateriasNecesarias * costoPorBateria);
  const retornoInversionMeses = costoFactura > 0 ? Math.ceil(costoTotal / costoFactura) : Infinity;

  // Ocultar formulario
  const formulario = document.getElementById('solarForm');
  formulario.style.display = 'none'; // Escondemos el formulario, no lo eliminamos

  // Crear resultado dentro de .box
  const contenedor = document.querySelector('.box');
  const resultadoDiv = document.createElement('div');
  resultadoDiv.id = 'resultadoCalculo';
  resultadoDiv.classList.add('resultado', 'fade-in');
  resultadoDiv.innerHTML = `
    <h2>Resultado de tu cálculo, ${nombre}</h2>
    <p><strong>Ciudad:</strong> ${ciudad} (${departamento})</p>
    <p><strong>Consumo mensual:</strong> ${consumo} kWh</p>
    <p><strong>Costo última factura:</strong> $${costoFactura.toLocaleString('es-CO')}</p>
    <hr>
    <h3>Parámetros usados:</h3>
    <ul>
      <li>Producción por panel: ${kwhPorPanelMes.toFixed(1)} kWh/mes</li>
      <li>Capacidad por batería: ${capacidadBateriaKwh} kWh</li>
      <li>Fracción nocturna: ${(fraccionNocturna * 100)}%</li>
      <li>Radiación solar (HSP): ${hsp}</li>
      <li>Precio por panel: $${costoPorPanel.toLocaleString('es-CO')}</li>
      <li>Precio por batería: $${costoPorBateria.toLocaleString('es-CO')}</li>
    </ul>
    <hr>
    <h3>Resultados estimados:</h3>
    <p><strong>Paneles necesarios:</strong> ${panelesNecesarios}</p>
    <p><strong>Baterías necesarias:</strong> ${bateriasNecesarias}</p>
    <p><strong>Costo estimado total:</strong> $${costoTotal.toLocaleString('es-CO')}</p>
    <p><strong>Retorno de inversión:</strong> ${isFinite(retornoInversionMeses) ? retornoInversionMeses + ' meses' : 'N/A'}</p>
    <hr>  
<button type="button" onclick="location.reload()">Volver a calcular</button>
  `;
  contenedor.appendChild(resultadoDiv);

  // Usamos setTimeout para asegurarnos de que el botón esté completamente renderizado
  setTimeout(function() {
    const volverBtn = document.getElementById('volverBtn');
    
    // Asegurarnos de que el botón esté visible y interactivo
    volverBtn.style.zIndex = '10'; // Aseguramos que esté encima de otros elementos
    volverBtn.addEventListener('click', function() {
      // Volver a mostrar el formulario y ocultar el resultado
      formulario.style.display = 'block'; // Muestra el formulario
      resultadoDiv.style.display = 'none'; // Oculta los resultados
    });
  }, 100); // Retraso de 100ms para garantizar que el DOM se haya actualizado
}




  // Función para volver a calcular
  window.volverAcalcular = function() {
    // Volver a mostrar el formulario
    document.getElementById('solarForm').style.display = 'block';
    
    // Eliminar resultado
    document.getElementById('resultadoCalculo').remove();
  }
}


)
;
