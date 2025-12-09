const API_ACTIVIDADES = "../api/RegistroDeActividades.php";

async function cargarActividades() {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const data = await res.json();

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
            tabla.innerHTML += `
                <tr>
                    <td>${a.ID_ACTIVIDAD}</td>
                    <td>${a.NOMBRE_ACTIVIDAD}</td>
                    <td>${a.ID_TIPO_ACTIVIDAD}</td>
                    <td>${a.FEC_ACTIVIDAD}</td>
                    <td>${a.ID_SOCIO_RESP}</td>
                    <td>${a.OBJETIVO}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarActividad(${a.ID_ACTIVIDAD})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarActividad(${a.ID_ACTIVIDAD})">Eliminar</button>
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
        const actividades = await res.json();

        const a = Array.isArray(actividades)
            ? actividades.find(x => x.ID_ACTIVIDAD == id)
            : null;

        if (!a) {
            alert("Actividad no encontrada");
            return;
        }

        document.getElementById("id_actividad").value = a.ID_ACTIVIDAD;
        document.getElementById("nombre_actividad").value = a.NOMBRE_ACTIVIDAD;
        document.getElementById("id_tipo_actividad").value = a.ID_TIPO_ACTIVIDAD;
        document.getElementById("fec_actividad").value = a.FEC_ACTIVIDAD;
        document.getElementById("id_socio_responsable").value = a.ID_SOCIO_RESP;
        document.getElementById("objetivo_actividad").value = a.OBJETIVO;

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
        id_actividad: document.getElementById("id_actividad").value,
        nombre_actividad: document.getElementById("nombre_actividad").value.trim(),
        id_tipo_actividad: document.getElementById("id_tipo_actividad").value,
        fec_actividad: document.getElementById("fec_actividad").value,
        id_socio_resp: document.getElementById("id_socio_responsable").value,
        objetivo_actividad: document.getElementById("objetivo_actividad").value.trim()
    };
}

function limpiarFormulario() {
    const form = document.getElementById("formActividad");
    if (form) form.reset();
    const id = document.getElementById("id_actividad");
    if (id) id.value = "";
}

document.addEventListener("DOMContentLoaded", cargarActividades);