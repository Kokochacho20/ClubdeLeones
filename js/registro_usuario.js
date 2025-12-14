const API_REGISTRO = '../api/crear_usuario.php';

document.addEventListener('DOMContentLoaded', () => {
  const formRegistro = document.getElementById('formRegistro');
  const regNombre = document.getElementById('regNombre');
  const regCorreo = document.getElementById('regCorreo');
  const regTelefono = document.getElementById('regTelefono');
  const regClave = document.getElementById('regClave');
  const regClave2 = document.getElementById('regClave2');

  if (!formRegistro) return;

  formRegistro.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const nombre = regNombre.value.trim();
    const correo = regCorreo.value.trim();
    const telefono = regTelefono.value.trim();
    const clave = regClave.value.trim();
    const clave2 = regClave2.value.trim();

    if (!nombre || !correo || !clave || !clave2) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    if (nombre.length > 100) {
      alert('El nombre no puede superar los 100 caracteres');
      return;
    }

    if (correo.length > 150) {
      alert('El correo no puede superar los 150 caracteres');
      return;
    }

    if (telefono && telefono.length > 20) {
      alert('El teléfono no puede superar los 20 caracteres');
      return;
    }

    if (clave.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (clave.length > 72) {
      alert('La contraseña es demasiado larga');
      return;
    }

    if (clave !== clave2) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch(API_REGISTRO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, clave, telefono })
      });

      const raw = await res.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error('Respuesta no JSON del servidor:', raw);
        alert('El servidor devolvió un error (no JSON). Revise consola y el archivo crear_usuario.php.');
        return;
      }

      if (data.ok) {
        alert('Usuario creado correctamente. Ahora puede iniciar sesión.');
        window.location.href = 'login.html';
      } else {
        alert(data.mensaje || 'No se pudo crear el usuario');
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear el usuario');
    }
  });
});