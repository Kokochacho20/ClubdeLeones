const API_BASE = '../api';

document.addEventListener('DOMContentLoaded', function () {
    const formSocio = document.getElementById('form-socio');
    const tbodySocios = document.getElementById('tbody-socios');

    const btnGuardar = formSocio.querySelector('button[type="submit"]');
    const btnNuevo = document.getElementById('btn-nuevo');
    const btnEliminar = document.getElementById('btn-eliminar');

    const idSocio = document.getElementById('id_socio');
    const nombreSocio = document.getElementById('nombre_socio');
    const fechaNac = document.getElementById('fecha_nacimiento');
    const fechaIngreso = document.getElementById('fecha_ingreso');
    const numeroSocio = document.getElementById('numero_socio');
    const codDistrito = document.getElementById('cod_distrito');
    const descDireccion = document.getElementById('desc_direccion');
    const telefono1 = document.getElementById('telefono1');
    const telefono2 = document.getElementById('telefono2');
    const tipoSocio = document.getElementById('tipo_socio');
    const estadoSocio = document.getElementById('estado_socio');

    let socios = [];

    // helper json seguro
    async function leerJSON(res, ctx) {
        const txt = await res.text();
        if (txt === '') return null;
        try {
            return JSON.parse(txt);
        } catch (e) {
            console.error('RAW (' + ctx + '):', txt);
            throw new Error('El servidor no devolvio JSON valido');
        }
    }

    function textoTipo(c) {
        switch (c) {
            case 'R': return 'Regular';
            case 'C': return 'Cachorro';
            case 'H': return 'Honorario';
            case 'B': return 'Benefactor';
            case 'L': return 'Leo';
            default: return c || '';
        }
    }

    function textoEstado(c) {
        switch (c) {
            case 'A': return 'Activo';
            case 'I': return 'Inactivo';
            case 'N': return 'No pertenece';
            default: return c || '';
        }
    }

    // init
    cargarDistritos();
    cargarSocios();
    configurarEventos();
    actualizarEstadoBotones();

    function configurarEventos() {
        formSocio.addEventListener('submit', function (e) {
            e.preventDefault();
            guardarSocio();
        });

        btnNuevo.addEventListener('click', function () {
            limpiarFormulario();
            actualizarEstadoBotones();
            formSocio.scrollIntoView({ behavior: 'smooth' });
        });

        btnEliminar.addEventListener('click', function () {
            if (!idSocio.value) return;
            if (confirm('Seguro que desea eliminar este socio?')) {
                eliminarSocio(idSocio.value);
            }
        });

        tbodySocios.addEventListener('click', function (e) {
            const tr = e.target.closest('tr');
            if (!tr) return;
            const id = tr.getAttribute('data-id');
            if (!id) return;
            editarSocio(id);
        });
    }

    async function cargarSocios() {
        try {
            const res = await fetch(`${API_BASE}/socios.php`);
            const data = await leerJSON(res, 'cargarSocios');

            if (!res.ok) throw new Error((data && data.error) || 'Error al cargar socios');

            socios = Array.isArray(data) ? data : [];
            mostrarSocios(socios);
        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al cargar socios', 'danger');
        }
    }

    function mostrarSocios(lista) {
        tbodySocios.innerHTML = '';
        lista.forEach(s => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', s.ID_SOCIO || s.id_socio);

            const id = s.ID_SOCIO || s.id_socio || '';
            const nom = s.NOMBRE_SOCIO || s.nombre_socio || '';
            const tel1 = s.TELEFONO1 || s.telefono1 || '';
            const tipo = s.TIPO_SOCIO || s.tipo_socio || '';
            const est = s.ESTADO_SOCIO || s.estado_socio || '';
            const dist = s.NOMBRE_DISTRITO || s.nombre_distrito || '';
            const cant = s.NOMBRE_CANTON || s.nombre_canton || '';
            const prov = s.NOMBRE_PROVINCIA || s.nombre_provincia || '';

            tr.innerHTML = `
                <td>${id}</td>
                <td>${nom}</td>
                <td>${tel1}</td>
                <td>${tipo} - ${textoTipo(tipo)}</td>
                <td>${est} - ${textoEstado(est)}</td>
                <td>${dist}${cant || prov ? ' / ' : ''}${cant}${prov ? ' / ' + prov : ''}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning me-2" onclick="editarSocio(${id})">Editar</button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarSocio(${id})">Eliminar</button>
                </td>
            `;
            tbodySocios.appendChild(tr);
        });
    }

    function cargarSocioEnFormulario(s) {
        idSocio.value = s.ID_SOCIO || s.id_socio || '';
        nombreSocio.value = s.NOMBRE_SOCIO || s.nombre_socio || '';
        fechaNac.value = s.FECHA_NACIMIENTO || s.fecha_nacimiento || '';
        fechaIngreso.value = s.FECHA_INGRESO || s.fecha_ingreso || '';
        numeroSocio.value = s.NUMERO_SOCIO || s.numero_socio || '';
        codDistrito.value = s.COD_DISTRITO || s.cod_distrito || '';
        descDireccion.value = s.DESC_DIRECCION || s.desc_direccion || '';
        telefono1.value = s.TELEFONO1 || s.telefono1 || '';
        telefono2.value = s.TELEFONO2 || s.telefono2 || '';
        tipoSocio.value = s.TIPO_SOCIO || s.tipo_socio || '';
        estadoSocio.value = s.ESTADO_SOCIO || s.estado_socio || '';
    }

    function limpiarFormulario() {
        formSocio.reset();
        idSocio.value = '';
    }

    async function guardarSocio() {
        const payload = {
            nombre_socio: nombreSocio.value.trim(),
            fecha_nacimiento: fechaNac.value || null,
            fecha_ingreso: fechaIngreso.value,
            numero_socio: numeroSocio.value ? Number(numeroSocio.value) : null,
            cod_distrito: codDistrito.value ? Number(codDistrito.value) : null,
            desc_direccion: descDireccion.value.trim() || null,
            telefono1: telefono1.value ? Number(telefono1.value) : null,
            telefono2: telefono2.value ? Number(telefono2.value) : null,
            tipo_socio: tipoSocio.value,
            estado_socio: estadoSocio.value
        };

        if (!payload.nombre_socio || !payload.fecha_ingreso || !payload.numero_socio || !payload.telefono1 || !payload.tipo_socio || !payload.estado_socio) {
            mostrarAlerta('Complete los campos obligatorios (*)', 'warning');
            return;
        }

        try {
            const esEdicion = !!idSocio.value;
            const url = esEdicion
                ? `${API_BASE}/socios.php?id=${idSocio.value}`
                : `${API_BASE}/socios.php`;
            const method = esEdicion ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await leerJSON(res, 'guardarSocio');

            if (!res.ok || (data && data.ok === false)) {
                const msg = data && data.error;
                throw new Error(msg || 'Error al guardar socio');
            }

            mostrarAlerta(`Socio ${esEdicion ? 'actualizado' : 'creado'} correctamente`, 'success');
            limpiarFormulario();
            await cargarSocios();
            actualizarEstadoBotones();
        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al guardar socio', 'danger');
        }
    }

    async function eliminarSocio(id) {
        if (!id) return;
        if (!confirm('Seguro que desea eliminar este socio?')) return;

        try {
            const res = await fetch(`${API_BASE}/socios.php?id=${id}`, { method: 'DELETE' });
            let data = null;
            if (res.status !== 204) data = await leerJSON(res, 'eliminarSocio');

            if (!res.ok) {
                const msg = data && data.error;
                throw new Error(msg || 'Error al eliminar socio');
            }

            mostrarAlerta('Socio eliminado correctamente', 'success');
            if (String(id) === idSocio.value) {
                limpiarFormulario();
                actualizarEstadoBotones();
            }
            await cargarSocios();
        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'Error al eliminar socio', 'danger');
        }
    }

    async function cargarDistritos() {
        try {
            const res = await fetch(`${API_BASE}/distritos.php`);
            const data = await leerJSON(res, 'cargarDistritos');
            if (!res.ok) throw new Error('Error al cargar distritos');

            codDistrito.innerHTML = '<option value="">Seleccione...</option>';
            (data || []).forEach(d => {
                const val = d.COD_DISTRITO || d.id_distrito;
                const dist = d.NOMBRE_DISTRITO || d.nombre_distrito || '';
                const cant = d.NOMBRE_CANTON || d.nombre_canton || '';
                if (!val) return;
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = dist + (cant ? ' - ' + cant : '');
                codDistrito.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            mostrarAlerta('Error al cargar distritos', 'danger');
        }
    }

    function actualizarEstadoBotones() {
        const tieneId = !!idSocio.value;
        btnGuardar.textContent = tieneId ? 'Actualizar' : 'Guardar';
        btnEliminar.disabled = !tieneId;
    }

    function mostrarAlerta(msg, tipo) {
        const anterior = document.querySelector('.alert');
        if (anterior) anterior.remove();

        const div = document.createElement('div');
        div.className = `alert alert-${tipo} alert-dismissible fade show mt-3`;
        div.role = 'alert';
        div.innerHTML = `
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('main');
        container.insertBefore(div, container.firstChild);

        setTimeout(() => {
            if (div.parentNode === container) div.remove();
        }, 5000);
    }

    // globales
    window.editarSocio = async function (id) {
        try {
            const res = await fetch(`${API_BASE}/socios.php?id=${id}`);
            const data = await leerJSON(res, 'detalleSocio');
            if (!res.ok) throw new Error((data && data.error) || 'Error al obtener socio');

            cargarSocioEnFormulario(data || {});
            actualizarEstadoBotones();
            formSocio.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            mostrarAlerta(err.message || 'No se pudo cargar el socio', 'danger');
        }
    };

    window.eliminarSocio = eliminarSocio;
});
