// ==========================================
// API (mismo origen que la app Spring Boot en :8080)
// ==========================================
const API_ORIGIN = window.location.origin || "http://localhost:8080";
const API_V1 = `${API_ORIGIN}/api/v1`;

const GUEST_CART_KEY = "gridFlex_carrito_guest";

function readSession() {
    try {
        const raw = sessionStorage.getItem("session");
        const session = raw ? JSON.parse(raw) : null;
        if (!session) return null;

        const id = getSessionUserId(session);
        return id == null ? session : { ...session, id };
    } catch {
        return null;
    }
}

function getSessionUserId(session) {
    if (!session) return null;
    const id = session.id ?? session.id_Usuario ?? session.idUsuario;
    return id != null && id !== "" ? id : null;
}

function mapApiProductToUi(p) {
    const rawDesc = p.descripcion || "";
    const tallaMatch = rawDesc.match(/\[Talla:([^\]]+)\]/);
    const talla = tallaMatch ? tallaMatch[1] : "M";
    const descripcionSinTalla = tallaMatch
        ? rawDesc.replace(/\s*\[Talla:[^\]]+\]\s*$/, "").trim()
        : rawDesc;
    const catNombre = p.categoria && p.categoria.nombre ? String(p.categoria.nombre) : "General";
    return {
        id: String(p.id_productos),
        nombre: p.nombre,
        precio: Number(p.precio),
        descripcion: descripcionSinTalla,
        imagen: p.urlImagen || "",
        categoria: catNombre.toLowerCase(),
        talla,
        stock: p.existencias != null ? Number(p.existencias) : 0,
        idCategoria: p.categoria ? p.categoria.idCategory : null,
    };
}

function buildDescripcionParaApi(descripcionBase, talla) {
    const base = (descripcionBase || "").replace(/\s*\[Talla:[^\]]+\]\s*$/i, "").trim();
    return `${base} [Talla:${talla}]`;
}

const gestorProductos = { items: [] };

async function fetchProductosDesdeApi() {
    const r = await fetch(`${API_V1}/products`);
    if (!r.ok) throw new Error("No se pudieron cargar los productos");
    const data = await r.json();
    gestorProductos.items = Array.isArray(data) ? data.map(mapApiProductToUi) : [];
}

async function loadProductCatalogIntoGestor() {
    try {
        await fetchProductosDesdeApi();
    } catch (e) {
        console.error(e);
        gestorProductos.items = [];
    }
}

async function fetchCategoriasDesdeApi() {
    const r = await fetch(`${API_V1}/categories`);
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
}

function mapCarritoLineToUi(line) {
    return {
        detalleId: line.detalleId,
        id: String(line.productoId),
        nombre: line.nombre,
        precio: Number(line.precioUnitario),
        cantidad: line.cantidad,
        imagen: line.urlImagen,
        talla: line.talla || "M",
    };
}

function readGuestCart() {
    try {
        const raw = sessionStorage.getItem(GUEST_CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGuestCart(items) {
    sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

async function fetchCarritoApi(userId) {
    const r = await fetch(`${API_V1}/carrito/${userId}`);
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data.map(mapCarritoLineToUi) : [];
}

async function apiAddCarritoItem(userId, productoId, cantidad = 1) {
    const r = await fetch(`${API_V1}/carrito/${userId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId: Number(productoId), cantidad }),
    });
    if (!r.ok) {
        const detail = await r.text().catch(() => "");
        throw new Error(`No se pudo agregar al carrito (${r.status}) ${detail}`);
    }
    const data = await r.json();
    return data.map(mapCarritoLineToUi);
}

async function apiUpdateQty(userId, detalleId, cantidad) {
    const r = await fetch(
        `${API_V1}/carrito/items/${detalleId}?userId=${encodeURIComponent(userId)}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad }),
        }
    );
    if (!r.ok) throw new Error("No se pudo actualizar el carrito");
    const data = await r.json();
    return data.map(mapCarritoLineToUi);
}

async function apiRemoveLine(userId, detalleId) {
    const r = await fetch(`${API_V1}/carrito/items/${detalleId}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
    });
    if (!r.ok) throw new Error("No se pudo eliminar la línea");
    const data = await r.json();
    return data.map(mapCarritoLineToUi);
}

async function apiCheckout(userId, montoTotal) {
    const r = await fetch(`${API_V1}/carrito/${userId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoTotal }),
    });
    if (!r.ok) throw new Error("No se pudo completar el pago");
}

async function getCarritoActual() {
    const sess = readSession();
    const userId = getSessionUserId(sess);
    if (userId != null) {
        try {
            const apiCart = await fetchCarritoApi(userId);
            return [...apiCart, ...readGuestCart()];
        } catch (e) {
            console.error(e);
            return readGuestCart();
        }
    }
    return readGuestCart();
}

function badgeCountFromItems(items) {
    return items.reduce((t, i) => t + (Number(i.cantidad) || 0), 0);
}

