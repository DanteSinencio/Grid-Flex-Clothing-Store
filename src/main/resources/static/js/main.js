// ==========================================
// 1. CONTROLADOR DE PRODUCTOS 
// ==========================================
class ProductosController {
    constructor(currentId = 0) {
        this.items = [];
        this.currentId = currentId;
    }

    addItem(name, img, description, precio, categoria, talla, stock) {
        const producto = {
            id: String(this.currentId++),
            name: name,
            img: img,
            description: description,
            nombre: name,
            imagen: img,
            descripcion: description,
            precio: precio,
            categoria: categoria.toLowerCase(),
            talla: talla,
            stock: stock
        };
        this.items.push(producto);
    }

    loadItemsFromLocalStorage() {
        const storageItems = localStorage.getItem("gridFlex_productos");
        if (storageItems) {
            this.items = JSON.parse(storageItems);
            if (this.items.length > 0) {
                this.currentId = Math.max(...this.items.map(item => parseInt(item.id) || 0)) + 1;
            }
        }
    }
}

const gestorProductos = new ProductosController();
gestorProductos.loadItemsFromLocalStorage();

// Metemos tus 6 productos para que la memoria no esté vacía
if (gestorProductos.items.length === 0) {
    gestorProductos.addItem('Camisa Slim Fit', '../static/img/playeraLose.jpg', 'Seminueva', 299, 'camisas', 'M', 10);
    gestorProductos.addItem('Chamarra Mezclilla', '../static/img/chamarraMezclilla.jpg', 'Nueva', 450, 'chamarras', 'G', 5);
    gestorProductos.addItem('Camisa con rayas', '../static/img/camisaRayas.jpg', 'Seminueva', 350, 'camisas', 'M', 12);
    gestorProductos.addItem('Chamarra Deportiva', '../static/img/chamarraDeportiva.jpg', 'Nueva', 350, 'chamarras', 'G', 5);
    gestorProductos.addItem('Chamarra Popover', '../static/img/chamarraPopover.jpg', 'Nueva', 330, 'chamarras', 'M', 8);
    gestorProductos.addItem('Gorra', '../static/img/gorra.jpg', 'Nueva', 180, 'accesorios', 'CH', 20);

    localStorage.setItem("gridFlex_productos", JSON.stringify(gestorProductos.items));
}


function addItemCard(producto) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    const col = document.createElement('div');
    col.className = 'col-md-4 producto';

    const imgHTML = producto.imagen 
        ? `<img src="${producto.imagen}" class="img-fluid rounded" style="height: 250px; width: 100%; object-fit: cover;">`
        : `<div class="bg-secondary text-white d-flex justify-content-center align-items-center rounded mb-2" style="height: 250px; width: 100%;">Sin imagen</div>`;

    col.innerHTML = `
        <div class="card p-3 h-100 shadow-sm border-0" data-categoria="${producto.categoria}" data-talla="${producto.talla}">
            ${imgHTML}
            <h6 class="mt-3 fw-bold">${producto.nombre}</h6>
            <small class="text-muted">${producto.categoria} | Talla: ${producto.talla}</small>
            <p class="fs-5 mt-2 mb-3">$${producto.precio}</p>
            <button class="btn btn-outline-dark btn-sm mt-auto w-100 btn-agregar-carrito" data-id="${producto.id}">
                <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
            </button>
        </div>
    `;
    contenedor.appendChild(col);
}


// 1. MÓDULO DE CONTACTO (Formspree)
const formContacto = document.getElementById('contactForm');
const toastContactoEl = document.getElementById('toastContacto');
const msjContacto = document.getElementById('toastContactoMensaje');
const btnEnviar = document.getElementById("btnEnviar");

