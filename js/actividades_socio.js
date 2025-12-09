const API_ACTIVIDADES_SOCIO = "../api/actividades_socio.php";
const API_SOCIOS_AS = "../api/RegistroDeSocios.php";

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