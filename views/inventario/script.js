// Variables globales
let devices = [];
let table;
let editingId = null;
let deviceFiles = {};
let currentDetailId = null;

$(document).ready(function() {


    alert('Bienvenido al sistema de inventario USACH');
    loadDevices();
    initializeTable();
    initializeFilters();
    loadSampleData();
    updateStatistics();
    
    // Inicializar tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

}); 


// Cargar dispositivos desde localStorage
function loadDevices() {
    const stored = localStorage.getItem('inventario_devices');
    if (stored) {
        devices = JSON.parse(stored);
    }
    
    const storedFiles = localStorage.getItem('inventario_files');
    if (storedFiles) {
        deviceFiles = JSON.parse(storedFiles);
    }
}

// Guardar dispositivos en localStorage
function saveDevices() {
    localStorage.setItem('inventario_devices', JSON.stringify(devices));
    localStorage.setItem('inventario_files', JSON.stringify(deviceFiles));
}

// Inicializar DataTable
function initializeTable() {
    table = $('#devicesTable').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        responsive: true,
        pageLength: 10,
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: 5, // Estado
                render: function(data, type, row) {
                    return getStatusBadge(data);
                }
            },
            {
                targets: 9, // Precio
                render: function(data, type, row) {
                    return data ? `$${parseFloat(data).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '-';
                }
            },
            {
                targets: 10, // Archivos
                render: function(data, type, row) {
                    const files = deviceFiles[row[0]] || [];
                    if (files.length === 0) return '-';
                    
                    const images = files.filter(f => f.type.startsWith('image/')).length;
                    const docs = files.filter(f => !f.type.startsWith('image/')).length;
                    
                    let html = '';
                    if (images > 0) {
                        html += `<span class="badge bg-info me-1"><i class="fas fa-image"></i> ${images}</span>`;
                    }
                    if (docs > 0) {
                        html += `<span class="badge bg-secondary"><i class="fas fa-file"></i> ${docs}</span>`;
                    }
                    return html;
                }
            },
            {
                targets: 11, // Acciones
                orderable: false,
                render: function(data, type, row) {
                    return `
                        <div class="btn-group" role="group">
                            <button class="btn btn-info btn-sm btn-action" onclick="viewDevice(${row[0]})" 
                                    data-bs-toggle="tooltip" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-warning btn-sm btn-action" onclick="editDevice(${row[0]})" 
                                    data-bs-toggle="tooltip" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm btn-action" onclick="deleteDevice(${row[0]})" 
                                    data-bs-toggle="tooltip" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        drawCallback: function() {
            // Reinicializar tooltips después de cada redibujado
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    });
    
    refreshTable();
}

// Inicializar filtros
function initializeFilters() {
    document.getElementById('filterMarca').addEventListener('change', applyFilters);
    document.getElementById('filterModelo').addEventListener('change', applyFilters);
    document.getElementById('filterEstado').addEventListener('change', applyFilters);
    document.getElementById('filterUbicacion').addEventListener('change', applyFilters);
    document.getElementById('filterCategoria').addEventListener('change', applyFilters);
    
    updateFilterOptions();
}

// Actualizar opciones de filtros
function updateFilterOptions() {
    const marcas = [...new Set(devices.map(d => d.marca))].sort();
    const modelos = [...new Set(devices.map(d => d.modelo))].sort();
    const ubicaciones = [...new Set(devices.map(d => d.ubicacion))].sort();
    
    updateSelectOptions('filterMarca', marcas);
    updateSelectOptions('filterModelo', modelos);
    updateSelectOptions('filterUbicacion', ubicaciones);
}