if (formContacto && toastContactoEl && btnEnviar) {
    const toastContacto = new bootstrap.Toast(toastContactoEl);
    
    formContacto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validación de Bootstrap
        if (!formContacto.checkValidity()) {
            e.stopPropagation();
            formContacto.classList.add('was-validated');
            return; 
        }

        const data = new FormData(formContacto);
        const originalText = btnEnviar.innerHTML;
        
        // Estado de carga
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

        try {
            const response = await fetch(formContacto.action, {
                method: formContacto.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                msjContacto.innerHTML = `<i class="fa-solid fa-circle-check me-2 text-success"></i> ¡Mensaje enviado con éxito! Nos contactaremos pronto.`;
                formContacto.reset();
                formContacto.classList.remove('was-validated');
            } else {
                msjContacto.innerHTML = `<i class="fa-solid fa-circle-exclamation me-2 text-danger"></i> Error al enviar. Revisa la configuración.`;
            }
        } catch (error) {
            msjContacto.innerHTML = `<i class="fa-solid fa-circle-exclamation me-2 text-danger"></i> Error de conexión a internet.`;
        } finally {
            btnEnviar.innerHTML = originalText;
            toastContacto.show(); // Mostramos el Toast de contacto
        }
    });

    // ACTIVAR / DESACTIVAR BOTÓN
    formContacto.addEventListener("input", function() {
        formContacto.classList.add('was-validated'); // Agrega clase para mostrar validación

        if (formContacto.checkValidity()) {
            btnEnviar.disabled = false;
        } else {
            btnEnviar.disabled = true;
        }

    });

    // Estado inicial
    btnEnviar.disabled = true;
}


// 2. MÓDULO DE SUSCRIPCIÓN FOOTER 
const formSuscripcion = document.getElementById('suscripcion');
const toastSuscripcionEl = document.getElementById('toastSuscripcion');

if (formSuscripcion && toastSuscripcionEl) {
    const toastSuscripcion = new bootstrap.Toast(toastSuscripcionEl);
    
    formSuscripcion.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue
        
        // Validación de Bootstrap
        if (!formSuscripcion.checkValidity()) {
            e.stopPropagation();
            formSuscripcion.classList.add('was-validated');
            return; 
        }

        // Solo es de muestra
        toastSuscripcion.show(); // Mostramos el Toast específico de suscripción
        formSuscripcion.reset();
        formSuscripcion.classList.remove('was-validated');
    });
}
    
// =============================
// 2. CATÁLOGO Y FILTROS
// =============================

