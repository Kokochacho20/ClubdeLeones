const API_ACTIVIDADES     = "../api/RegistroDeActividades.php";
const API_TIPOS_ACTIVIDAD = "../api/tipo_actividad.php";
const API_SOCIOS          = "../api/socios.php";

async function cargarTiposActividad() {
    const select = document.getElementById("id_tipo_actividad");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione...</option>';

    try {
        const res = await fetch(API_TIPOS_ACTIVIDAD);
        const raw = await res.text();
        console.log("tipo_actividad.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de tipo_actividad:", e);
            return;
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Sin tipos de actividad o formato inesperado:", data);
            return;
        }

        data.forEach(t => {
            const id =
                t.ID_TIP_ACTIVIDAD   || t.id_tip_actividad   ||
                t.ID_TIPO_ACTIVIDAD  || t.id_tipo_actividad;

            const nombre =
                t.NOMBRE_TIP_ACTIVIDAD   || t.nombre_tip_actividad ||
                t.NOMBRE_TIPO_ACTIVIDAD  || t.nombre_tipo_actividad;

            if (!id || !nombre) {
                console.warn("Registro tipo_actividad sin campos esperados:", t);
                return;
            }

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = nombre;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando tipos de actividad:", err);
    }
}

async function cargarSocios() {
    const select = document.getElementById("id_socio_responsable");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione un socio...</option>';

    try {
        const res = await fetch(API_SOCIOS);
        const raw = await res.text();
        console.log("socios.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de socios:", e);
            return;
        }
        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Sin socios o formato inesperado:", data);
            return;
        }

        data.forEach(s => {
            const id =
                s.ID_SOCIO || s.id_socio;

            const nombre =
                s.NOMBRE_SOCIO || s.nombre_socio;

            if (!id || !nombre) {
                console.warn("Registro socio sin campos esperados:", s);
                return;
            }

            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = nombre;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando socios:", err);
    }
}

async function cargarActividades() {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const raw = await res.text();
        console.log("RegistroDeActividades.php RAW:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON de actividades:", e);
            data = [];
        }

        if (data && Array.isArray(data.data)) {
            data = data.data;
        }

        const tabla = document.getElementById("tablaActividades");
        if (!tabla) return;

        tabla.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay actividades registradas</td>
                </tr>
            `;
            return;
        }

        data.forEach(a => {
            const id      = a.ID_ACTIVIDAD      || a.id_actividad;
            const nombre  = a.NOMBRE_ACTIVIDAD  || a.nombre_actividad;
            const tipo    = a.ID_TIPO_ACTIVIDAD || a.id_tipo_actividad;
            const fecha   = a.FEC_ACTIVIDAD     || a.fec_actividad;
            const socio   = a.ID_SOCIO_RESP     || a.id_socio_resp;
            const objetivo= a.OBJETIVO_ACTIVIDAD || a.OBJETIVO || a.objetivo_actividad;

            tabla.innerHTML += `
                <tr>
                    <td>${id ?? ""}</td>
                    <td>${nombre ?? ""}</td>
                    <td>${tipo ?? ""}</td>
                    <td>${fecha ?? ""}</td>
                    <td>${socio ?? ""}</td>
                    <td>${objetivo ?? ""}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarActividad(${id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarActividad(${id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error cargando actividades:", error);
        const tabla = document.getElementById("tablaActividades");
        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No se pudieron cargar las actividades</td>
                </tr>
            `;
        }
    }
}

async function registrarActividad() {
    const actividad = obtenerDatosFormulario();

    if (!actividad.nombre_actividad || !actividad.fec_actividad || !actividad.id_tipo_actividad) {
        alert("Debe completar al menos nombre, fecha y tipo de actividad.");
        return;
    }

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actividad)
        });

        const data = await res.json();
        alert(data.mensaje || "Actividad registrada correctamente");
        cargarActividades();
        limpiarFormulario();

    } catch (error) {
        console.error("Error registrando actividad:", error);
        alert("Ocurrió un error registrando la actividad");
    }
}

async function editarActividad(id) {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const raw = await res.text();

        let actividades;
        try {
            actividades = JSON.parse(raw);
        } catch (e) {
            console.error("No se pudo parsear JSON al editar actividad:", e);
            alert("No se pudo cargar la actividad seleccionada");
            return;
        }

        if (actividades && Array.isArray(actividades.data)) {
            actividades = actividades.data;
        }

        const a = Array.isArray(actividades)
            ? actividades.find(x => (x.ID_ACTIVIDAD || x.id_actividad) == id)
            : null;

        if (!a) {
            alert("Actividad no encontrada");
            return;
        }

        document.getElementById("id_actividad").value        = a.ID_ACTIVIDAD     || a.id_actividad;
        document.getElementById("nombre_actividad").value     = a.NOMBRE_ACTIVIDAD || a.nombre_actividad || "";
        document.getElementById("id_tipo_actividad").value    = a.ID_TIPO_ACTIVIDAD|| a.id_tipo_actividad || "";
        document.getElementById("fec_actividad").value        = (a.FEC_ACTIVIDAD   || a.fec_actividad || "").substring(0,10);
        document.getElementById("id_socio_responsable").value = a.ID_SOCIO_RESP    || a.id_socio_resp || "";
        document.getElementById("objetivo_actividad").value   = a.OBJETIVO_ACTIVIDAD || a.OBJETIVO || a.objetivo_actividad || "";

    } catch (error) {
        console.error("Error cargando actividad:", error);
        alert("No se pudo cargar la actividad seleccionada");
    }
}

async function actualizarActividad() {
    const actividad = obtenerDatosFormulario();

    if (!actividad.id_actividad) {
        alert("Debe seleccionar una actividad primero");
        return;
    }

    if (!actividad.nombre_actividad || !actividad.fec_actividad || !actividad.id_tipo_actividad) {
        alert("Debe completar al menos nombre, fecha y tipo de actividad.");
        return;
    }

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actividad)
        });

        const data = await res.json();
        alert(data.mensaje || "Actividad actualizada correctamente");
        cargarActividades();
        limpiarFormulario();

    } catch (error) {
        console.error("Error actualizando actividad:", error);
        alert("Ocurrió un error actualizando la actividad");
    }
}

async function eliminarActividad(id) {
    if (!confirm("¿Seguro que desea eliminar esta actividad?")) return;

    try {
        const res = await fetch(API_ACTIVIDADES, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_actividad: id })
        });

        const data = await res.json();
        alert(data.mensaje || "Actividad eliminada correctamente");
        cargarActividades();

    } catch (error) {
        console.error("Error eliminando actividad:", error);
        alert("Ocurrió un error eliminando la actividad");
    }
}

function obtenerDatosFormulario() {
    return {
        id_actividad:       document.getElementById("id_actividad").value,
        nombre_actividad:   document.getElementById("nombre_actividad").value.trim(),
        id_tipo_actividad:  document.getElementById("id_tipo_actividad").value,
        fec_actividad:      document.getElementById("fec_actividad").value,
        id_socio_resp:      document.getElementById("id_socio_responsable").value,
        objetivo_actividad: document.getElementById("objetivo_actividad").value.trim()
    };
}

function limpiarFormulario() {
    const form = document.getElementById("formActividad");
    if (form) form.reset();
    const id = document.getElementById("id_actividad");
    if (id) id.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarTiposActividad();
    cargarSocios();
    cargarActividades();
});