// Actualizar opciones de un select
function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Limpiar opciones excepto la primera
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Agregar nuevas opciones
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Restaurar valor seleccionado si existe
    if (options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Aplicar filtros
function applyFilters() {
    const marca = document.getElementById('filterMarca').value;
    const modelo = document.getElementById('filterModelo').value;
    const estado = document.getElementById('filterEstado').value;
    const ubicacion = document.getElementById('filterUbicacion').value;
    const categoria = document.getElementById('filterCategoria').value;
    
    table.columns(1).search(marca);
    table.columns(2).search(modelo);
    table.columns(4).search(categoria);
    table.columns(5).search(estado);
    table.columns(6).search(ubicacion);
    table.draw();
}

// Limpiar filtros
function clearFilters() {
    document.getElementById('filterMarca').value = '';
    document.getElementById('filterModelo').value = '';
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterUbicacion').value = '';
    document.getElementById('filterCategoria').value = '';
    
    table.search('').columns().search('').draw();
}

// Refrescar tabla
function refreshTable() {
    table.clear();
    
    devices.forEach(device => {
        table.row.add([
            device.id,
            device.marca,
            device.modelo,
            device.serie,
            device.categoria,
            device.estado,
            device.ubicacion,
            device.responsable,
            formatDate(device.fechaIngreso),
            device.precio,
            '', // Archivos - se renderiza en columnDefs
            '' // Acciones - se renderiza en columnDefs
        ]);
    });
    
    table.draw();
    updateFilterOptions();
    updateStatistics();
}

// Actualizar estadísticas
function updateStatistics() {
    const total = devices.length;
    const active = devices.filter(d => d.estado === 'Activo').length;
    const repair = devices.filter(d => d.estado === 'En Reparación').length;
    const totalValue = devices.reduce((sum, d) => sum + (parseFloat(d.precio) || 0), 0);
    
    document.getElementById('totalDevices').textContent = total;
    document.getElementById('activeDevices').textContent = active;
    document.getElementById('repairDevices').textContent = repair;
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

// Abrir modal para agregar
function openAddModal() {
    editingId = null;
    currentDetailId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Dispositivo';
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceId').value = '';
    document.getElementById('archivosList').innerHTML = '';
    
    // Establecer fecha actual por defecto
    document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
    
    // Limpiar validaciones
    document.getElementById('deviceForm').classList.remove('was-validated');
}

// Ver dispositivo
function viewDevice(id) {
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    currentDetailId = id;
    const files = deviceFiles[id] || [];
    
    let filesHtml = '';
    if (files.length > 0) {
        const images = files.filter(f => f.type.startsWith('image/'));
        const documents = files.filter(f => !f.type.startsWith('image/'));
        
        if (images.length > 0) {
            filesHtml += `
                <div class="detail-section">
                    <h6><i class="fas fa-images me-2"></i>Imágenes (${images.length})</h6>
                    <div class="image-gallery">
                        ${images.map(img => `
                            <img src="${img.data}" class="image-preview" 
                                 onclick="showImageModal('${img.data}', '${img.name}')" 
                                 title="${img.name}" alt="${img.name}">
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (documents.length > 0) {
            filesHtml += `
                <div class="detail-section">
                    <h6><i class="fas fa-file-alt me-2"></i>Documentos (${documents.length})</h6>
                    <div class="row">
                        ${documents.map(doc => `
                            <div class="col-md-6 mb-2">
                                <div class="file-item w-100">
                                    <i class="fas ${getFileIcon(doc.type)} file-icon"></i>
                                    <span>${doc.name}</span>
                                    <small class="text-muted ms-2">(${formatFileSize(doc.size)})</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    const content = `
        <div class="detail-section">
            <h6><i class="fas fa-info-circle me-2"></i>Información Básica</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="detail-row">
                        <div class="detail-label">ID:</div>
                        <div class="detail-value">${device.id}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Marca:</div>
                        <div class="detail-value">${device.marca}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Modelo:</div>
                        <div class="detail-value">${device.modelo}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Número de Serie:</div>
                        <div class="detail-value"><code>${device.serie}</code></div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Categoría:</div>
                        <div class="detail-value">${device.categoria}</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detail-row">
                        <div class="detail-label">Estado:</div>
                        <div class="detail-value">${getStatusBadge(device.estado)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Ubicación:</div>
                        <div class="detail-value">${device.ubicacion}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Responsable:</div>
                        <div class="detail-value">${device.responsable}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Fecha de Ingreso:</div>
                        <div class="detail-value">${formatDate(device.fechaIngreso)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Precio:</div>
                        <div class="detail-value">${device.precio ? '$' + parseFloat(device.precio).toLocaleString('en-US', {minimumFractionDigits: 2}) : 'No especificado'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        ${device.fechaCompra || device.proveedor || device.garantia ? `
            <div class="detail-section">
                <h6><i class="fas fa-shopping-cart me-2"></i>Información Comercial</h6>
                <div class="row">
                    <div class="col-md-4">
                        <div class="detail-row">
                            <div class="detail-label">Fecha de Compra:</div>
                            <div class="detail-value">${device.fechaCompra ? formatDate(device.fechaCompra) : 'No especificada'}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="detail-row">
                            <div class="detail-label">Proveedor:</div>
                            <div class="detail-value">${device.proveedor || 'No especificado'}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="detail-row">
                            <div class="detail-label">Garantía:</div>
                            <div class="detail-value">${device.garantia || 'No especificada'}</div>
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}
        
        ${device.observaciones ? `
            <div class="detail-section">
                <h6><i class="fas fa-sticky-note me-2"></i>Observaciones</h6>
                <div class="detail-row">
                    <div class="detail-value">${device.observaciones}</div>
                </div>
            </div>
        ` : ''}
        
        ${filesHtml}
    `;
    
    document.getElementById('detailContent').innerHTML = content;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}

// Editar desde vista de detalles
function editFromDetail() {
    if (currentDetailId) {
        bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
        setTimeout(() => {
            editDevice(currentDetailId);
        }, 300);
    }
}

// Editar dispositivo
function editDevice(id) {
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Dispositivo';
    
    // Llenar formulario
    document.getElementById('deviceId').value = device.id;
    document.getElementById('marca').value = device.marca;
    document.getElementById('modelo').value = device.modelo;
    document.getElementById('serie').value = device.serie;
    document.getElementById('categoria').value = device.categoria;
    document.getElementById('estado').value = device.estado;
    document.getElementById('ubicacion').value = device.ubicacion;
    document.getElementById('responsable').value = device.responsable;
    document.getElementById('fechaIngreso').value = device.fechaIngreso;
    document.getElementById('fechaCompra').value = device.fechaCompra || '';
    document.getElementById('proveedor').value = device.proveedor || '';
    document.getElementById('precio').value = device.precio || '';
    document.getElementById('garantia').value = device.garantia || '';
    document.getElementById('observaciones').value = device.observaciones || '';
    
    // Mostrar archivos existentes
    displayExistingFiles(id);
    
    // Limpiar validaciones
    document.getElementById('deviceForm').classList.remove('was-validated');
    
    new bootstrap.Modal(document.getElementById('deviceModal')).show();
}

// Mostrar archivos existentes
function displayExistingFiles(deviceId) {
    const files = deviceFiles[deviceId] || [];
    const container = document.getElementById('archivosList');
    
    if (files.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay archivos adjuntos</p>';
        return;
    }
    
    container.innerHTML = `
        <h6 class="mt-3 mb-2">Archivos existentes:</h6>
        <div class="existing-files">
            ${files.map((file, index) => `
                <div class="file-item">
                    <i class="fas ${getFileIcon(file.type)} file-icon"></i>
                    <span>${file.name}</span>
                    <small class="text-muted ms-2">(${formatFileSize(file.size)})</small>
                    <button type="button" class="btn-close ms-2" 
                            onclick="removeExistingFile(${deviceId}, ${index})" 
                            title="Eliminar archivo"></button>
                </div>
            `).join('')}
        </div>
    `;
}

// Eliminar archivo existente
function removeExistingFile(deviceId, fileIndex) {
    if (deviceFiles[deviceId]) {
        deviceFiles[deviceId].splice(fileIndex, 1);
        displayExistingFiles(deviceId);
        saveDevices();
        
        // Mostrar notificación
        Swal.fire({
            icon: 'success',
            title: 'Archivo eliminado',
            text: 'El archivo ha sido eliminado correctamente',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}

// Guardar dispositivo
function saveDevice() {
    const form = document.getElementById('deviceForm');
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Validar número de serie único
    const serie = document.getElementById('serie').value;
    const existingDevice = devices.find(d => d.serie === serie && d.id !== editingId);
    if (existingDevice) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ya existe un dispositivo con este número de serie'
        });
        return;
    }
    
    const deviceData = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        serie: serie,
        categoria: document.getElementById('categoria').value,
        estado: document.getElementById('estado').value,
        ubicacion: document.getElementById('ubicacion').value,
        responsable: document.getElementById('responsable').value,
        fechaIngreso: document.getElementById('fechaIngreso').value,
        fechaCompra: document.getElementById('fechaCompra').value,
        proveedor: document.getElementById('proveedor').value,
        precio: document.getElementById('precio').value,
        garantia: document.getElementById('garantia').value,
        observaciones: document.getElementById('observaciones').value
    };
    
    // Procesar archivos
    const fileInput = document.getElementById('archivos');
    const files = Array.from(fileInput.files);
    
    if (editingId) {
        // Editar dispositivo existente
        const deviceIndex = devices.findIndex(d => d.id === editingId);
        if (deviceIndex !== -1) {
            devices[deviceIndex] = { ...devices[deviceIndex], ...deviceData };
            
            // Agregar nuevos archivos a los existentes
            if (files.length > 0) {
                processFiles(files, editingId);
            } else {
                saveDevices();
                refreshTable();
                bootstrap.Modal.getInstance(document.getElementById('deviceModal')).hide();
                showSuccessMessage('Dispositivo actualizado correctamente');
            }
        }
    } else {
        // Crear nuevo dispositivo
        const newId = Math.max(...devices.map(d => d.id), 0) + 1;
        const newDevice = {
            id: newId,
            ...deviceData
        };
        
        devices.push(newDevice);
        
        // Procesar archivos para el nuevo dispositivo
        if (files.length > 0) {
            processFiles(files, newId);
        } else {
            saveDevices();
            refreshTable();
            bootstrap.Modal.getInstance(document.getElementById('deviceModal')).hide();
            showSuccessMessage('Dispositivo agregado correctamente');
        }
    }
}

// Procesar archivos
function processFiles(files, deviceId) {
    if (!deviceFiles[deviceId]) {
        deviceFiles[deviceId] = [];
    }
    
    let processedCount = 0;
    const totalFiles = files.length;
    
    files.forEach(file => {
        // Validar tamaño de archivo (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo muy grande',
                text: `El archivo "${file.name}" excede el tamaño máximo de 10MB`
            });
            processedCount++;
            if (processedCount === totalFiles) {
                finishFileSaving();
            }
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            deviceFiles[deviceId].push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            });
            
            processedCount++;
            if (processedCount === totalFiles) {
                finishFileSaving();
            }
        };
        reader.onerror = function() {
            processedCount++;
            if (processedCount === totalFiles) {
                finishFileSaving();
            }
        };
        reader.readAsDataURL(file);
    });
    
    function finishFileSaving() {
        saveDevices();
        refreshTable();
        bootstrap.Modal.getInstance(document.getElementById('deviceModal')).hide();
        showSuccessMessage(editingId ? 'Dispositivo actualizado correctamente' : 'Dispositivo agregado correctamente');
    }
}

// Eliminar dispositivo
function deleteDevice(id) {
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    Swal.fire({
        title: '¿Estás seguro?',
        html: `Se eliminará el dispositivo:<br><strong>${device.marca} ${device.modelo}</strong><br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-trash me-2"></i>Sí, eliminar',
        cancelButtonText: '<i class="fas fa-times me-2"></i>Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            devices = devices.filter(d => d.id !== id);
            delete deviceFiles[id];
            saveDevices();
            refreshTable();
            
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El dispositivo ha sido eliminado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

// Obtener badge de estado
function getStatusBadge(estado) {
    const statusClasses = {
        'Activo': 'status-activo',
        'Inactivo': 'status-inactivo',
        'En Reparación': 'status-reparacion',
        'Dado de Baja': 'status-baja'
    };
    return `<span class="badge ${statusClasses[estado] || 'bg-secondary'}">${estado}</span>`;
}

// Obtener icono de archivo
function getFileIcon(type) {
    if (type.startsWith('image/')) return 'fa-image';
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('word') || type.includes('document')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'fa-file-powerpoint';
    return 'fa-file';
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Mostrar imagen en modal
function showImageModal(imageSrc, imageName) {
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('modalImage').alt = imageName;
    new bootstrap.Modal(document.getElementById('imageModal')).show();
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: message,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

// Cargar datos de ejemplo
function loadSampleData() {
    if (devices.length === 0) {
        devices = [
            {
                id: 1,
                marca: 'Dell',
                modelo: 'Latitude 5520',
                serie: 'DL001234',
                categoria: 'Laptop',
                estado: 'Activo',
                ubicacion: 'Oficina Principal - Piso 2',
                responsable: 'Juan Pérez',
                fechaIngreso: '2024-01-15',
                fechaCompra: '2024-01-10',
                proveedor: 'TechStore SAC',
                precio: '1200.00',
                garantia: '3 años',
                observaciones: 'Laptop para desarrollo, 16GB RAM, SSD 512GB'
            },
            {
                id: 2,
                marca: 'HP',
                modelo: 'EliteDesk 800',
                serie: 'HP987654',
                categoria: 'Desktop',
                estado: 'Activo',
                ubicacion: 'Sala de Conferencias',
                responsable: 'María García',
                fechaIngreso: '2024-02-01',
                fechaCompra: '2024-01-28',
                proveedor: 'Computec Perú',
                precio: '800.00',
                garantia: '2 años',
                observaciones: 'PC de escritorio para presentaciones'
            },
            {
                id: 3,
                marca: 'Canon',
                modelo: 'PIXMA G3010',
                serie: 'CN456789',
                categoria: 'Impresora',
                estado: 'En Reparación',
                ubicacion: 'Área de Impresión',
                responsable: 'Carlos López',
                fechaIngreso: '2024-01-20',
                fechaCompra: '2024-01-18',
                proveedor: 'Canon Perú',
                precio: '250.00',
                garantia: '1 año',
                observaciones: 'Impresora multifuncional con sistema de tinta continua. Problema con el escáner.'
            },
            {
                id: 4,
                marca: 'Lenovo',
                modelo: 'ThinkPad X1 Carbon',
                serie: 'LN789012',
                categoria: 'Laptop',
                estado: 'Activo',
                ubicacion: 'Oficina Principal - Piso 3',
                responsable: 'Ana Rodríguez',
                fechaIngreso: '2024-03-01',
                fechaCompra: '2024-02-25',
                proveedor: 'Lenovo Store',
                precio: '1500.00',
                garantia: '3 años',
                observaciones: 'Laptop ejecutiva, ultraliviana'
            },
            {
                id: 5,
                marca: 'Samsung',
                modelo: 'Galaxy Tab S8',
                serie: 'SM345678',
                categoria: 'Tablet',
                estado: 'Inactivo',
                ubicacion: 'Almacén',
                responsable: 'Luis Mendoza',
                fechaIngreso: '2024-02-15',
                fechaCompra: '2024-02-10',
                proveedor: 'Samsung Store',
                precio: '600.00',
                garantia: '2 años',
                observaciones: 'Tablet para presentaciones móviles'
            }
        ];
        saveDevices();
        refreshTable();
    }
}