async function refreshCartBadge() {
    const badge = document.querySelector(".cart-badge");
    if (!badge) return;
    const items = await getCarritoActual();
    const n = badgeCountFromItems(items);
    badge.textContent = n;
    badge.style.display = n > 0 ? "inline-block" : "none";
}

async function addProductToCartGuest(productoUi) {
    let cart = readGuestCart();
    const idx = cart.findIndex((item) => item.id === String(productoUi.id));
    if (idx !== -1) {
        cart[idx].cantidad += 1;
    } else {
        cart.push({ ...productoUi, cantidad: 1, detalleId: null });
    }
    saveGuestCart(cart);
}

const IMG_FALLBACK = 'img/camisa.png';

/** Rutas de imágenes y estáticos: prefijo /img/... para que carguen desde cualquier carpeta (p. ej. templates/carrito.html). */
function resolveStaticUrl(url) {
    if (!url || typeof url !== "string") return "";
    let u = url.trim().replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("blob:")) return u;
    if (u.startsWith("../static/img/")) u = "img/" + u.slice("../static/img/".length);
    else if (u.startsWith("/static/img/")) u = "img/" + u.slice("/static/img/".length);
    if (u.startsWith("/img/")) return u;

    let path = u.replace(/^\/+/, "");
    while (path.startsWith("../")) path = path.slice(3);
    while (path.startsWith("./")) path = path.slice(2);
    if (path.startsWith("img/")) {
        if (window.location.protocol === "file:") {
            const pathname = (window.location.pathname || "").replace(/\\/g, "/");
            const inTemplates = pathname.includes("/templates/");
            return (inTemplates ? "../" : "") + path;
        }
        return "/" + path;
    }
    if (path.startsWith("/")) return path;

    const pathname = (window.location.pathname || "").replace(/\\/g, "/");
    const inTemplates = pathname.includes("/templates/");
    return (inTemplates ? "../" : "") + path;
}

