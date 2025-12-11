const API_REPORTE_SOCIOS = "../api/reporte_socios.php";

function textoTipoSocio(codigo) {
    if (codigo === "R") return "Regular";
    if (codigo === "H") return "Honorario";
    if (codigo === "V") return "Vitalicio";
    return codigo || "";
}

function textoEstadoSocio(codigo) {
    if (codigo === "A") return "Activo";
    if (codigo === "I") return "Inactivo";
    if (codigo === "N") return "Suspendido";
    return codigo || "";
}

async function cargarReporte() {
    const tbody = document.getElementById("tbody-socios");
    const tipo = document.getElementById("tipo_socio_filtro").value;
    const estado = document.getElementById("estado_socio_filtro").value;
    const fechaDesde = document.getElementById("fecha_ingreso_desde").value;

    const params = new URLSearchParams();
    if (tipo) params.append("tipo", tipo);
    if (estado) params.append("estado", estado);
    if (fechaDesde) params.append("fecha_desde", fechaDesde);

    try {
        const res = await fetch(`${API_REPORTE_SOCIOS}?${params.toString()}`);
        const raw = await res.text();
        console.log("reporte_socios.php RAW:", raw);

        let socios;
        try {
            socios = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de reporte_socios:", e);
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">Error en el servidor al generar el reporte</td></tr>`;
            return;
        }

        if (!Array.isArray(socios)) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">Respuesta inesperada del servidor</td></tr>`;
            return;
        }

        tbody.innerHTML = "";

        if (socios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">No se encontraron socios con los filtros seleccionados</td></tr>`;
            return;
        }

        socios.forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${s.ID_SOCIO}</td>
        <td>${s.NOMBRE_SOCIO}</td>
        <td>${s.NUMERO_SOCIO}</td>
        <td>${textoTipoSocio(s.TIPO_SOCIO)}</td>
        <td>${textoEstadoSocio(s.ESTADO_SOCIO)}</td>
        <td>${s.FEC_INGRESO}</td>
        <td>${s.COD_DISTRITO}</td>
        <td>${s.DESC_DIRECCION}</td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">No se pudo generar el reporte</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-filtros");
    const btnLimpiar = document.getElementById("btn-limpiar");

    form.addEventListener("submit", e => {
        e.preventDefault();
        cargarReporte();
    });

    btnLimpiar.addEventListener("click", () => {
        document.getElementById("tipo_socio_filtro").value = "";
        document.getElementById("estado_socio_filtro").value = "";
        document.getElementById("fecha_ingreso_desde").value = "";
        cargarReporte();
    });

    cargarReporte();
});