document.addEventListener("DOMContentLoaded", () => {

  const categorias = document.querySelectorAll(".filtro-cat");
  const estados = document.querySelectorAll(".filtro-estado");
  const tallas = document.querySelectorAll(".filtro-talla");

  const precioRange = document.getElementById("precioRange");
  const precioValor = document.getElementById("precioValor");

  const btnFiltro = document.getElementById("btnFiltro");
  const panelFiltro = document.getElementById("panelFiltro");
  const cerrarFiltro = document.getElementById("cerrarFiltro");
  const overlay = document.getElementById("overlay");

  const verTodo = document.getElementById("verTodo");
  const contenedorProductos = document.getElementById('contenedor-productos');
  const contadorBadge = document.getElementById('contador-productos'); 

  let tallaSeleccionada = null;

  if (btnFiltro && panelFiltro) {
    btnFiltro.addEventListener("click", () => {
      panelFiltro.classList.add("active");
      overlay.classList.add("active");
    });

    cerrarFiltro.addEventListener("click", cerrarTodo);
    overlay.addEventListener("click", cerrarTodo);

    function cerrarTodo() {
      panelFiltro.classList.remove("active");
      overlay.classList.remove("active");
    }
  }

  if (verTodo) {
    verTodo.addEventListener("change", () => {
      if (verTodo.checked) {
        categorias.forEach(c => { if (c !== verTodo) c.checked = false; });
        estados.forEach(e => e.checked = false);
        tallaSeleccionada = null;
        tallas.forEach(b => b.classList.remove("active"));
        if(precioRange) {
            precioRange.value = 600;
            precioValor.textContent = "$600";
        }
        filtrar();
      }
    });
  }

  if (precioRange) {
    precioRange.addEventListener("input", () => {
      precioValor.textContent = "$" + precioRange.value;
      if(verTodo) verTodo.checked = false;
      filtrar();
    });
  }

  tallas.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        tallaSeleccionada = null;
      } else {
        tallas.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        tallaSeleccionada = btn.dataset.talla;
      }
      if(verTodo) verTodo.checked = false;
      filtrar();
    });
  });

  [...categorias, ...estados].forEach(input => {
    input.addEventListener("change", () => {
      if (input !== verTodo && verTodo) verTodo.checked = false;
      filtrar();
    });
  });

  function filtrar() {
    if (!contenedorProductos || typeof gestorProductos === 'undefined') return;

    const cats = [...categorias].filter(c => c.checked && c.value !== "todo").map(c => c.value.toLowerCase());
    const ests = [...estados].filter(e => e.checked).map(e => e.value.toLowerCase());
    const precioMax = precioRange ? parseInt(precioRange.value) : 600;

    const productosFiltrados = gestorProductos.items.filter(producto => {
      let visible = true;
      if (cats.length > 0 && !cats.includes(producto.categoria.toLowerCase())) visible = false;
      if (tallaSeleccionada && producto.talla !== tallaSeleccionada) visible = false;
      if (producto.precio > precioMax) visible = false;
      return visible;
    });

    contenedorProductos.innerHTML = '';

    if (productosFiltrados.length > 0) {
        productosFiltrados.forEach(producto => {
            addItemCard(producto);
        });
    } else {
        contenedorProductos.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-magnifying-glass fa-2x text-muted mb-3"></i>
                <h6 class="text-muted">No encontramos prendas con esos filtros.</h6>
            </div>`;
    }

    if (contadorBadge) contadorBadge.textContent = productosFiltrados.length;
  }

  // ¡ESTA LÍNEA ES LA MAGIA QUE PINTA LOS 6 PRODUCTOS AL ABRIR LA PÁGINA!
  filtrar(); 

});
// ==========================================
// 6. GESTIÓN DE PRODUCTOS Y ADMINISTRADOR (LOCALSTORAGE)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    const formAgregarProducto = document.getElementById('formAgregarProducto'); 
    const tablaBody = document.getElementById('tablaProductosBody');
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    const btnGuardar = document.getElementById('btnGuardar');
    const inputImagen = document.getElementById('imagenProducto');
    
    const modalEliminarHTML = document.getElementById('modalConfirmarEliminar');
    const btnBorrarDefinitivo = document.getElementById('btnBorrarDefinitivo');
    const contadorEliminar = document.getElementById('contadorEliminar'); 
    const toastEliminarEl = document.getElementById('toastEliminar');
    const toastAgregarAg = document.getElementById('toastAgregar');

    let inventarioProductos = JSON.parse(localStorage.getItem('gridFlex_productos')) || [];
    let imagenBase64Temporal = ""; // Aquí guardaremos la imagen convertida a texto

    //Convertimos la imagen para que se guarde en el LocalStorage (FILE READER)
    if (inputImagen) {
        inputImagen.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagenBase64Temporal = event.target.result; // Se guarda el texto Base64
                };
                reader.readAsDataURL(archivo);
            }
        });
    }

    //FUNCIÓN PARA PINTAR LA TABLA
    function renderizarTabla() {
        if (!tablaBody) return; 
        
        tablaBody.innerHTML = ''; 
        
        inventarioProductos.forEach((producto) => {
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', producto.id);
            
            // Si el producto tiene imagen, la mostramos, si no, mostramos el cuadro gris
            const imagenHTML = producto.imagen 
                ? `<img src="${producto.imagen}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">`
                : `<div class="bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 6px; font-size: 10px;">IMG</div>`;

            fila.innerHTML = `
                <td><input type="checkbox" class="form-check-input producto-check" value="${producto.id}"></td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>$${producto.precio}</td>
                <td>${producto.talla}</td>
                <td>${producto.stock}</td>
                <td><span class="badge bg-primary">Local</span></td>
                <td>${imagenHTML}</td>
            `;
            tablaBody.appendChild(fila);
        });
        
        if(btnEliminar) btnEliminar.disabled = true;
        if(btnEditar) btnEditar.disabled = true;
    }

    //LÓGICA DE AGREGAR O ACTUALIZAR PRODUCTO
    if (formAgregarProducto) {
        formAgregarProducto.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!formAgregarProducto.checkValidity()) {
                e.stopPropagation();
                formAgregarProducto.classList.add('was-validated');
                return;
            }

            // Revisamos si estamos editando un producto existente
            const idEdicion = formAgregarProducto.dataset.editandoId;

            if (idEdicion) {
                // MODO EDICIÓN
                const index = inventarioProductos.findIndex(p => p.id === idEdicion);
                if (index !== -1) {
                    inventarioProductos[index].nombre = document.getElementById('nombreProducto').value;
                    inventarioProductos[index].precio = document.getElementById('precioProducto').value;
                    inventarioProductos[index].categoria = document.getElementById('categoriaProducto').value;
                    inventarioProductos[index].talla = document.getElementById('tallaProducto').value;
                    inventarioProductos[index].stock = document.getElementById('stockProducto').value;
                    inventarioProductos[index].descripcion = document.getElementById('descripcionProducto').value;
                    
                    // Solo actualizamos la imagen si el usuario subió una nueva
                    if (imagenBase64Temporal !== "") {
                        inventarioProductos[index].imagen = imagenBase64Temporal;
                    }
                }
                
                // Limpiamos el modo edición
                delete formAgregarProducto.dataset.editandoId;
                if(btnGuardar) btnGuardar.textContent = 'Guardar';

            } else {
                // MODO CREACIÓN
                const nuevoProducto = {
                    id: Date.now().toString(),
                    nombre: document.getElementById('nombreProducto').value,
                    precio: document.getElementById('precioProducto').value,
                    categoria: document.getElementById('categoriaProducto').value,
                    talla: document.getElementById('tallaProducto').value,
                    stock: document.getElementById('stockProducto').value,
                    descripcion: document.getElementById('descripcionProducto').value,
                    imagen: imagenBase64Temporal // Guardamos el texto Base64
                };
                inventarioProductos.push(nuevoProducto);
            }

            // Guardamos, repintamos y limpiamos
            localStorage.setItem('gridFlex_productos', JSON.stringify(inventarioProductos));
            renderizarTabla();
            
            formAgregarProducto.reset();
            formAgregarProducto.classList.remove('was-validated');
            imagenBase64Temporal = ""; // Limpiamos la memoria de la imagen
        });

        // Evento para el botón Cancelar (limpiar modo edición)
        formAgregarProducto.addEventListener('reset', () => {
            delete formAgregarProducto.dataset.editandoId;
            if(btnGuardar) btnGuardar.textContent = 'Guardar';
            imagenBase64Temporal = "";
            formAgregarProducto.classList.remove('was-validated');
        });
    }

    // LÓGICA DE INTERACTIVIDAD Y ELIMINAR
    if (tablaBody && btnEliminar && modalEliminarHTML && toastEliminarEl) {
        const modalBootstrap = new bootstrap.Modal(modalEliminarHTML);
        const toastBootstrap = new bootstrap.Toast(toastEliminarEl);

        tablaBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('producto-check')) {
                const marcados = document.querySelectorAll('.producto-check:checked');
                btnEliminar.disabled = marcados.length === 0;
                if(btnEditar) btnEditar.disabled = marcados.length !== 1;
            }
        });

        btnEliminar.addEventListener('click', () => {
            const marcados = document.querySelectorAll('.producto-check:checked');
            if (contadorEliminar) contadorEliminar.textContent = marcados.length;
            modalBootstrap.show();
        });

        btnBorrarDefinitivo.addEventListener('click', () => {
            const marcados = document.querySelectorAll('.producto-check:checked');
            const cantidadBorrados = marcados.length; 
            
            marcados.forEach(checkbox => {
                inventarioProductos = inventarioProductos.filter(prod => prod.id !== checkbox.value);
            });

            localStorage.setItem('gridFlex_productos', JSON.stringify(inventarioProductos));
            modalBootstrap.hide();
            renderizarTabla();

            const toastBody = toastEliminarEl.querySelector('.toast-body');
            if (toastBody) {
                toastBody.innerHTML = `<i class="fa-solid fa-trash-can me-2 text-danger"></i> Se eliminaron <strong>${cantidadBorrados}</strong> producto(s) correctamente.`;
            }
            toastBootstrap.show();
        });
    }
    /*Alerta para cargar un articulo
    document.getElementById("formAgregarProducto").addEventListener("submit", function(e) {
    e.preventDefault(); // evita recarga

    // Aquí iría tu lógica de guardado (más adelante backend)

    // Mostrar toast
    const toastElemento = document.getElementById("toastAgregar");
    const toast = new bootstrap.Toast(toastElemento);
    toast.show();

    // Limpiar formulario
    this.reset();
    });
    */
    // MODO EDICIÓN: CARGAR DATOS AL FORMULARIO
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            const marcado = document.querySelector('.producto-check:checked');
            const id = marcado?.value;
            
            // Buscamos el producto en nuestro inventario
            const productoAEditar = inventarioProductos.find(p => p.id === id);
            
            if (productoAEditar) {
                // Llenamos el formulario con los datos
                document.getElementById('nombreProducto').value = productoAEditar.nombre;
                document.getElementById('precioProducto').value = productoAEditar.precio;
                document.getElementById('categoriaProducto').value = productoAEditar.categoria;
                document.getElementById('tallaProducto').value = productoAEditar.talla;
                document.getElementById('stockProducto').value = productoAEditar.stock;
                document.getElementById('descripcionProducto').value = productoAEditar.descripcion || "";
                
                // Le indicamos al formulario que estamos en MODO EDICIÓN
                formAgregarProducto.dataset.editandoId = productoAEditar.id;
                
                // Cambiamos el texto del botón visualmente
                if(btnGuardar) btnGuardar.textContent = 'Actualizar';
                
                // Hacemos scroll suave hacia el formulario para que el usuario lo vea
                formAgregarProducto.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Iniciar
    renderizarTabla();
});

// ==========================================
// 7. MÓDULO: CATÁLOGO DINÁMICO (LOCALSTORAGE)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contenedorProductos = document.getElementById('contenedor-productos');
    const contadorProductosVisibles = document.getElementById('contador-productos');

    if (contenedorProductos) {
        // Leemos el inventario
        const inventarioProductos = JSON.parse(localStorage.getItem('gridFlex_productos')) || [];

        // Limpiamos la zona
        contenedorProductos.innerHTML = '';

        // Actualizamos el contador de arriba
        if (contadorProductosVisibles) {
            contadorProductosVisibles.textContent = inventarioProductos.length;
        }

        // Si no hay nada, avisamos
        if (inventarioProductos.length === 0) {
            contenedorProductos.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Aún no hay productos.</h5>
                    <p class="text-muted small">Ve a la sección "Agregar producto" para empezar.</p>
                </div>`;
            return;
        }

        // TAREA 5 (Último paso): Iterar sobre el array del controlador y usar addItemCard
        gestorProductos.items.forEach(producto => {
            addItemCard(producto);
        });


        // Dibujamos cada producto guardado
        inventarioProductos.forEach(producto => {
            const col = document.createElement('div');
            col.className = 'col-md-4 producto'; // Clases exactas de tu diseño

            // Controlamos si hay imagen o no
            const imgHTML = producto.imagen 
                ? `<img src="${producto.imagen}" class="img-fluid rounded" style="height: 250px; width: 100%; object-fit: cover;">`
                : `<div class="bg-secondary text-white d-flex justify-content-center align-items-center rounded mb-2" style="height: 250px; width: 100%;">Sin imagen</div>`;

            // Estructura de tu tarjeta
            col.innerHTML = `
                <div class="card p-3 h-100 shadow-sm border-0" data-categoria="${producto.categoria}" data-talla="${producto.talla}">
                    ${imgHTML}
                    <h6 class="mt-3 fw-bold">${producto.nombre}</h6>
                    <small class="text-muted">${producto.categoria} | Talla: ${producto.talla}</small>
                    <p class="fs-5 mt-2 mb-3">$${producto.precio}</p>
                    <button class="btn btn-outline-dark btn-sm mt-auto w-100 btn-agregar-carrito" data-id="${producto.id}">
                        <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
                    </button>
                </div>
            `;
            contenedorProductos.appendChild(col);
        });
    }
});

