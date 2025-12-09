const API_LOGIN = '../api/login.php';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const toggle = document.getElementById('togglePassword');
  const pwd = document.getElementById('password');
  const user = document.getElementById('username');

  if (!form || !pwd || !toggle || !user) {
    return;
  }

  toggle.addEventListener('click', () => {
    if (pwd.type === 'password') {
      pwd.type = 'text';
      toggle.textContent = '🙈';
      toggle.title = 'Ocultar contraseña';
    } else {
      pwd.type = 'password';
      toggle.textContent = '👁️';
      toggle.title = 'Mostrar contraseña';
    }
  });

  form.addEventListener('submit', async ev => {
    ev.preventDefault();

    const usuario = user.value.trim();
    const password = pwd.value.trim();

    if (!usuario || !password) {
      form.classList.add('was-validated');
      return;
    }

    try {
      const res = await fetch(API_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

      const data = await res.json();

      if (data.ok) {
        window.location.href = 'menu_socio.html';
      } else {
        alert(data.mensaje || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      alert('No se pudo validar el usuario en este momento');
    }
  });
});