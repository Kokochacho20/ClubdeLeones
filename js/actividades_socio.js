const API_BASE = '../api';

const socioSelect = document.getElementById('socio');
const formFiltro = document.getElementById('form-filtro-actividades-socio');
const tbodyActividadesSocio = document.getElementById('tbody-actividades-socio');

const resumenSocioNombre = document.getElementById('resumen-socio-nombre');
const resumenTotalActiv = document.getElementById('resumen-total-activ');
const resumenTotalMonto = document.getElementById('resumen-total-monto');
const resumenTotalSaldo = document.getElementById('resumen-total-saldo');

function formatearFecha(isoString) {
  if (!isoString) return '';
  return isoString.substring(0, 10);
}

function traducirEstado(codigo) {
  switch (codigo) {
    case 'R': return 'Registrado';
    case 'P': return 'En proceso';
    case 'C': return 'Cancelado';
    default:  return codigo || '';
  }
}

async function cargarSocios() {
  try {
    const res = await fetch(`${API_BASE}/socios.php`);
    if (!res.ok) throw new Error('Error al cargar socios');

    const socios = await res.json();
    socioSelect.innerHTML = '<option value="">Seleccione un socio</option>';

    socios.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.ID_SOCIO;
      opt.textContent = s.NOMBRE_SOCIO;
      socioSelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los socios');
  }
}

async function buscarActividades(e) {
  if (e) e.preventDefault();

  const idSocio = socioSelect.value;
  const desde = document.getElementById('desde').value;
  const hasta = document.getElementById('hasta').value;

  const params = new URLSearchParams();
  if (idSocio) params.append('id_socio', idSocio);
  if (desde)  params.append('desde', desde);
  if (hasta)  params.append('hasta', hasta);

  try {
    const res = await fetch(`${API_BASE}/actividades_socio.php?` + params.toString());
    if (!res.ok) throw new Error('Error al cargar actividades por socio');

    const registros = await res.json();
    tbodyActividadesSocio.innerHTML = '';

    if (!registros.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" class="text-center">No hay registros para los filtros seleccionados</td>';
      tbodyActividadesSocio.appendChild(tr);

      resumenSocioNombre.textContent =
        idSocio ? socioSelect.options[socioSelect.selectedIndex].text : '-';
      resumenTotalActiv.textContent = '0';
      resumenTotalMonto.textContent = '0.00';
      resumenTotalSaldo.textContent = '0.00';
      return;
    }

    let totalActiv = 0;
    let totalMonto = 0;
    let totalSaldo = 0;

    registros.forEach(r => {
      totalActiv++;
      const monto = Number(r.MONTO_COMPROM) || 0;
      const saldo = Number(r.SALDO_COMPROM) || 0;
      totalMonto += monto;
      totalSaldo += saldo;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatearFecha(r.FEC_COMPROM)}</td>
        <td>${r.NOMBRE_ACTIVIDAD}</td>
        <td>${r.NOMBRE_SOCIO}</td>
        <td>${traducirEstado(r.ESTADO)}</td>
        <td class="text-end">${monto.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</td>
        <td class="text-end">${saldo.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</td>
      `;
      tbodyActividadesSocio.appendChild(tr);
    });

    resumenSocioNombre.textContent =
      idSocio ? socioSelect.options[socioSelect.selectedIndex].text : 'Varios socios';
    resumenTotalActiv.textContent = totalActiv.toString();
    resumenTotalMonto.textContent = totalMonto.toLocaleString('es-CR', { minimumFractionDigits: 2 });
    resumenTotalSaldo.textContent = totalSaldo.toLocaleString('es-CR', { minimumFractionDigits: 2 });

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!formFiltro || !tbodyActividadesSocio) return;
  cargarSocios();
  buscarActividades();
  formFiltro.addEventListener('submit', buscarActividades);
});