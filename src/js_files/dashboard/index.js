$(document).ready(function () {
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
            
            console.log('Categorías cargadas:', categorias.length);
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
    
    console.log('Cargando catálogo con:', data);
    
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
            console.log('Respuesta API - Productos encontrados:', response.data ? response.data.length : 0);
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
                <button class="btn btn-solicitar" 
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
    toastr.success(`Solicitud enviada para: ${productName}`, 'Éxito');
    
    // Ejemplo de llamada a API para solicitar producto
    $.ajax({
        url: URL_BACKEND + "/solicitudes",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            id_inventario: productId,
            cantidad: 1,
            observaciones: "Solicitud desde catálogo"
        }),
        success: function (response) {
            if (response.success) {
                toastr.success(`Solicitud para ${productName} enviada correctamente`, 'Éxito');
            } else {
                toastr.warning(response.message || "No se pudo completar la solicitud", "Atención");
            }
        },
        error: function (xhr) {
            toastr.error("Error al enviar solicitud: " + xhr.responseText, "Error");
        }
    });
}