// ==========================================
// FUNCIÓN: Mostrar notificación de producto añadido
// ==========================================
function mostrarNotificacionProducto(producto) {
    // Crear contenedor de la notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notification-cart-added';
    
    // Detectar si es mobile
    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
        notificacion.classList.add('mobile');
    }
    
    // Crear el HTML de la notificación
    notificacion.innerHTML = `
        <button class="notification-cart-close">&times;</button>
        <div class="notification-cart-success">
            <i class="fa-solid fa-check"></i>
        </div>
        <div class="notification-cart-content">
            <img src="${producto.imagen || '../static/img/default.jpg'}" alt="${producto.nombre}" class="notification-cart-img">
            <div class="notification-cart-details">
                <h6>${producto.nombre}</h6>
                <div class="detail-item">
                    <span class="detail-label">Color:</span> ${producto.categoria || 'N/A'}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Talla:</span> ${producto.talla || 'N/A'}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cantidad:</span> 1
                </div>
                <div class="notification-cart-price">$${producto.precio}</div>
            </div>
        </div>
    `;
    
    // Agregar a la página
    document.body.appendChild(notificacion);
    
    // Evento para cerrar manualmente
    const btnCerrar = notificacion.querySelector('.notification-cart-close');
    btnCerrar.addEventListener('click', () => {
        notificacion.classList.add('hide');
        setTimeout(() => {
            notificacion.remove();
        }, 400);
    });
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        notificacion.classList.add('hide');
        setTimeout(() => {
            notificacion.remove();
        }, 400);
    }, 4000);
}

