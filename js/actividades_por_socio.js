const API_BASE = '../api';
const API_ACTIV_SOC = `${API_BASE}/actividades_por_socio.php`;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formActividadesSocio');
    const inputId = document.getElementById('id_activ_soc');
    const selectSocio = document.getElementById('id_socio');
    const selectActividad = document.getElementById('id_actividad');
    const inputFecha = document.getElementById('fec_comprom');
    const selectEstado = document.getElementById('estado');
    const inputMonto = document.getElementById('monto_comprom');
    const inputSaldo = document.getElementById('saldo_comprom');
    const tbody = document.getElementById('tbodyActividadesSocio');
    const btnGuardar = document.getElementById('btnGuardar');

    let cacheRegistros = [];

    function formatearMonto(valor) {
        const num = Number(valor) || 0;
        return num.toLocaleString('es-CR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function textoEstado(code) {
        switch (code) {
            case 'R': return 'Registrado';
            case 'P': return 'En proceso';
            case 'C': return 'Cancelado';
            default: return code || '';
        }
    }

    async function cargarSocios() {
        try {
            const res = await fetch(`${API_BASE}/actividades_por_socio.php?socios=1`);
            const data = await res.json();

            selectSocio.innerHTML = '<option value="">Seleccione un socio…</option>';

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
            alert('Error al cargar socios');
        }
    }


    async function cargarActividades() {
        try {
            const res = await fetch(`${API_BASE}/actividades_por_socio.php?actividades=1`);
            const data = await res.json();

            selectActividad.innerHTML = '<option value="">Seleccione una actividad…</option>';

            (data || []).forEach(a => {
                const id = a.ID_ACTIVIDAD || a.id_actividad;
                const nombre = a.NOMBRE_ACTIVIDAD || a.nombre_actividad;
                if (!id) return;
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = `${id} - ${nombre}`;
                selectActividad.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            alert('Error al cargar actividades');
        }
    }


    async function cargarListado() {
        try {
            const res = await fetch(API_ACTIV_SOC);
            const data = await res.json();
            cacheRegistros = data || [];
            pintarTabla();
        } catch (err) {
            console.error(err);
            alert('Error al cargar actividades por socio');
        }
    }

    function pintarTabla() {
        tbody.innerHTML = '';

        if (!cacheRegistros.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 8;
            td.className = 'text-center text-muted';
            td.textContent = 'No hay registros de actividades por socio.';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        cacheRegistros.forEach(r => {
            const id = r.ID_ACTIV_SOC || r.id_activ_soc;
            const idSocio = r.ID_SOCIO || r.id_socio;
            const nomSocio = r.NOMBRE_SOCIO || r.nombre_socio;
            const idAct = r.ID_ACTIVIDAD || r.id_actividad;
            const nomAct = r.NOMBRE_ACTIVIDAD || r.nombre_actividad;
            const fecha = r.FEC_COMPROM || r.fec_comprom || '';
            const estado = r.ESTADO || r.estado || '';
            const monto = r.MONTO_COMPROM || r.monto_comprom || 0;
            const saldo = r.SALDO_COMPROM || r.saldo_comprom || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${id}</td>
        <td>${idSocio} - ${nomSocio}</td>
        <td>${idAct} - ${nomAct}</td>
        <td>${fecha}</td>
        <td>${textoEstado(estado)}</td>
        <td class="text-end">₡${formatearMonto(monto)}</td>
        <td class="text-end">₡${formatearMonto(saldo)}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" data-id="${id}" data-accion="editar">Editar</button>
          <button class="btn btn-sm btn-danger" data-id="${id}" data-accion="eliminar">Eliminar</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    }

    function limpiarFormulario() {
        inputId.value = '';
        form.reset();
        selectEstado.value = 'R';
        btnGuardar.textContent = 'Guardar';
    }

    async function guardar(e) {
        e.preventDefault();

        const id = inputId.value;
        const id_socio = selectSocio.value;
        const id_actividad = selectActividad.value;
        const fec_comprom = inputFecha.value;
        const estado = selectEstado.value;
        const monto_comprom = inputMonto.value;
        const saldo_comprom = inputSaldo.value;

        if (!id_socio || !id_actividad || !fec_comprom || monto_comprom === '' || saldo_comprom === '') {
            alert('Complete todos los campos obligatorios');
            return;
        }

        const fd = new FormData();
        fd.append('id_socio', id_socio);
        fd.append('id_actividad', id_actividad);
        fd.append('fec_comprom', fec_comprom);
        fd.append('estado', estado);
        fd.append('monto_comprom', monto_comprom);
        fd.append('saldo_comprom', saldo_comprom);

        if (id) {
            fd.append('accion', 'actualizar');
            fd.append('id_activ_soc', id);
        } else {
            fd.append('accion', 'crear');
        }

        try {
            const res = await fetch(API_ACTIV_SOC, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();

            if (!data.ok) {
                throw new Error(data.mensaje || 'Error al guardar');
            }

            alert(data.mensaje);
            limpiarFormulario();
            cargarListado();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    async function manejarAccionTabla(e) {
        const btn = e.target.closest('button[data-accion]');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        const accion = btn.getAttribute('data-accion');

        const registro = cacheRegistros.find(r => (r.ID_ACTIV_SOC || r.id_activ_soc) == id);
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }

        if (accion === 'editar') {
            inputId.value = registro.ID_ACTIV_SOC || registro.id_activ_soc;
            selectSocio.value = registro.ID_SOCIO || registro.id_socio;
            selectActividad.value = registro.ID_ACTIVIDAD || registro.id_actividad;
            inputFecha.value = registro.FEC_COMPROM || registro.fec_comprom || '';
            selectEstado.value = registro.ESTADO || registro.estado || 'R';
            inputMonto.value = registro.MONTO_COMPROM || registro.monto_comprom || 0;
            inputSaldo.value = registro.SALDO_COMPROM || registro.saldo_comprom || 0;

            btnGuardar.textContent = 'Actualizar';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (accion === 'eliminar') {
            if (!confirm('¿Desea eliminar este registro de actividad por socio?')) return;

            const fd = new FormData();
            fd.append('accion', 'eliminar');
            fd.append('id_activ_soc', id);

            try {
                const res = await fetch(API_ACTIV_SOC, {
                    method: 'POST',
                    body: fd
                });
                const data = await res.json();

                if (!data.ok) {
                    throw new Error(data.mensaje || 'Error al eliminar');
                }

                alert(data.mensaje);
                cargarListado();
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }
    }

    form.addEventListener('submit', guardar);
    tbody.addEventListener('click', manejarAccionTabla);

    cargarSocios();
    cargarActividades();
    cargarListado();
});
