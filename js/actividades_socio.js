const API_ACTIVIDADES_SOCIO = "../api/actividades_socio.php";
const API_SOCIOS_AS = "../api/RegistroDeSocios.php";

<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const formFiltro = document.getElementById('form-filtro-actividades-socio');
    const selectSocio = document.getElementById('socio');
    const inputDesde = document.getElementById('desde');
    const inputHasta = document.getElementById('hasta');
    const tbody = document.getElementById('tbody-actividades-socio');

    const lblNomSocio = document.getElementById('resumen-socio-nombre');
    const lblTotActiv = document.getElementById('resumen-total-activ');
    const lblTotMonto = document.getElementById('resumen-total-monto');
    const lblTotSaldo = document.getElementById('resumen-total-saldo');

    async function leerJSON(res, ctx) {
        const txt = await res.text();
        if (txt === '') return null;
        try {
            return JSON.parse(txt);
        } catch (e) {
            console.error('RAW (' + ctx + '):', txt);
            throw new Error('El servidor no devolvió JSON válido');
        }
    }

    function mostrarAlerta(msg, tipo = 'danger') {
        const anterior = document.querySelector('.alert');
        if (anterior) anterior.remove();

        const div = document.createElement('div');
        div.className = `alert alert-${tipo} alert-dismissible fade show mt-3`;
        div.role = 'alert';
        div.innerHTML = `
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('main .container, main') || document.querySelector('main');
        container.insertBefore(div, container.firstChild);

        setTimeout(() => {
            if (div.parentNode === container) div.remove();
        }, 5000);
    }

    function textoEstado(code) {
        switch (code) {
            case 'R': return 'Registrado';
            case 'C': return 'Cancelado';
            case 'P': return 'En proceso';
            default: return code || '';
        }
    }

    function formatearMonto(valor) {
        const num = Number(valor) || 0;
        return num.toLocaleString('es-CR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    async function cargarSocios() {
        try {
            const res = await fetch(`${API_BASE}/actividades_socio.php?socios=1`);
            const data = await leerJSON(res, 'cargarSocios');

            if (!res.ok) {
                throw new Error((data && data.error) || 'Error al cargar socios');
            }

            selectSocio.innerHTML = '<option value="">Seleccione un socio</option>';

            (data || []).forEach(s => {
                const id = s.ID_SOCIO || s.id_socio;
                const nombre = s.NOMBRE_SOCIO || s.nombre_socio;
                if (!id) return;
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = `${id} - ${nombre}`;
                selectSocio.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            mostrarAlerta('No se pudieron cargar los socios', 'danger');
        }
    }

    async function cargarActividades() {
        const idSocio = selectSocio.value;
        const desde = inputDesde.value;
        const hasta = inputHasta.value;

        if (desde && hasta && desde > hasta) {
            mostrarAlerta('La fecha "Desde" no puede ser mayor que "Hasta"', 'warning');
            return;
        }

        const params = new URLSearchParams();
        if (idSocio) params.append('id_socio', idSocio);
        if (desde) params.append('desde', desde);
        if (hasta) params.append('hasta', hasta);

        const url = `${API_BASE}/actividades_socio.php?${params.toString()}`;

        try {
            const res = await fetch(url);
            const data = await leerJSON(res, 'cargarActividades');

            if (!res.ok) {
                throw new Error((data && data.error) || 'Error al consultar actividades');
            }

            const lista = Array.isArray(data) ? data : [];
            mostrarResultados(lista);
            actualizarResumen(lista);
        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al consultar actividades', 'danger');
        }
    }

    function mostrarResultados(lista) {
        tbody.innerHTML = '';

        if (!lista.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.className = 'text-center text-muted';
            td.textContent = 'No se encontraron registros para los filtros seleccionados.';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        lista.forEach(r => {
            const fecha = r.FEC_COMPROM || r.fec_comprom || '';
            const activ = r.NOMBRE_ACTIVIDAD || r.nombre_actividad || '';
            const socio = r.NOMBRE_SOCIO || r.nombre_socio || '';
            const estado = r.ESTADO || r.estado || '';
            const monto = r.MONTO_COMPROM || r.monto_comprom || 0;
            const saldo = r.SALDO_COMPROM || r.saldo_comprom || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${fecha}</td>
                <td>${activ}</td>
                <td>${socio}</td>
                <td>${estado} - ${textoEstado(estado)}</td>
                <td class="text-end">${formatearMonto(monto)}</td>
                <td class="text-end">${formatearMonto(saldo)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function actualizarResumen(lista) {
        const totalActiv = lista.length;
        let totalMonto = 0;
        let totalSaldo = 0;

        lista.forEach(r => {
            totalMonto += Number(r.MONTO_COMPROM || r.monto_comprom || 0);
            totalSaldo += Number(r.SALDO_COMPROM || r.saldo_comprom || 0);
        });

        const optSel = selectSocio.options[selectSocio.selectedIndex];
        lblNomSocio.textContent = optSel && optSel.value
            ? optSel.textContent
            : '-';

        lblTotActiv.textContent = totalActiv;
        lblTotMonto.textContent = formatearMonto(totalMonto);
        lblTotSaldo.textContent = formatearMonto(totalSaldo);
    }

    formFiltro.addEventListener('submit', (e) => {
        e.preventDefault();
        cargarActividades();
    });

    cargarSocios();
});
=======
async function cargarSociosAS() {
    const select = document.getElementById("id_socio");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione un socio...</option>';

    try {
        const res = await fetch(API_SOCIOS_AS);
        const data = await res.json();

        const lista = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];

        lista.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s.ID_SOCIO || s.id_socio || "";
            opt.textContent = s.NOMBRE_SOCIO || s.nombre_socio || "";
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Error cargando socios:", err);
    }
}

async function consultarActividadesSocio(ev) {
    ev.preventDefault();

    const form = document.getElementById("formActividadesSocio");
    const socioSelect = document.getElementById("id_socio");
    const desde = document.getElementById("desde").value;
    const hasta = document.getElementById("hasta").value;

    if (!socioSelect.value) {
        form.classList.add("was-validated");
        return;
    }

    const idSocio = socioSelect.value;

    const params = new URLSearchParams();
    params.append("id_socio", idSocio);
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    try {
        const res = await fetch(`${API_ACTIVIDADES_SOCIO}?${params.toString()}`);
        const data = await res.json();

        const tbody = document.getElementById("tablaActividadesSocio");
        tbody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay actividades registradas para este socio en el rango seleccionado</td>
                </tr>
            `;
            actualizarResumenAS(socioSelect, 0, 0, 0);
            return;
        }

        let totalActiv = 0;
        let totalComprometido = 0;
        let totalSaldo = 0;

        data.forEach(a => {
            const monto = Number(a.MONTO_COMPROM || a.monto_comprom || 0);
            const saldo = Number(a.SALDO_COMPROM || a.saldo_comprom || 0);

            totalActiv += 1;
            totalComprometido += monto;
            totalSaldo += saldo;

            tbody.innerHTML += `
                <tr>
                    <td>${a.NOMBRE_ACTIVIDAD || a.nombre_actividad || ""}</td>
                    <td>${a.FEC_COMPROM || a.fec_comprom || ""}</td>
                    <td>${a.ESTADO || a.estado || ""}</td>
                    <td>${monto.toLocaleString("es-CR")}</td>
                    <td>${saldo.toLocaleString("es-CR")}</td>
                </tr>
            `;
        });

        actualizarResumenAS(socioSelect, totalActiv, totalComprometido, totalSaldo);
    } catch (err) {
        console.error("Error consultando actividades por socio:", err);
        const tbody = document.getElementById("tablaActividadesSocio");
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No se pudieron cargar las actividades</td>
            </tr>
        `;
        actualizarResumenAS(socioSelect, 0, 0, 0);
    }
}

function actualizarResumenAS(socioSelect, totalActiv, totalComprometido, totalSaldo) {
    const nombreSocio = socioSelect.options[socioSelect.selectedIndex]
        ? socioSelect.options[socioSelect.selectedIndex].textContent
        : "N/A";

    document.getElementById("resumenNombreSocio").textContent = nombreSocio || "N/A";
    document.getElementById("resumenTotalActividades").textContent = totalActiv;
    document.getElementById("resumenTotalComprometido").textContent = totalComprometido.toLocaleString("es-CR");
    document.getElementById("resumenTotalSaldo").textContent = totalSaldo.toLocaleString("es-CR");
}

document.addEventListener("DOMContentLoaded", () => {
    cargarSociosAS();
    const form = document.getElementById("formActividadesSocio");
    if (form) form.addEventListener("submit", consultarActividadesSocio);
});
>>>>>>> 0cdb12f8f8e6abaef975cb7ff6abbcd84de93ea4