// ==========================================
// 8. MÓDULO: CARRITO DE COMPRAS (GLOBAL Y CATÁLOGO)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // INICIALIZAR EL CARRITO (Otra base de datos local)
    let carrito = JSON.parse(localStorage.getItem('gridFlex_carrito')) || [];
    
    // Capturamos el numerito rojo del navbar en TODAS las páginas
    const badgeCarrito = document.querySelector('.cart-badge'); 

    // FUNCIÓN GLOBAL: Actualizar el numerito del navbar
    function actualizarBadge() {
        if (badgeCarrito) {
            // Sumamos la cantidad de todos los productos en el carrito
            const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
            
            badgeCarrito.textContent = totalItems;
            
            // Si el carrito está vacío, ocultamos el círculo rojo para que se vea más limpio
            badgeCarrito.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }

    // Ejecutamos al cargar cualquier página para que el navbar siempre esté actualizado
    actualizarBadge();

    // ---------------------------------------------------------
    // LÓGICA DE AGREGAR AL CARRITO (Solo ocurre en el Catálogo)
    // ---------------------------------------------------------
    const contenedorProductos = document.getElementById('contenedor-productos');

    if (contenedorProductos) {
        contenedorProductos.addEventListener('click', (e) => {
            
            const btnAgregar = e.target.closest('.btn-agregar-carrito');
            
            if (btnAgregar) {
                // Sacamos el ID que le guardamos en el atributo "data-id"
                const idProducto = btnAgregar.dataset.id;
                
                // Leemos el inventario original
                const inventario = JSON.parse(localStorage.getItem('gridFlex_productos')) || [];
                const productoAñadir = inventario.find(p => p.id === idProducto);
                
                if (productoAñadir) {
                    // Verificamos si este producto YA ESTÁ en el carrito
                    const indexEnCarrito = carrito.findIndex(item => item.id === idProducto);
                    
                    if (indexEnCarrito !== -1) {
                        // Si ya está, solo le sumamos 1 a la cantidad (para no tener filas repetidas)
                        carrito[indexEnCarrito].cantidad += 1;
                    } else {
                        // Si es nuevo, lo metemos al carrito con cantidad inicial de 1
                        carrito.push({ ...productoAñadir, cantidad: 1 });
                    }
                    
                    // Guardamos la nueva lista del carrito en la memoria del navegador
                    localStorage.setItem('gridFlex_carrito', JSON.stringify(carrito));
                    
                    // Actualizamos el numerito visual de arriba
                    actualizarBadge();
                    
                    // Mostrar notificación de producto añadido
                    mostrarNotificacionProducto(productoAñadir);
                    
                    const textoOriginal = btnAgregar.innerHTML;
                    btnAgregar.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
                    btnAgregar.classList.replace('btn-outline-dark', 'btn-success');
                    
                    setTimeout(() => {
                        btnAgregar.innerHTML = textoOriginal;
                        btnAgregar.classList.replace('btn-success', 'btn-outline-dark');
                    }, 1000);
                }
            }
        });
    }
});

