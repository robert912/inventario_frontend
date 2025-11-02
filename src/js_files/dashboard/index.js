$(document).ready(function () {
    // $.ajax({
    //     url: URL_BACKEND + '/obtener_img',
    //     type: 'GET',
    //     data: { producto: 'multímetro fluke 175' },
    //     success: function (response) {
    //         if (response.url) {
    //             console.log('Imagen encontrada:', response.url);
    //             $('#imagenProducto').attr('src', response.url);
    //         } else {
    //             console.log('No se encontró imagen');
    //         }
    //     },
    //     error: function () {
    //         console.log('Error en la solicitud');
    //     }
    // });
    initializeFilters();
});

async function initializeFilters() {
    // Configure Toastr
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "timeOut": "3000"
    };

    // Cargar categorías primero
    await loadCategorias();
    
    // Luego cargar catálogo inicial
    loadCatalogo();

    // Search functionality - siempre usa API
    document.getElementById('searchInput').addEventListener('input', function (e) {
        const searchTerm = this.value.toLowerCase();
        // Usar debounce para evitar muchas llamadas API
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const categoriaId = document.getElementById('categoryFilter').value;
            loadCatalogo(searchTerm, categoriaId);
        }, 300);
    });

    // Category filter - llamar a API cuando cambie la categoría
    document.getElementById('categoryFilter').addEventListener('change', function (e) {
        const categoriaId = this.value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        loadCatalogo(searchTerm, categoriaId);
    });
}

