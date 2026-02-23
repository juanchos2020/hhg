document.addEventListener("DOMContentLoaded", function () {

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let ventasDia = JSON.parse(localStorage.getItem("ventasDia")) || [];
let totalCaja = parseFloat(localStorage.getItem("totalCaja")) || 0;
let carrito = [];

/* ---------- PESTAÑAS ---------- */
function mostrarPestana(id) {
    document.querySelectorAll(".contenido").forEach(div => {
        div.classList.add("oculto");
    });
    document.getElementById(id).classList.remove("oculto");
}
window.mostrarPestana = mostrarPestana;

/* ---------- GUARDAR ---------- */
function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("ventasDia", JSON.stringify(ventasDia));
    localStorage.setItem("totalCaja", totalCaja);
}

/* ---------- AGREGAR PRODUCTO (ID MANUAL) ---------- */
function agregarProducto() {
    let id = parseInt(document.getElementById("idProducto").value);
    let nombre = document.getElementById("nombre").value.trim();
    let precio = parseFloat(document.getElementById("precio").value);
    let stock = parseInt(document.getElementById("stock").value);

    if (!id || !nombre || precio <= 0 || stock <= 0) {
        alert("Datos inválidos");
        return;
    }

    // Validar ID repetido
    let idExiste = productos.find(p => p.id === id);
    if (idExiste) {
        alert("Ese ID ya existe");
        return;
    }

    productos.push({ id, nombre, precio, stock });

    guardarDatos();
    actualizarInventario();
    actualizarSelect();

    document.getElementById("idProducto").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
}
window.agregarProducto = agregarProducto;

/* ---------- INVENTARIO ---------- */
function actualizarInventario() {
    let tabla = document.querySelector("#tablaInventario tbody");
    tabla.innerHTML = "";

    productos.forEach((p, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td><input type="number" value="${p.precio}" onchange="editarPrecio(${index}, this.value)"></td>
                <td><input type="number" value="${p.stock}" onchange="editarStock(${index}, this.value)"></td>
            </tr>
        `;
    });
}

function buscarProductoInventario() {
    let idBuscado = parseInt(document.getElementById("buscarIdInventario").value);
    let producto = productos.find(p => p.id === idBuscado);

    if (!producto) {
        alert("Producto no encontrado");
        return;
    }

    let tabla = document.querySelector("#tablaInventario tbody");
    let index = productos.indexOf(producto);

    tabla.innerHTML = `
        <tr>
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td><input type="number" value="${producto.precio}" onchange="editarPrecio(${index}, this.value)"></td>
            <td><input type="number" value="${producto.stock}" onchange="editarStock(${index}, this.value)"></td>
        </tr>
    `;
}
window.buscarProductoInventario = buscarProductoInventario;

function editarPrecio(i, nuevo) {
    productos[i].precio = parseFloat(nuevo) || 0;
    guardarDatos();
}
window.editarPrecio = editarPrecio;

function editarStock(i, nuevo) {
    productos[i].stock = parseInt(nuevo) || 0;
    guardarDatos();
}
window.editarStock = editarStock;

function borrarInventario() {
    productos = [];
    guardarDatos();
    actualizarInventario();
    actualizarSelect();
}
window.borrarInventario = borrarInventario;

/* ---------- SELECT ---------- */
function actualizarSelect() {
    let select = document.getElementById("productoSelect");
    select.innerHTML = "";
    productos.forEach((p, i) => {
        select.innerHTML += `<option value="${i}">${p.nombre} (ID: ${p.id})</option>`;
    });
}

/* ---------- BUSCAR EN CAJA ---------- */
function buscarProductoCaja() {
    let idBuscado = parseInt(document.getElementById("buscarIdCaja").value);
    let producto = productos.find(p => p.id === idBuscado);

    if (!producto) {
        alert("Producto no encontrado");
        return;
    }

    let index = productos.indexOf(producto);
    document.getElementById("productoSelect").value = index;
}
window.buscarProductoCaja = buscarProductoCaja;

/* ---------- CARRITO ---------- */
function agregarAlCarrito() {
    let index = document.getElementById("productoSelect").value;
    let cantidad = parseInt(document.getElementById("cantidad").value);

    if (!cantidad || cantidad <= 0) return;

    let producto = productos[index];

    if (!producto || producto.stock < cantidad) {
        alert("Stock insuficiente");
        return;
    }

    carrito.push({
        index,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad
    });

    actualizarCarrito();
    document.getElementById("cantidad").value = "";
}
window.agregarAlCarrito = agregarAlCarrito;

function actualizarCarrito() {
    let tbody = document.querySelector("#tablaCarrito tbody");
    tbody.innerHTML = "";
    let total = 0;

    carrito.forEach((item, i) => {
        let subtotal = item.precio * item.cantidad;
        total += subtotal;

        tbody.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${subtotal}</td>
                <td><button onclick="carrito.splice(${i},1);actualizarCarrito()">X</button></td>
            </tr>
        `;
    });

    document.getElementById("totalCompra").textContent = total;
}

/* ---------- CONFIRMAR VENTA ---------- */
function confirmarVenta() {
    if (carrito.length === 0) return;

    let totalVenta = 0;

    carrito.forEach(item => {
        totalVenta += item.precio * item.cantidad;
        productos[item.index].stock -= item.cantidad;
    });

    ventasDia.push({
        fecha: new Date().toLocaleString(),
        productos: [...carrito],
        total: totalVenta
    });

    totalCaja += totalVenta;

    carrito = [];
    actualizarCarrito();
    actualizarInventario();
    actualizarVentas();
    guardarDatos();

    document.getElementById("totalCaja").textContent = totalCaja;
}
window.confirmarVenta = confirmarVenta;

/* ---------- VENTAS ---------- */
function actualizarVentas() {
    let tbody = document.querySelector("#tablaVentas tbody");
    tbody.innerHTML = "";

    ventasDia.forEach((venta, index) => {
        tbody.innerHTML += `
            <tr>
                <td><button onclick="imprimirVenta(${index})" class="btn-verde">Imprimir</button></td>
                <td>${venta.fecha}</td>
                <td>${venta.productos.map(p => `${p.nombre} x${p.cantidad}`).join("<br>")}</td>
                <td>$${venta.total}</td>
            </tr>
        `;
    });
}

function imprimirVenta(index) {
    let venta = ventasDia[index];
    let ventana = window.open('', '', 'width=600,height=600');

    ventana.document.write(`
        <h2>FACTURA</h2>
        <p><strong>Fecha:</strong> ${venta.fecha}</p>
        <hr>
        ${venta.productos.map(p => `<p>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</p>`).join("")}
        <hr>
        <h3>Total: $${venta.total}</h3>
    `);

    ventana.document.close();
    ventana.print();
}
window.imprimirVenta = imprimirVenta;

/* ---------- CERRAR DIA ---------- */
function cerrarDia() {
    totalCaja = 0;
    ventasDia = [];
    guardarDatos();
    actualizarVentas();
    document.getElementById("totalCaja").textContent = totalCaja;
}
window.cerrarDia = cerrarDia;

/* ---------- INICIO ---------- */
actualizarInventario();
actualizarSelect();
actualizarVentas();
document.getElementById("totalCaja").textContent = totalCaja;

});