/* =========================================
   EFECTO SPOTLIGHT REVEAL (EQUIPO VISION)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    const members = document.querySelectorAll('.member-container');
    
    members.forEach(member => {
        member.addEventListener('click', function() {
            
            members.forEach(m => {
                if (m !== this) m.classList.remove('active');
            });
            
            this.classList.toggle('active');
        });
    });
});

// ==========================================
// DELEGADOR GLOBAL: Agregar al carrito (Funciona en cualquier página)
// ==========================================
document.addEventListener('click', (e) => {
    const btnAgregar = e.target.closest('.btn-agregar-carrito');
    
    if (btnAgregar) {
        // Verificar si tiene data-id (productos del catálogo)
        const idProducto = btnAgregar.dataset.id;
        
        let productoAñadir = null;
        let idUnico = idProducto || Date.now().toString();
        
        if (idProducto) {
            // Caso 1: Producto del catálogo con data-id
            const inventario = JSON.parse(localStorage.getItem('gridFlex_productos')) || [];
            productoAñadir = inventario.find(p => p.id === idProducto);
        } else {
            // Caso 2: Producto del index con data-* attributes
            productoAñadir = {
                id: idUnico,
                nombre: btnAgregar.dataset.nombre || 'Producto',
                precio: btnAgregar.dataset.precio || 0,
                imagen: btnAgregar.dataset.imagen || '../static/img/default.jpg',
                categoria: btnAgregar.dataset.categoria || 'general',
                talla: btnAgregar.dataset.talla || 'M'
            };
        }
        
        if (productoAñadir) {
            // Leer el carrito actual
            let carrito = JSON.parse(localStorage.getItem('gridFlex_carrito')) || [];
            
            // Verificar si el producto ya está en el carrito
            const indexEnCarrito = carrito.findIndex(item => item.id === idUnico);
            
            if (indexEnCarrito !== -1) {
                carrito[indexEnCarrito].cantidad += 1;
            } else {
                carrito.push({ ...productoAñadir, cantidad: 1 });
            }
            
            // Guardar
            localStorage.setItem('gridFlex_carrito', JSON.stringify(carrito));
            
            // Actualizar el badge del navbar
            const badgeCarrito = document.querySelector('.cart-badge');
            if (badgeCarrito) {
                const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
                badgeCarrito.textContent = totalItems;
                badgeCarrito.style.display = totalItems > 0 ? 'inline-block' : 'none';
            }
            
            // Mostrar notificación
            mostrarNotificacionProducto(productoAñadir);
            
            // Feedback visual del botón
            const textoOriginal = btnAgregar.innerHTML;
            btnAgregar.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
            btnAgregar.classList.replace('btn-outline-dark', 'btn-success');
            btnAgregar.classList.replace('index-btn-blue', 'btn-success');
            
            setTimeout(() => {
                btnAgregar.innerHTML = textoOriginal;
                btnAgregar.classList.replace('btn-success', 'btn-outline-dark');
                if (!btnAgregar.classList.contains('btn-outline-dark')) {
                    btnAgregar.classList.add('index-btn-blue');
                }
            }, 1000);
        }
    }
}, true);

// ==========================================
// 9. MÓDULO: PÁGINA VISUAL DEL CARRITO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contenedorCarrito = document.getElementById('contenedor-carrito-items');
    const subtotalEl = document.getElementById('carrito-subtotal');
    const totalEl = document.getElementById('carrito-total');
    const btnCheckout = document.getElementById('btn-checkout');
    const contenedorResumenModal = document.getElementById('resumen-articulos-modal');

    if (contenedorCarrito) {
        function renderizarCarrito() {
            let carrito = JSON.parse(localStorage.getItem('gridFlex_carrito')) || [];
            contenedorCarrito.innerHTML = '';
            
            // Declaramos el subtotal 
            let subtotal = 0;

            if (carrito.length === 0) {
                contenedorCarrito.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="fa-solid fa-cart-arrow-down fa-3x mb-3"></i>
                        <h5>Tu carrito está vacío</h5>
                        <p>Agrega productos desde nuestro catálogo para verlos aquí.</p>
                        <a href="catalogo.html" class="btn btn-outline-dark mt-2">Ir al catálogo</a>
                    </div>`;
                if (subtotalEl) subtotalEl.textContent = '$0.00';
                if (totalEl) totalEl.textContent = '$0.00';
                
                // Limpiamos también el texto del envío si está vacío
                const envioEl = document.getElementById('carrito-envio');
                if (envioEl) {
                    envioEl.textContent = '$0.00';
                    envioEl.className = 'text-muted';
                }
                
                if (btnCheckout) btnCheckout.disabled = true;
                return;
            }

            if (btnCheckout) btnCheckout.disabled = false;

            carrito.forEach(producto => {
                // Sumamos usando la variable correcta "subtotal"
                subtotal += (Number(producto.precio) * producto.cantidad);
                
                const itemHTML = document.createElement('div');
                itemHTML.className = 'product-card d-flex align-items-center justify-content-between p-3 mb-3 bg-white shadow-sm rounded';
                const imagenSrc = producto.imagen ? producto.imagen : '../static/img/placeholder.jpg';

                itemHTML.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${imagenSrc}" alt="${producto.nombre}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        <div class="ms-3">
                            <h5 class="mb-0 fw-bold">${producto.nombre}</h5>
                            <p class="mb-0 text-muted small">Talla: <strong class="text-uppercase">${producto.talla}</strong></p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-4">
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary btn-disminuir" data-id="${producto.id}">-</button>
                            <div class="fw-bold px-2 py-1">${producto.cantidad}</div>
                            <button class="btn btn-sm btn-outline-secondary btn-aumentar" data-id="${producto.id}">+</button>
                        </div>
                        <div class="text-end" style="min-width: 80px;">
                            <div class="fw-bold fs-5">$${(producto.precio * producto.cantidad).toFixed(2)}</div>
                            <small class="text-danger btn-quitar" data-id="${producto.id}" style="cursor: pointer; font-weight: bold; letter-spacing: 1px;">QUITAR</small>
                        </div>
                    </div>
                `;
                contenedorCarrito.appendChild(itemHTML);
            });

            // ==========================================
            // LÓGICA DE NEGOCIO: COSTO DE ENVÍO
            // ==========================================
            let costoEnvio = 0;
            const envioEl = document.getElementById('carrito-envio');

            if (subtotal < 399) {
                costoEnvio = 99.00; // Tarifa plana si no llega al mínimo
                if (envioEl) {
                    envioEl.textContent = `$${costoEnvio.toFixed(2)}`;
                    envioEl.className = 'fw-bold text-dark'; // Texto oscuro normal
                }
            } else {
                costoEnvio = 0; // Envío Gratis
                if (envioEl) {
                    envioEl.textContent = 'GRATIS';
                    envioEl.className = 'text-success fw-bold'; // Texto verde
                }
            }

            // Calculamos el TOTAL FINAL
            let totalFinal = subtotal + costoEnvio;

            // Actualizamos la pantalla
            if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `$${totalFinal.toFixed(2)}`;
            
            const totalModal = document.querySelector('.text-total-modal');
            if (totalModal) totalModal.textContent = `$${totalFinal.toFixed(2)}`;
        }

        renderizarCarrito();

        // Lógica de clics: Quitar, Aumentar y Disminuir
        contenedorCarrito.addEventListener('click', (e) => {
            let carrito = JSON.parse(localStorage.getItem('gridFlex_carrito')) || [];
            const idProducto = e.target.getAttribute('data-id');

            if (!idProducto) return;

            const index = carrito.findIndex(item => item.id === idProducto);

            if (e.target.classList.contains('btn-quitar')) {
                carrito = carrito.filter(item => item.id !== idProducto);
            } else if (e.target.classList.contains('btn-aumentar')) {
                carrito[index].cantidad += 1;
            } else if (e.target.classList.contains('btn-disminuir')) {
                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad -= 1;
                } else {
                    carrito = carrito.filter(item => item.id !== idProducto);
                }
            }

            localStorage.setItem('gridFlex_carrito', JSON.stringify(carrito));
            renderizarCarrito();
            
            const badgeCarrito = document.querySelector('.cart-badge'); 
            const totalItems = carrito.reduce((t, i) => t + i.cantidad, 0);
            if (badgeCarrito) {
                badgeCarrito.textContent = totalItems;
                badgeCarrito.style.display = totalItems > 0 ? 'inline-block' : 'none';
            }
        });

        // Lógica de "Completar Pago" (Validación y Modal)
        if (btnCheckout) {
            btnCheckout.addEventListener('click', () => {
                const usuarioIniciado = localStorage.getItem('gridFlex_usuarioActivo');
                
                if (!usuarioIniciado) {
                    const modalLogin = new bootstrap.Modal(document.getElementById('modalLoginRequerido'));
                    modalLogin.show();
                    return; 
                }

                // LLENAR EL TICKET DEL MODAL DINÁMICAMENTE (Con envío incluido)
                let carrito = JSON.parse(localStorage.getItem('gridFlex_carrito')) || [];
                if (contenedorResumenModal) {
                    let subtotalModal = 0;
                    contenedorResumenModal.innerHTML = '<h6 class="text-gold mb-3 text-uppercase">Resumen de artículos</h6>';
                    
                    carrito.forEach(item => {
                        subtotalModal += (item.precio * item.cantidad);
                        contenedorResumenModal.innerHTML += `
                            <div class="d-flex justify-content-between mb-2 small">
                                <span class="text-muted">${item.cantidad}x ${item.nombre} (Talla: ${item.talla})</span>
                                <span class="fw-bold">$${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                        `;
                    });

                    // Agregamos la línea de envío al ticket
                    let envioModal = subtotalModal < 399 ? 99 : 0;
                    let textoEnvio = envioModal === 0 ? "GRATIS" : `$${envioModal.toFixed(2)}`;
                    
                    contenedorResumenModal.innerHTML += `
                        <hr class="my-2 opacity-50">
                        <div class="d-flex justify-content-between mb-2 small">
                            <span class="text-muted">Costo de envío</span>
                            <span class="fw-bold ${envioModal === 0 ? 'text-success' : ''}">${textoEnvio}</span>
                        </div>
                    `;
                }

                const modalExito = new bootstrap.Modal(document.getElementById('modalPagoExitoso'));
                modalExito.show();

                localStorage.removeItem('gridFlex_carrito'); 
                const badgeCarrito = document.querySelector('.cart-badge'); 
                if (badgeCarrito) badgeCarrito.style.display = 'none';

                document.getElementById('modalPagoExitoso').addEventListener('hidden.bs.modal', () => {
                    renderizarCarrito(); 
                });
            });
        }
    }
});