async function loadCategorias() {
    try {
        const response = await $.ajax({
            url: URL_BACKEND + '/categorias/activas',
            type: 'GET',
            dataType: 'json'
        });

        if (response.success && response.data) {
            let categorias = response.data;
            $('#categoryFilter').empty(); // Limpiar primero
            $('#categoryFilter').append(new Option('Todas las categorías', '', true, true));
            
            categorias.forEach(c => {
                let option = new Option(c.nombre, c.id, false, false);
                $('#categoryFilter').append(option);
            });
            
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
        toastr.error("Error al cargar las categorías", "Error");
    }
}

function loadCatalogo(searchTerm = '', categoriaId = '') {
    // Preparar datos para la API
    const data = {};
    
    if (searchTerm) {
        data.search = searchTerm;
    }
    
    if (categoriaId) {
        data.id_categoria = categoriaId;
    }
    
    // Mostrar loading
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p>Cargando productos...</p>
        </div>
    `;

    $.ajax({
        url: URL_BACKEND + "/inventario/catalogo",
        type: "GET",
        data: data,
        success: function (response) {
            if (response.success) {
                renderProducts(response.data);
                updateProductCount(response.data.length);
            } else {
                toastr.warning(response.message || "No se pudieron cargar los productos", "Atención");
                renderProducts([]);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error en AJAX:', error);
            toastr.error("Error al cargar el catálogo: " + error, "Error");
            renderProducts([]);
        }
    });
}

function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search fa-3x"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda o categoría</p>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Determinar estado del stock
    let statusClass = 'badge-disponible';
    let statusText = 'Disponible';
    
    if (product.stock === 0) {
        statusClass = 'badge-sin-stock';
        statusText = 'Sin stock';
    } else if (product.stock <= 5) {
        statusClass = 'badge-stock-bajo';
        statusText = 'Stock bajo';
    }

    // Generar imagen basada en el producto
    const productImage = getProductImage(product.producto);

    card.innerHTML = `
        <img src="${productImage}" alt="${product.nombre_completo}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop'">
        <div class="product-body">
            <div class="product-header">
                <h3 class="product-title text-capitalize">${product.nombre_completo}</h3>
            </div>
            <div class="product-details">
                <div class="product-location">
                    <i class="fas fa-tags"></i>
                    <span>SKU: ${product.sku}</span>
                </div>
                <div class="product-category">
                    <i class="fas fa-hand"></i>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="product-footer">
                <div class="stock-info">
                    <span class="stock-label">Stock:</span> ${product.stock} uds.
                </div>
                <button class="btn btn-solicitar" data-bs-toggle="modal" data-bs-target="#solicitarProductoModal"
                    onclick="solicitarProducto(${product.id}, '${product.nombre_completo.replace(/'/g, "\\'")}')"
                    ${product.stock === 0 || product.disponible === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    Solicitar
                </button>
            </div>
        </div>
    `;

    return card;
}

function getProductImage(productName) {
    const imageMap = {
        'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=400&fit=crop',
        'confort': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=400&fit=crop',
        'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=400&fit=crop',
        'silla': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=400&fit=crop',
        'impresora': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&h=400&fit=crop',
        'mesa': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=400&fit=crop',
        'camara': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=400&fit=crop'
    };

    const name = (productName || '').toLowerCase();
    for (const [key, image] of Object.entries(imageMap)) {
        if (name.includes(key)) {
            return image;
        }
    }
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop';
}

function updateProductCount(count) {
    document.getElementById('productCount').textContent = `${count} producto${count !== 1 ? 's' : ''}`;
}

function solicitarProducto(productId, productName) {
    cargarSelector("ubicacionNombre", null, "/ubicacion/activas", 'Seleccione una Ubicación', 'solicitarProductoModal');
    // $("#ubicacionNombre").select2({
    //     dropdownParent: $("#solicitarProductoModal"), // importante para que funcione dentro del modal
    //     tags: false, // permite agregar nuevos valores
    //     placeholder: "Escriba o seleccione una opción",
    //     allowClear: true,
    //     width: "100%"
    // });
    
    $.ajax({
        url: URL_BACKEND + "/inventario/detalle", // o la ruta donde devuelves esa data
        type: "GET",
        data: { id_inventario: productId },
        success: function (response) {
            if (response.success) {
                response.data.inventario[0].nombre_completo = productName;
                mostrarModalSolicitud(response.data);
            } else {
                toastr.warning(response.message || "No se pudo obtener la información del producto", "Atención");
            }
        },
        error: function (xhr) {
            toastr.error("Error al obtener producto: " + xhr.responseText, "Error");
        }
    });
}


function mostrarModalSolicitud(data) {
    const solicitante = data.solicitante;
    const inventario = data.inventario[0];
    const responsable = data.responsable;

    // Imagen y nombre
    $("#productoImagen").attr("src", inventario.imagen_url || "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=400&fit=crop");
    $("#productoNombre").text(`${inventario.nombre_completo}`);
    $("#sku").text(`SKU: ${inventario.sku}`);

    // Stock
    $("#cantidad").attr("max", inventario.stock);
    $("#stock").text(`Stock: ${inventario.stock}`);
    $("#stockMaximo").text(`Máximo disponible: ${inventario.stock} unidades`);

    // Datos del solicitante y responsable
    $("#solicitanteNombre").val(solicitante.nombre);
    $("#solicitanteEmail").val(solicitante.usuario);

    // Guarda el id del producto en el botón
    $("#btnEnviarSolicitud").data("id", inventario.id);

    // Inicializar selects (responsable / ubicación)
    inicializarSelectsResponsable(responsable);

    // Abre el modal
    $("#solicitarProductoModal").modal("show");
}

function inicializarSelectsResponsable(responsable, modalId = "#solicitarProductoModal") {
    const $responsableSelect = $("#selectGestorNombre");
    //const $ubicacionSelect = $("#ubicacionAlmacen");

    // Limpiar selects
    $responsableSelect.empty().append(new Option("Seleccione un responsable...", "", true, true)).trigger("change");
    //$ubicacionSelect.empty().append(new Option("Seleccione una ubicación...", "", true, true)).trigger("change");

    // Inicializar Select2
    const selectOptions = {
        dropdownParent: $(modalId),
        allowClear: true,
        width: "100%"
    };
    $responsableSelect.select2({ ...selectOptions, placeholder: "Seleccione un responsable..." });

    // Cargar responsables
    responsable.forEach(r => {
        const option = new Option(`${r.nombre_responsable}`, r.id_responsable, false, false);
        $responsableSelect.append(option);
    });
    $responsableSelect.prop("disabled", false).trigger("change");
}

function enviarSolicitud() {
    if (!validarFormularioSolicitud()) {
        return; // No continuar si hay errores
    }

    const id_inventario = $("#btnEnviarSolicitud").data("id");
    const cantidad = $("#cantidad").val();
    const justificacion = $("#justificacion").val();
    const ubicacion = $('#ubicacionNombre').val();
    const responsable = $('#selectGestorNombre').val();
    const nombre_completo = $('#productoNombre').text();

    Swal.fire({
        title: "Enviando solicitud...",
        text: "Por favor, espera un momento",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: URL_BACKEND + "/solicitud/insert",
        type: "POST",
        data: {
            id_inventario: id_inventario,
            cantidad: cantidad,
            justificacion: justificacion,
            id_ubicacion: ubicacion,
            id_responsable: responsable,
            nombre_completo: nombre_completo
        },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Solicitud enviada!",
                    text: "La solicitud fue enviada correctamente.",
                    confirmButtonColor: "#00a499"
                });

                $("#solicitarProductoModal").modal("hide");

                const form = document.getElementById("solicitudForm");
                form.reset();
                form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
                form.querySelectorAll(".invalid-feedback").forEach(el => el.remove());
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Atención",
                    text: response.message || "No se pudo completar la solicitud",
                    confirmButtonColor: "#f59e0b"
                });
            }
        },
        error: function (xhr) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un problema al enviar la solicitud.\n" + xhr.responseText,
                confirmButtonColor: "#ef4444"
            });
        }
    });
}

// Validar cantidad en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const cantidadInput = document.getElementById('cantidad');
    
    if (cantidadInput) {
        cantidadInput.addEventListener('input', function() {
            const valor = parseInt(this.value);
            if (valor > 3) {
                this.value = 3;
            } else if (valor < 1) {
                this.value = 1;
            }
        });
    }
});



function cargarSelector(selectorId, dataId, url, placeholder, modalParent='') {
    $.ajax({
        url: URL_BACKEND + url,
        type: 'GET',
        data: typeof dataId === "object" ? dataId : { id: dataId },
        success: function(respuesta) {
            const $select = $('#' + selectorId);
            $select.empty();
            const datos = respuesta?.data || [];

            // Siempre agregamos placeholder obligatorio
            $select.append(new Option(placeholder, '', true, true));

            if (datos.length) {
                $.each(datos, function(i, item) {
                    $select.append(new Option(item.nombre, item.id, false, false));
                });
                $select.prop('disabled', false);
            } else {
                $select.empty().append(new Option('No existe data disponible', '', true, true))
                       .prop('disabled', true);
            }

            // Inicializamos Select2
            const opciones = {
                dropdownParent: modalParent ? $('#' + modalParent) : null,
                tags: false,
                placeholder: placeholder,
                allowClear: true,
                width: "100%"
            };
            $select.select2(opciones);

            // Mantener sin selección al inicio
            $select.val('').trigger('change');
        },
        error: function() {
            toastr.warning("Información no encontrada", "Error");
        }
    });
}


function validarFormularioSolicitud() {
    const form = document.getElementById('solicitudForm');
    let valido = true;

    // Remover estilos previos
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

    // Campos requeridos
    const campos = [
        { id: 'solicitanteNombre', nombre: 'Solicitante' },
        { id: 'solicitanteEmail', nombre: 'Correo electrónico' },
        { id: 'cantidad', nombre: 'Cantidad solicitada' },
        { id: 'ubicacionNombre', nombre: 'Ubicación' },
        { id: 'selectGestorNombre', nombre: 'Responsable' },
        { id: 'justificacion', nombre: 'Justificación' }
    ];

    campos.forEach(campo => {
        const input = document.getElementById(campo.id);
        const valor = input.value.trim();

        if (!valor) {
            valido = false;
            input.classList.add('is-invalid');

            // Mensaje personalizado
            const feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            feedback.textContent = `El campo "${campo.nombre}" es obligatorio.`;
            input.parentNode.appendChild(feedback);
        } else if (campo.id === 'cantidad' && (parseInt(valor) < 1 || isNaN(valor))) {
            valido = false;
            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            feedback.textContent = `Debe ingresar una cantidad válida (mínimo 1).`;
            input.parentNode.appendChild(feedback);
        } else if (campo.id === 'solicitanteEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            valido = false;
            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            feedback.textContent = `Ingrese un correo electrónico válido.`;
            input.parentNode.appendChild(feedback);
        }
    });
    return valido;
}