function resizeImageFileToDataUrl(file, maxSize = 900, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


function addItemCard(producto) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    const col = document.createElement('div');
    col.className = 'col-md-4 producto';

    const imgSrc = producto.imagen ? resolveStaticUrl(producto.imagen) : '';
    const imgHTML = imgSrc
        ? `<img src="${imgSrc}" class="img-fluid rounded" style="height: 250px; width: 100%; object-fit: cover;">`
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

document.addEventListener("DOMContentLoaded", async () => {

  await loadProductCatalogIntoGestor();

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
  const categoriaInicial = new URLSearchParams(window.location.search).get("categoria")?.toLowerCase();

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
            precioRange.value = precioRange.max || 2000;
            precioValor.textContent = "$" + precioRange.value;
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

  if (categoriaInicial && categorias.length > 0) {
    let categoriaAplicada = false;
    categorias.forEach((input) => {
      if (input.value.toLowerCase() === categoriaInicial) {
        input.checked = true;
        categoriaAplicada = true;
      } else if (input !== verTodo) {
        input.checked = false;
      }
    });
    if (verTodo) verTodo.checked = !categoriaAplicada;
  }

  function filtrar() {
    if (!contenedorProductos || typeof gestorProductos === 'undefined') return;

    const cats = [...categorias].filter(c => c.checked && c.value !== "todo").map(c => c.value.toLowerCase());
    const precioMax = precioRange ? parseInt(precioRange.value) : 2000;

    const staticCols = contenedorProductos.querySelectorAll('.producto[data-catalog-static="true"]');

    if (gestorProductos.items.length === 0 && staticCols.length > 0) {
        contenedorProductos.querySelector('.catalogo-sin-resultados')?.remove();
        let visibles = 0;
        staticCols.forEach((col) => {
            const card = col.querySelector('.card');
            const cat = (card?.getAttribute('data-categoria') || '').toLowerCase();
            const talla = card?.getAttribute('data-talla') || '';
            const precio = parseFloat(col.getAttribute('data-precio') || '0', 10);
            let visible = true;
            if (cats.length > 0 && !cats.includes(cat)) visible = false;
            if (tallaSeleccionada && talla !== tallaSeleccionada) visible = false;
            if (precio > precioMax) visible = false;
            col.style.display = visible ? '' : 'none';
            if (visible) visibles++;
        });
        if (visibles === 0) {
            const div = document.createElement('div');
            div.className = 'col-12 text-center py-5 catalogo-sin-resultados';
            div.innerHTML = `
                <i class="fa-solid fa-magnifying-glass fa-2x text-muted mb-3"></i>
                <h6 class="text-muted">No encontramos prendas con esos filtros.</h6>
            `;
            contenedorProductos.appendChild(div);
        }
        if (contadorBadge) contadorBadge.textContent = String(visibles);
        return;
    }

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
// 6. GESTIÓN DE PRODUCTOS Y ADMINISTRADOR (API)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    const formAgregarProducto = document.getElementById("formAgregarProducto");
    const tablaBody = document.getElementById("tablaProductosBody");
    const btnEditar = document.getElementById("btnEditar");
    const btnEliminar = document.getElementById("btnEliminar");
    const btnGuardar = document.getElementById("btnGuardar");
    const inputImagen = document.getElementById("imagenProducto");
    const selCategoria = document.getElementById("categoriaProducto");

    const modalEliminarHTML = document.getElementById("modalConfirmarEliminar");
    const btnBorrarDefinitivo = document.getElementById("btnBorrarDefinitivo");
    const contadorEliminar = document.getElementById("contadorEliminar");
    const toastEliminarEl = document.getElementById("toastEliminar");
    const toastAgregarEl = document.getElementById("toastAgregar");

    if (!tablaBody && !formAgregarProducto) return;

    let inventarioProductos = [];
    let imagenBase64Temporal = "";

    async function recargarInventarioAdmin() {
        try {
            await fetchProductosDesdeApi();
            inventarioProductos = gestorProductos.items.slice();
        } catch (e) {
            console.error(e);
            inventarioProductos = [];
        }
    }

    if (selCategoria) {
        const cats = await fetchCategoriasDesdeApi();
        if (cats.length > 0) {
            selCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
            cats.forEach((c) => {
                const opt = document.createElement("option");
                opt.value = String(c.idCategory);
                opt.textContent = c.nombre;
                opt.dataset.slug = (c.nombre || "").toLowerCase();
                selCategoria.appendChild(opt);
            });
        }
    }

    if (inputImagen) {
        inputImagen.addEventListener("change", async function (e) {
            const archivo = e.target.files[0];
            if (archivo) {
                try {
                    imagenBase64Temporal = await resizeImageFileToDataUrl(archivo);
                } catch (error) {
                    console.error(error);
                    imagenBase64Temporal = "";
                    alert("No se pudo procesar la imagen seleccionada.");
                }
            }
        });
    }

    function renderizarTabla() {
        if (!tablaBody) return;

        tablaBody.innerHTML = "";

        inventarioProductos.forEach((producto) => {
            const fila = document.createElement("tr");
            fila.setAttribute("data-id", producto.id);

            const imagenHTML = producto.imagen
                ? `<img src="${resolveStaticUrl(producto.imagen)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">`
                : `<div class="bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 6px; font-size: 10px;">IMG</div>`;

            fila.innerHTML = `
                <td><input type="checkbox" class="form-check-input producto-check" value="${producto.id}"></td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>$${producto.precio}</td>
                <td>${producto.talla}</td>
                <td>${producto.stock}</td>
                <td><span class="badge bg-success">BD</span></td>
                <td>${imagenHTML}</td>
            `;
            tablaBody.appendChild(fila);
        });

        if (btnEliminar) btnEliminar.disabled = true;
        if (btnEditar) btnEditar.disabled = true;
    }

    if (formAgregarProducto) {
        formAgregarProducto.addEventListener("submit", async (e) => {
            e.preventDefault();

            const idEdicion = formAgregarProducto.dataset.editandoId;

            if (!formAgregarProducto.checkValidity()) {
                e.stopPropagation();
                formAgregarProducto.classList.add("was-validated");
                return;
            }

            const nombre = document.getElementById("nombreProducto").value;
            const precio = Number(document.getElementById("precioProducto").value);
            const idCat = Number(document.getElementById("categoriaProducto").value);
            const talla = document.getElementById("tallaProducto").value;
            const stock = Number(document.getElementById("stockProducto").value);
            const descripcionBase = document.getElementById("descripcionProducto").value;
            const descripcion = buildDescripcionParaApi(descripcionBase, talla);
            const imagenFinal =
                imagenBase64Temporal ||
                (idEdicion ? inventarioProductos.find((p) => p.id === idEdicion)?.imagen : "") ||
                "img/camisa.png";

            const payload = {
                nombre,
                descripcion,
                precio,
                existencias: stock,
                urlImagen: imagenFinal,
                categoria: { idCategory: idCat },
            };

            try {
                if (idEdicion) {
                    payload.id_productos = Number(idEdicion);
                    const r = await fetch(`${API_V1}/products/${idEdicion}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    if (!r.ok) throw new Error("No se pudo actualizar");
                    delete formAgregarProducto.dataset.editandoId;
                    if (btnGuardar) btnGuardar.textContent = "Guardar";
                } else {
                    const r = await fetch(`${API_V1}/products`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    if (!r.ok) throw new Error("No se pudo crear");
                }

                await recargarInventarioAdmin();
                renderizarTabla();
                formAgregarProducto.reset();
                formAgregarProducto.classList.remove("was-validated");
                imagenBase64Temporal = "";
                if (inputImagen) inputImagen.removeAttribute("data-skip-required");
                if (toastAgregarEl) new bootstrap.Toast(toastAgregarEl).show();
            } catch (err) {
                console.error(err);
                alert("Error al guardar el producto en el servidor.");
            }
        });

        formAgregarProducto.addEventListener("reset", () => {
            delete formAgregarProducto.dataset.editandoId;
            if (btnGuardar) btnGuardar.textContent = "Guardar";
            imagenBase64Temporal = "";
            formAgregarProducto.classList.remove("was-validated");
            if (inputImagen) {
                inputImagen.setAttribute("required", "");
                inputImagen.removeAttribute("data-skip-required");
            }
        });
    }

    if (tablaBody && btnEliminar && modalEliminarHTML && toastEliminarEl && btnBorrarDefinitivo) {
        const modalBootstrap = new bootstrap.Modal(modalEliminarHTML);
        const toastBootstrap = new bootstrap.Toast(toastEliminarEl);

        tablaBody.addEventListener("change", (e) => {
            if (e.target.classList.contains("producto-check")) {
                const marcados = document.querySelectorAll(".producto-check:checked");
                btnEliminar.disabled = marcados.length === 0;
                if (btnEditar) btnEditar.disabled = marcados.length !== 1;
            }
        });

        btnEliminar.addEventListener("click", () => {
            const marcados = document.querySelectorAll(".producto-check:checked");
            if (contadorEliminar) contadorEliminar.textContent = marcados.length;
            modalBootstrap.show();
        });

        btnBorrarDefinitivo.addEventListener("click", async () => {
            const marcados = document.querySelectorAll(".producto-check:checked");
            const cantidadBorrados = marcados.length;

            try {
                for (const checkbox of marcados) {
                    const r = await fetch(`${API_V1}/products/${checkbox.value}`, { method: "DELETE" });
                    if (!r.ok) console.warn("No se eliminó producto", checkbox.value);
                }
                await recargarInventarioAdmin();
                modalBootstrap.hide();
                renderizarTabla();

                const toastBody = toastEliminarEl.querySelector(".toast-body");
                if (toastBody) {
                    toastBody.innerHTML = `<i class="fa-solid fa-trash-can me-2 text-danger"></i> Se eliminaron <strong>${cantidadBorrados}</strong> producto(s) correctamente.`;
                }
                toastBootstrap.show();
            } catch (err) {
                console.error(err);
                alert("Error al eliminar en el servidor.");
            }
        });
    }

    if (btnEditar && formAgregarProducto) {
        btnEditar.addEventListener("click", () => {
            const marcado = document.querySelector(".producto-check:checked");
            const id = marcado?.value;
            const productoAEditar = inventarioProductos.find((p) => p.id === id);

            if (productoAEditar) {
                document.getElementById("nombreProducto").value = productoAEditar.nombre;
                document.getElementById("precioProducto").value = productoAEditar.precio;
                if (productoAEditar.idCategoria != null) {
                    document.getElementById("categoriaProducto").value = String(productoAEditar.idCategoria);
                }
                document.getElementById("tallaProducto").value = productoAEditar.talla;
                document.getElementById("stockProducto").value = productoAEditar.stock;
                document.getElementById("descripcionProducto").value = productoAEditar.descripcion || "";

                formAgregarProducto.dataset.editandoId = productoAEditar.id;
                if (btnGuardar) btnGuardar.textContent = "Actualizar";
                if (inputImagen) {
                    inputImagen.removeAttribute("required");
                    inputImagen.setAttribute("data-skip-required", "1");
                }
                formAgregarProducto.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    await recargarInventarioAdmin();
    renderizarTabla();
});

// ==========================================
// Validación visual del formulario de login (sin guardar credenciales)
// ==========================================
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("loginForm");

function toggleValidationClass(input, isValid) {
    if (!input) return;
    if (input.value.length > 0) {
        if (isValid) {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        } else {
            input.classList.remove("is-valid");
            input.classList.add("is-invalid");
        }
    } else {
        input.classList.remove("is-valid", "is-invalid");
    }
}

if (emailInput && passwordInput && submitBtn && form) {
    function validateForm() {
        const emailVal = emailInput.value.trim();
        const passVal = passwordInput.value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValid = emailRegex.test(emailVal);

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;
        const passValid = passwordRegex.test(passVal);

        toggleValidationClass(emailInput, emailValid);
        toggleValidationClass(passwordInput, passValid);

        submitBtn.disabled = !(emailValid && passValid);
    }

    emailInput.addEventListener("blur", validateForm);
    emailInput.addEventListener("input", validateForm);
    passwordInput.addEventListener("input", validateForm);
    passwordInput.addEventListener("blur", validateForm);

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        validateForm();
    });

    validateForm();
}


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
            <img src="${resolveStaticUrl(producto.imagen || IMG_FALLBACK)}" alt="${producto.nombre}" class="notification-cart-img">
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
// 8. CARRITO: badge al cargar (API si hay sesión; invitado en sessionStorage)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    refreshCartBadge();
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
// DELEGADOR GLOBAL: Agregar al carrito
// ==========================================
document.addEventListener(
    "click",
    async (e) => {
        const btnAgregar = e.target.closest(".btn-agregar-carrito");
        if (!btnAgregar) return;

        const idProducto = btnAgregar.dataset.id;
        let productoAñadir = null;

        if (idProducto) {
            if (!gestorProductos.items.length) {
                try {
                    await loadProductCatalogIntoGestor();
                } catch {
                    /* vacío */
                }
            }
            productoAñadir = gestorProductos.items.find((p) => p.id === idProducto);
        } else {
            const ref = btnAgregar.dataset.ref || `idx-${Date.now()}`;
            const imgRaw =
                btnAgregar.getAttribute("data-imagen") ||
                btnAgregar.dataset.imagen ||
                "";
            productoAñadir = {
                id: ref,
                nombre: btnAgregar.dataset.nombre || "Producto",
                precio: Number(btnAgregar.dataset.precio) || 0,
                imagen: imgRaw || IMG_FALLBACK,
                categoria: btnAgregar.dataset.categoria || "general",
                talla: btnAgregar.dataset.talla || "M",
            };
        }

        if (!productoAñadir) return;

        try {
            const sess = readSession();
            const userId = getSessionUserId(sess);
            if (userId != null && idProducto) {
                try {
                    await apiAddCarritoItem(userId, idProducto, 1);
                } catch (apiError) {
                    console.warn("No se pudo guardar el producto en la API; se conservara en el carrito local.", apiError);
                    await addProductToCartGuest(productoAñadir);
                }
            } else {
                await addProductToCartGuest(productoAñadir);
            }
            await refreshCartBadge();

            mostrarNotificacionProducto(productoAñadir);

            const textoOriginal = btnAgregar.innerHTML;
            btnAgregar.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
            btnAgregar.classList.replace("btn-outline-dark", "btn-success");
            btnAgregar.classList.replace("index-btn-blue", "btn-success");

            setTimeout(() => {
                btnAgregar.innerHTML = textoOriginal;
                btnAgregar.classList.replace("btn-success", "btn-outline-dark");
                if (!btnAgregar.classList.contains("btn-outline-dark")) {
                    btnAgregar.classList.add("index-btn-blue");
                }
            }, 1000);
        } catch (err) {
            console.error(err);
            alert("No se pudo agregar al carrito. Intenta de nuevo.");
        }
    },
    true
);

// ==========================================
// 9. PÁGINA DEL CARRITO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const contenedorCarrito = document.getElementById("contenedor-carrito-items");
    const subtotalEl = document.getElementById("carrito-subtotal");
    const totalEl = document.getElementById("carrito-total");
    const btnCheckout = document.getElementById("btn-checkout");
    const contenedorResumenModal = document.getElementById("resumen-articulos-modal");

    if (!contenedorCarrito) return;

    async function renderizarCarrito() {
        const carrito = await getCarritoActual();
        contenedorCarrito.innerHTML = "";

        let subtotal = 0;

        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="fa-solid fa-cart-arrow-down fa-3x mb-3"></i>
                        <h5>Tu carrito está vacío</h5>
                        <p>Agrega productos desde nuestro catálogo para verlos aquí.</p>
                        <a href="catalogo.html" class="btn btn-outline-dark mt-2">Ir al catálogo</a>
                    </div>`;
            if (subtotalEl) subtotalEl.textContent = "$0.00";
            if (totalEl) totalEl.textContent = "$0.00";
            const envioEl = document.getElementById("carrito-envio");
            if (envioEl) {
                envioEl.textContent = "$0.00";
                envioEl.className = "text-muted";
            }
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

        if (btnCheckout) btnCheckout.disabled = false;

        carrito.forEach((producto) => {
            subtotal += Number(producto.precio) * producto.cantidad;

            const itemHTML = document.createElement("div");
            itemHTML.className =
                "product-card d-flex align-items-center justify-content-between p-3 mb-3 bg-white shadow-sm rounded";
            const imagenSrc = resolveStaticUrl(producto.imagen || IMG_FALLBACK);
            const detalleAttr =
                producto.detalleId != null && producto.detalleId !== ""
                    ? ` data-detalle="${producto.detalleId}"`
                    : "";

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
                            <button type="button" class="btn btn-sm btn-outline-secondary btn-disminuir" data-id="${producto.id}"${detalleAttr}>-</button>
                            <div class="fw-bold px-2 py-1">${producto.cantidad}</div>
                            <button type="button" class="btn btn-sm btn-outline-secondary btn-aumentar" data-id="${producto.id}"${detalleAttr}>+</button>
                        </div>
                        <div class="text-end" style="min-width: 80px;">
                            <div class="fw-bold fs-5">$${(producto.precio * producto.cantidad).toFixed(2)}</div>
                            <small class="text-danger btn-quitar" data-id="${producto.id}"${detalleAttr} style="cursor: pointer; font-weight: bold; letter-spacing: 1px;">QUITAR</small>
                        </div>
                    </div>
                `;
            contenedorCarrito.appendChild(itemHTML);
        });

        let costoEnvio = 0;
        const envioEl = document.getElementById("carrito-envio");

        if (subtotal < 399) {
            costoEnvio = 99.0;
            if (envioEl) {
                envioEl.textContent = `$${costoEnvio.toFixed(2)}`;
                envioEl.className = "fw-bold text-dark";
            }
        } else {
            costoEnvio = 0;
            if (envioEl) {
                envioEl.textContent = "GRATIS";
                envioEl.className = "text-success fw-bold";
            }
        }

        const totalFinal = subtotal + costoEnvio;
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${totalFinal.toFixed(2)}`;

        const totalModal = document.querySelector(".text-total-modal");
        if (totalModal) totalModal.textContent = `$${totalFinal.toFixed(2)}`;
    }

    renderizarCarrito();

    contenedorCarrito.addEventListener("click", async (e) => {
        const idProducto = e.target.getAttribute("data-id");
        const detalleIdStr = e.target.getAttribute("data-detalle");
        if (!idProducto) return;

        const sess = readSession();
        const userId = getSessionUserId(sess);

        try {
            if (userId != null && detalleIdStr) {
                const detalleId = Number(detalleIdStr);
                let carrito = await fetchCarritoApi(userId);
                const line = carrito.find((x) => x.detalleId === detalleId);
                if (!line) {
                    await renderizarCarrito();
                    return;
                }

                if (e.target.classList.contains("btn-quitar")) {
                    carrito = await apiRemoveLine(userId, detalleId);
                } else if (e.target.classList.contains("btn-aumentar")) {
                    carrito = await apiUpdateQty(userId, detalleId, line.cantidad + 1);
                } else if (e.target.classList.contains("btn-disminuir")) {
                    const n = line.cantidad - 1;
                    carrito = await apiUpdateQty(userId, detalleId, n < 1 ? 0 : n);
                }
            } else {
                let carrito = readGuestCart();
                const index = carrito.findIndex((item) => item.id === idProducto);
                if (index === -1) return;

                if (e.target.classList.contains("btn-quitar")) {
                    carrito = carrito.filter((item) => item.id !== idProducto);
                } else if (e.target.classList.contains("btn-aumentar")) {
                    carrito[index].cantidad += 1;
                } else if (e.target.classList.contains("btn-disminuir")) {
                    if (carrito[index].cantidad > 1) {
                        carrito[index].cantidad -= 1;
                    } else {
                        carrito = carrito.filter((item) => item.id !== idProducto);
                    }
                }
                saveGuestCart(carrito);
            }

            await renderizarCarrito();
            await refreshCartBadge();
        } catch (err) {
            console.error(err);
            alert("No se pudo actualizar el carrito.");
        }
    });

    if (btnCheckout) {
        btnCheckout.addEventListener("click", async () => {
            const usuarioIniciado = readSession();
            const userId = getSessionUserId(usuarioIniciado);

            if (userId == null) {
                const modalLogin = new bootstrap.Modal(document.getElementById("modalLoginRequerido"));
                modalLogin.show();
                return;
            }

            const carrito = await getCarritoActual();
            let subtotalModal = 0;
            if (contenedorResumenModal) {
                contenedorResumenModal.innerHTML =
                    '<h6 class="text-gold mb-3 text-uppercase">Resumen de artículos</h6>';

                carrito.forEach((item) => {
                    subtotalModal += item.precio * item.cantidad;
                    contenedorResumenModal.innerHTML += `
                            <div class="d-flex justify-content-between mb-2 small">
                                <span class="text-muted">${item.cantidad}x ${item.nombre} (Talla: ${item.talla})</span>
                                <span class="fw-bold">$${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                        `;
                });

                const envioModal = subtotalModal < 399 ? 99 : 0;
                const textoEnvio = envioModal === 0 ? "GRATIS" : `$${envioModal.toFixed(2)}`;

                contenedorResumenModal.innerHTML += `
                        <hr class="my-2 opacity-50">
                        <div class="d-flex justify-content-between mb-2 small">
                            <span class="text-muted">Costo de envío</span>
                            <span class="fw-bold ${envioModal === 0 ? "text-success" : ""}">${textoEnvio}</span>
                        </div>
                    `;
            }

            const envioModal = subtotalModal < 399 ? 99 : 0;
            const totalFinal = subtotalModal + envioModal;

            try {
                const carritoTieneLineasApi = carrito.some((item) => item.detalleId != null);
                if (carritoTieneLineasApi) {
                    await apiCheckout(userId, totalFinal);
                }
            } catch (err) {
                console.error(err);
                alert("No se pudo registrar el pedido. Intenta de nuevo.");
                return;
            }

            saveGuestCart([]);

            const modalExito = new bootstrap.Modal(document.getElementById("modalPagoExitoso"));
            modalExito.show();

            await refreshCartBadge();

            const modalEl = document.getElementById("modalPagoExitoso");
            if (modalEl) {
                modalEl.addEventListener(
                    "hidden.bs.modal",
                    () => {
                        renderizarCarrito();
                    },
                    { once: true }
                );
            }
        });
    }
});

/* =========================================
   VALIDACIÓN FORMULARIO REGISTRO
   ========================================= */
const campos = {
    nombre: false,
    apellido: false,
    correo: false,
    telefono: false,
    password: false,
    password2: false,
}

const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input');

const expresiones = {
    nombre: /^[a-zA-Z0-9\_\-\s]{2,20}$/,
    apellido: /^[a-zA-ZÀ-ÿ\s]{4,20}$/,
    password: /^.{8,20}$/,
    correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    telefono: /^\d{10}$/
};

const validarCampo = (expresion, input, campo) => {
    if (expresion.test(input.value)) {
        // Estilos de éxito de Bootstrap
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        campos[campo] = true;
    } else {
        // Estilos de error de Bootstrap
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        campos[campo] = false;
    }
};

const btnRegistro = document.getElementById('btn-registro');

const toggleButton = () => {
    // Verificamos si todos los campos en el objeto 'campos' son true
    const formularioValido = Object.values(campos).every(campo => campo === true);
    
    if (formularioValido) {
        btnRegistro.disabled = false;
    } else {
        btnRegistro.disabled = true;
    }
};

const validarFormulario = (e) => {
    switch (e.target.name) {
        case "nombre":
            // Pasamos el regex, el input y el nombre de la propiedad en el objeto 'campos'
            validarCampo(expresiones.nombre, e.target, 'nombre');
        break;
        case "apellido":
            validarCampo(expresiones.apellido, e.target, 'apellido');
        break;
        case "correo":
            validarCampo(expresiones.correo, e.target, 'correo');
        break;
        case "telefono":
            validarCampo(expresiones.telefono, e.target, 'telefono');
        break;
        case "password":
            validarCampo(expresiones.password, e.target, 'password');
            validarPassword2(); 
        break;
        case "password2":
            validarPassword2();
        break;
    }
    toggleButton(); 
};

inputs.forEach((input) => {
    input.addEventListener('keyup', validarFormulario);
    input.addEventListener('blur', validarFormulario);
});


/* Comparar contraseñas*/
const validarPassword2 = () => {
    const inputPassword1 = document.getElementById('password');
    const inputPassword2 = document.getElementById('password2');

    if (inputPassword1.value === inputPassword2.value && inputPassword2.value !== "") {
        inputPassword2.classList.remove('is-invalid');
        inputPassword2.classList.add('is-valid');
        campos.password2 = true; // Actualiza el estado a true
    } else {
        inputPassword2.classList.remove('is-valid');
        inputPassword2.classList.add('is-invalid');
        campos.password2 = false; // Actualiza el estado a false
    }
};

// ==========================================
// VALIDACIÓN FORMULARIO RECUPERAR CONTRASEÑA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const formRecuperar = document.getElementById('formRecuperar');
    const emailRecuperacion = document.getElementById('emailRecuperacion');
    const btnEnviarRecuperacion = document.getElementById('btnEnviarRecuperacion');

    if (formRecuperar && emailRecuperacion && btnEnviarRecuperacion) {
        
        
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        emailRecuperacion.addEventListener('input', () => {
            const correoEscrito = emailRecuperacion.value.trim();
            const esValido = emailRegex.test(correoEscrito);

            if (correoEscrito.length > 0) {
                if (esValido) {
                    emailRecuperacion.classList.remove('is-invalid');
                    emailRecuperacion.classList.add('is-valid');
                    btnEnviarRecuperacion.disabled = false; 
                } else {
                    emailRecuperacion.classList.remove('is-valid');
                    emailRecuperacion.classList.add('is-invalid');
                    btnEnviarRecuperacion.disabled = true; 
                }
            } else {
                emailRecuperacion.classList.remove('is-valid', 'is-invalid');
                btnEnviarRecuperacion.disabled = true;
            }
        });

        // 2. Lógica al darle clic al botón "ENVIAR CORREO"
        formRecuperar.addEventListener('submit', (event) => {
            event.preventDefault();

            const correoEscrito = emailRecuperacion.value.trim();

            
            if (emailRegex.test(correoEscrito)) {
                const modalBandeja = new bootstrap.Modal(document.getElementById('modalVerificarBandeja'));
                modalBandeja.show();

                // Limpiamos el formulario
                formRecuperar.reset();
                emailRecuperacion.classList.remove('is-valid', 'is-invalid');
                btnEnviarRecuperacion.disabled = true;
            }
        });
    }
});


// ==========================================
// USUARIOS (API)
// ==========================================
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_V1}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error("Error al registrar usuario");
        }

        await response.json();
        await login(userData.correo, userData.contrasena);
    } catch (error) {
        console.error(error);
        alert("No se pudo registrar el usuario");
    }
}

async function login(correo, contrasena) {
    try {
        const response = await fetch(`${API_V1}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                correo: correo,
                contrasena: contrasena,
            }),
        });

        if (!response.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const user = await response.json();

        sessionStorage.setItem(
            "session",
            JSON.stringify({
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                telefono: user.telefono,
                roles: user.roles,
            })
        );

        window.location.href = "../index.html";
    } catch (error) {
        console.error(error);
        alert("Error del servidor");
    }
}

function getSession() {
    return readSession();
}

// ==========================================
// CERRAR SESIÓN
// ==========================================
function logout() {

    sessionStorage.removeItem("session");
    window.location.href = "login.html";

}

// ==========================================
// FORM LOGIN
// ==========================================
const formLogin = document.querySelector("#loginForm");

if (formLogin) {

    formLogin.addEventListener("submit", async function (e) {

        e.preventDefault();

        const correo = document.querySelector("#email").value;
        const contrasena = document.querySelector("#password").value;

        await login(correo, contrasena);

    });

}

// ==========================================
// FORM REGISTRO
// ==========================================
const formRegister = document.querySelector("#formulario");

if (formRegister) {

    formRegister.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nombreUsuario = document.querySelector("#nombre").value;
        const apellidoUsuario = document.querySelector("#apellido").value;
        const telefonoUsuario = document.querySelector("#telefono").value;
        const contrasenaUsuario = document.querySelector("#password2").value;
        const correoUsuario = document.querySelector("#correo").value;

        // DATOS CORRECTOS PARA SPRING
        const userData = {

            nombre: nombreUsuario,
            apellido: apellidoUsuario,
            telefono: telefonoUsuario,
            correo: correoUsuario,
            contrasena: contrasenaUsuario,
            roles: "cliente"

        };

        await registerUser(userData);

    });

}

// ==========================================
// BOTÓN REGRESAR
// ==========================================
function regresar() {

    window.location.href = "../index.html";

}

// ==========================================
// NAVBAR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    const session = getSession();

    const login = document.getElementById("login");
    const loginMovil = document.getElementById("loginMovil");

    if (!login || !loginMovil) return;

    if (session) {

        login.innerHTML =
            `<i class="fa-solid fa-user me-1"></i> ${session.nombre}`;

        loginMovil.innerHTML =
            `<i class="fa-solid fa-user me-1"></i> ${session.nombre}`;

        if (session.roles === "admin") {

            if (window.location.pathname.includes("index.html")){
                login.href = "templates/seller.html";
                loginMovil.href = "templates/seller.html";
            }else{
                login.href = "seller.html";
            loginMovil.href = "seller.html";
            }

        } else {
            if (window.location.pathname.includes("index.html")){
                login.href = "templates/profileUser.html";
                loginMovil.href = "templates/profileUser.html";
            }else{
                login.href = "profileUser.html";
                loginMovil.href = "profileUser.html";
            }


        }

    } else {

        login.innerHTML = "INGRESAR";
        loginMovil.innerHTML = "INGRESAR";

    }

});

//============================================
//DATOS PROFILE
//============================================
document.addEventListener("DOMContentLoaded", async () => {
    const session = readSession();
    const userId = getSessionUserId(session);
    const telEl = document.getElementById("telProfile");
    const nombreEl = document.getElementById("nombreProfile");
    const emailEl = document.getElementById("emailProfile");
    const profileForm = document.getElementById("profileForm");

    if (userId == null || !telEl || !nombreEl || !emailEl) return;

    let currentUser = {
        ...session,
        id: userId,
    };

    try {
        const response = await fetch(`${API_V1}/users/${userId}`);

        if (!response.ok) {
            throw new Error("Usuario no encontrado");
        }

        currentUser = await response.json();

    } catch (error) {
        console.error(error);
    }

    telEl.value = currentUser.telefono || "";
    nombreEl.value = `${currentUser.nombre || ""} ${currentUser.apellido || ""}`.trim();
    emailEl.value = currentUser.correo || "";

    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombreCompleto = nombreEl.value.trim().replace(/\s+/g, " ");
            const [nombre, ...apellidoPartes] = nombreCompleto.split(" ");
            const payload = {
                ...currentUser,
                id: userId,
                nombre: nombre || currentUser.nombre || "",
                apellido: apellidoPartes.join(" ") || currentUser.apellido || "",
                correo: emailEl.value.trim(),
                telefono: telEl.value.trim(),
                roles: currentUser.roles || session.roles || "cliente",
                contrasena: currentUser.contrasena,
            };

            try {
                const response = await fetch(`${API_V1}/users/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error("No se pudo actualizar el perfil");
                }

                currentUser = await response.json();
                sessionStorage.setItem(
                    "session",
                    JSON.stringify({
                        id: currentUser.id,
                        nombre: currentUser.nombre,
                        apellido: currentUser.apellido,
                        correo: currentUser.correo,
                        telefono: currentUser.telefono,
                        roles: currentUser.roles,
                    })
                );
                alert("Perfil actualizado correctamente.");
            } catch (error) {
                console.error(error);
                alert("No se pudieron guardar los cambios del perfil.");
            }
        });
    }
});
