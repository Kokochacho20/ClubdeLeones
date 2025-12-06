const API_PAGO = "http://localhost/ClubdeLeones/api/TiposDePago.php";

async function cargarTiposPago() {
  const res = await fetch(API_PAGO);
  const json = await res.json();

  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  json.data.forEach(tp => {
    tbody.innerHTML += `
      <tr>
        <td>${tp.ID_TIPO_PAGO}</td>
        <td>${tp.NOMBRE_TIPO}</td>
        <td>${tp.DESCRIPCION ?? ""}</td>
        <td><button class="btn btn-warning btn-sm" onclick="editar(${tp.ID_TIPO_PAGO})">Editar</button></td>
      </tr>
    `;
  });
}
