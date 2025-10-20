var tableEstados;
//var object_search = {};

$(document).ready(function() {
    perfil = JSON.parse(sessionStorage.getItem('usuario'))['perfil']
    /*if(perfil == 'admin'){
        $(".tarjeta_Acciones").removeClass( "d-none" )
    }else if(perfil == 'met'){
        $(".tarjeta_proceso").removeClass( "d-none" ).addClass('col-6')
        $('.tarjeta_cancelado').removeClass( "d-none" )
    }else if(perfil == 'recept'){
        $(".tarjeta_ingreso").removeClass( "d-none" )
        $(".tarjeta_retiro").removeClass( "d-none" )
    }else if(perfil == 'respon'){
        $(".tarjeta_ingreso").removeClass( "d-none" )
        $(".tarjeta_proceso").removeClass( "d-none" )
        $(".tarjeta_revision_tec").removeClass( "d-none" )
        $(".tarjeta_retiro").removeClass( "d-none" )
    }*/
    //loadTarjeta()
    //cargarEstadosTabla()
    loadDataTable()
});

//Tarjetas de estados
// function loadTarjeta() {
//     $.ajax({
//         url: URL_BACKEND + '/calibracion/tarjetas',
//         method: 'GET',
//         dataType: 'json',
//         success: function(data) {
//             if (data['data'].hasOwnProperty('finalizado')){
//                 $("#total_completado").text(data['data']['finalizado']);
//                 $("#total_pausa").text(data['data']['pausado']);
//                 $("#total_espera").text(data['data']['espera']);
//                 $("#total_cancelado").text(data['data']['cancelado']);
//                 $("#por_asignar").text(data['data']['ingresado']);
//                 total_espera = (data['data']['certificado'] + data['data']['ingresado']);
//                 $("#progreso_certificado").text(data['data']['certificado'] +'/'+ data['data']['espera']);
//                 $("#progress_bar_certificado").css("width",  barPorcentaje(data['data']['certificado'], data['data']['espera']) + "%");
//                 $("#en_proceso").text(data['data']['calibrando']);
//                 para_procesar = (data['data']['certificado'] + data['data']['calibrando'] + data['data']['pausado']);
//                 $("#progreso_proceso").text(data['data']['calibrando']+'/'+ para_procesar);
//                 $("#progress_bar_proceso").css("width",  barPorcentaje(data['data']['calibrando'], para_procesar) + "%");
//                 $("#revisionAdmin").text(data['data']['revisionAdmin']);
//                 $("#revisionTec").text(data['data']['revisionTec']);
//                 $("#para_entregar").text(data['data']['retiro']);
//                 //countNumerico();
//             }
//         },
//         error: function(error) {
//             console.error('Error al cargar datos:', error);
//         }
//     });
// }


$('.search-change').on('change', function() {
    tableEstados.destroy();
    loadDataTable();
});


// Tabla con datos de calibracion
function loadDataTable() {
    tableEstados = $('#tablaInventarioProductos').DataTable({
        processing: true,
        serverSide: true,
        autoFill: false,
        searching: false,
        ordering:  false,
        language: españolDataTable,
        ajax: {
            url: URL_BACKEND + '/inventario/all',
            type: "GET",
            dataType: "json",
            data: function (d) {
                const fields = [
                    { key: 'sku', selector: '#search-sku' },
                    { key: 'producto', selector: '#search-producto' },
                    { key: 'marca', selector: '#search-marca' },
                    { key: 'modelo', selector: '#search-modelo' },
                    { key: 'stock', selector: '#search-stock' },
                    { key: 'ubicacion', selector: '#search-ubicacion' },
                    { key: 'responsable', selector: '#search-responsable' },
                    { key: 'tipo_adquisicion', selector: '#search-tipo-adquisicion' },
                    { key: 'nro_documento', selector: '#search-nro-documento' },
                ];
                var object_search = {};
                object_search["limit"] = d.length;
                object_search["offset"] = d.start;
                object_search["draw"] = d.draw;

                fields.forEach(field => {
                    const value = $(field.selector).val();
                    if (searchValid(value)) {
                        object_search[field.key] = value;
                    }
                });

                return object_search;
            },
            dataFilter: function (result) {
                var result = jQuery.parseJSON(result);
                data = {
                    recordsFiltered: result.count_rows,
                    recordsTotal: result.count_rows,
                    aaData: result.data
                }
                return JSON.stringify(data);
            },
        },
        columns: [
            { 
                data: 'sku',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                data: 'nombre_producto',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                data: 'nombre_marca',
                render: function(data) {
                    return data || '';
                }
            },
            { 
                data: 'nombre_modelo',
                render: function(data) {
                    return data || 'Sin Modelo';
                }
            },
            { 
                data: 'stock',
                render: function(data) {
                    return data || '0';
                }
            },
            { 
                data: 'disponible',
                render: function(data) {
                    if (data == 1) {
                        return `<span class="badge bg-success" title="Disponible para solicitudes">
                                    <i class="bi bi-check-circle me-1"></i>Si para solicitudes
                                </span>`;
                    } else {
                        return `<span class="badge bg-secondary" title="No disponible para solicitudes">
                                    <i class="bi bi-slash-circle me-1"></i>No para solicitudes
                                </span>`;
                    }
                }
            },
            { 
                data: 'nombre_ubicacion',
                render: function(data) {
                    return data || '';
                }
            },
            { title: '', 
                render: function (data, type, row) {
                    return `
                    <div class="d-flex">
                        <a href="#" class="btn btn-outline-success shadow btn-xs sharp me-1 ver-detalle" title='Ver detalle' ><i class='icon-magnifier'></i></a>
                        ${row['estado'] < 4 && row['estado'] != 0 ? '<a href="#" class="btn btn-outline-danger shadow me-1 btn-xs sharp cancelar" title="Cancelar proceso"><i class="bi bi-x-octagon"></i></a>' : ''}
                    </div>`;
                },
                "searchable": false,
                "orderable": false
            }
        ],
        // createdRow: function (row, data, index) {
        //     if(data['estado'] > 0 && data['estado'] != 6 && data['estado'] != 5 && data['fecha_retiro'] != null){
        //         var fecha_final = data['fecha_retiro']
        //         diasDif = difFechaActual(fecha_final)
        //         if(diasDif <= 0){
        //             $('td', row).addClass('text-danger');   //add class to row
        //             $('td', row).css('font-weight', 'bold');  //add style to cell in third column
        //         }
        //         else if(0 > diasDif && diasDif <= 2){
        //             $('td', row).addClass('text-warning');   //add class to row
        //             $('td', row).css('font-weight', 'bold');  //add style to cell in third column
        //         }
        //     }   
        //  },
    });
}

function searchValid(value) {
    return value !== undefined && value !== null && value.trim() !== '';
}

$('#tablaInventarioProductos').on('click', 'a.ver-detalle', function () {
    let data_row = tableEstados.row($(this).parents('tr')).data();
    showModalDetalleCalibracion(data_row);
});

// Abrir modal para agregar
function openAddModal() {
    editingId = null;
    currentDetailId = null;
    document.getElementById('modalTitle').textContent = 'Agregar al Inventario';
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceId').value = '';
    document.getElementById('archivosList').innerHTML = '';
    
    // Establecer fecha actual por defecto
    document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
    document.getElementById('fechaCompra').value = new Date().toISOString().split('T')[0];
    
    // Limpiar validaciones
    document.getElementById('deviceForm').classList.remove('was-validated');

    cargarSelector("categoria", null, "/categorias/activas", 'Seleccione una Categoría');
    cargarSelector("responsable", null, "/responsable/activas", 'Seleccione un Responsable');
    cargarSelector("ubicacion", null, "/ubicacion/activas", 'Seleccione una Ubicación');
    cargarSelector("adquisicion", null, "/adquisicion/activas", 'Seleccione una forma de adquisicion');

    // Inicializo Select2 después de cargar el modal
    setTimeout(() => {
        $("#producto, #marca, #modelo, #ubicacion, #adquisicion").select2({
            dropdownParent: $("#deviceModal"), // importante para que funcione dentro del modal
            tags: true, // permite agregar nuevos valores
            placeholder: "Escriba o seleccione una opción",
            allowClear: true,
            width: "100%"
        });
    }, 300);

    // Encadenado de selects
    $("#categoria").off("change").change(function(){
        const categoriaId = $(this).val();

        if (!categoriaId || categoriaId === '') {
            $('#producto').empty().trigger('change').prop('disabled', true);
            $('#marca').empty().trigger('change').prop('disabled', true);
            $('#modelo').empty().trigger('change').prop('disabled', true);
            return;
        }

        cargarSelector("producto", categoriaId, "/productos/categoria", 'Seleccione un Equipo');
        $('#producto').prop('disabled', false);
        $('#marca').empty().trigger('change').prop('disabled', true);
        $('#modelo').empty().trigger('change').prop('disabled', true);
    });
    
    $("#producto").off("change").change(function(){
        let productoId = $(this).val();
        if (productoId) {
            cargarSelector("marca", productoId, "/marca/producto", 'Seleccione una Marca');
            $('#marca').prop('disabled', false);
        } else {
            $('#marca').empty().trigger('change').prop('disabled', true);
            $('#modelo').empty().trigger('change').prop('disabled', true);
        }
    });

    $("#marca").off("change").change(function(){
        let marcaId = $(this).val();
        let productoId = $("#producto").val();
        if (marcaId && productoId) {
            cargarSelector("modelo", { producto: productoId, marca: marcaId }, "/modelo/producto_marca", 'Seleccione un Modelo');
            $('#modelo').prop('disabled', false);
        } else {
            $('#modelo').empty().trigger('change').prop('disabled', true);
        }
    });

    $("#modelo").off("change").change(function(){
        let marcaId = $("#marca").val();
        let productoId = $("#producto").val();
        verificarInventarioExistente(productoId, marcaId);
    });
}


function cargarSelector(selectorId, dataId, url, placeholder) {
    $.ajax({
        url: URL_BACKEND + url,
        type: 'GET',
        data: typeof dataId === "object" ? dataId : { id: dataId },
        success: function(respuesta) {
            let $select = $('#' + selectorId);
            $select.empty();
            respuesta = respuesta["data"];

            if (respuesta.length) {
                if (respuesta.length > 1) {
                    $select.append(new Option(placeholder, '', true, false)).prop('disabled', false);
                }
                $.each(respuesta, function(i, item) {
                    $select.append(new Option(item.nombre, item.id, false, false));
                });
            } else {
                $select.append(new Option('No existe data disponible', '', true, true)).prop('disabled', true);
            }

            $select.trigger('change');
        },
        error: function() {
            toastr.warning("información no encontrada", "Error");
        }
    });
}

function guardarInventario() {
    const idInventario = $('#deviceForm').data('id-inventario');
    // Validar formulario
    let form = document.getElementById('deviceForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    // Capturar datos del formulario
    let data = {
        id_producto: $("#producto").val(),
        id_modelo: $("#modelo").val() ? $("#modelo").val() : null,
        id_marca: $("#marca").val(),
        stock: parseInt($("#stock").val()) || 0,
        qty: parseInt($("#qty").val()) || 0,
        id_ubicacion: $("#ubicacion").val(),
        id_responsable: $("#responsable").val(),
        id_tipo_adquisicion: $("#adquisicion").val(),
        fecha_ingreso: $("#fechaIngreso").val(),
        fecha_compra: $("#fechaCompra").val() || null,
        nro_documento: $("#metodoCompra").val(),
        observacion: $("#observaciones").val(),
        disponible : $('#disponibleSwitch').is(':checked') ? 1 : 0,
        estado: 1
    };
    
    if (idInventario) {
        data.id = idInventario;

        $.ajax({
            url: URL_BACKEND + "/inventario/update",
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    toastr.success("Producto agregado al inventario correctamente", "Éxito");
                    $("#deviceModal").modal("hide");
                    tableEstados.ajax.reload(); // refrescar la tabla
                } else {
                    toastr.warning(response.message || "No se pudo agregar el producto", "Atención");
                }
            },
            error: function (xhr) {
                toastr.error("Error al guardar dispositivo: " + xhr.responseText, "Error");
            }
        });
    } else {
        // Llamada AJAX al backend
        $.ajax({
            url: URL_BACKEND + "/inventario/insert",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    toastr.success("Producto agregado al inventario correctamente", "Éxito");
                    $("#deviceModal").modal("hide");
                    tableEstados.ajax.reload(); // refrescar la tabla
                } else {
                    toastr.warning(response.message || "No se pudo agregar el producto", "Atención");
                }
            },
            error: function (xhr) {
                toastr.error("Error al guardar dispositivo: " + xhr.responseText, "Error");
            }
        });
    }
}



function verificarInventarioExistente(productoId, marcaId) {
    const idDepartamento = JSON.parse(sessionStorage.getItem('departamento'))?.id;
    
    if (!productoId || !marcaId || !idDepartamento) {
        return;
    }
    
    // Obtener el modelo (puede ser null si no está seleccionado o está deshabilitado)
    const { modeloDisponible, modeloId } = obtenerDatosModelo();
    
    const datosVerificacion = {
        producto: productoId,
        marca: marcaId,
        departamento: idDepartamento
    };

    if (modeloId !== null && modeloId !== undefined && modeloId !== '') {
        datosVerificacion.modelo = modeloId;
    }
    
    if (modeloDisponible) {
        $.ajax({
            url: URL_BACKEND + '/inventario/verificar',
            type: 'GET',
            data: datosVerificacion,
            success: function(response) {
                if (response.success && response.data.length > 0) {
                    const data = response.data[0];

                    Swal.fire({
                        title: 'Producto ya inventariado',
                        html: `
                            <p>¿Deseas agregar stock a este producto existente?</p>
                            <div style="text-align:left; margin-top:10px;">
                                <strong>SKU:</strong> ${data.sku}<br>
                                <strong>Producto:</strong> ${data.nombre_producto}<br>
                                <strong>Marca:</strong> ${data.nombre_marca}<br>
                                <strong>Modelo:</strong> ${data.nombre_modelo ? data.nombre_modelo : 'Sin Modelo'}<br>
                                <strong>Stock actual:</strong> ${data.stock}<br>
                                <strong>Fecha creación:</strong> ${data.created_at}
                            </div>
                        `,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, agregar stock',
                        cancelButtonText: 'No, cancelar',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        allowOutsideClick: false,  // Evita cerrar al hacer clic fuera
                        allowEscapeKey: false     // Evita cerrar con tecla Escape
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $('#basicInfoSection label[for="stock"]').text('Stock inicial');

                            if ($('#qty').length === 0) {
                                const qtyInput = `
                                    <div class="col-md-4">
                                        <label for="qty" class="form-label">Agregar Cantidad (qty)</label>
                                        <input type="number" class="form-control" id="qty" min="0" value="0">
                                        <div class="invalid-feedback">Por favor ingrese una cantidad</div>
                                    </div>
                                `;                            
                                $('#stock').closest('.col-md-4').after(qtyInput);
                            }

                            // Aquí llamas a tu función o API para agregar stock
                            Swal.fire({
                                icon: 'success',
                                title: 'Agregado',
                                text: 'El stock se ha actualizado correctamente.'
                            });
                            $('#deviceForm').attr('data-id-inventario', data.id);
                            $('#modalTitle').text('Actualizar Inventario - SKU: ' + data.sku);
                            $('#stock').val(data.stock); // Actualizar el campo stock con el valor existente
                            $('#stock').prop('disabled', true);

                            $('#categoria').prop('disabled', true);
                            $('#producto').prop('disabled', true);
                            $('#marca').prop('disabled', true);
                            $('#modelo').prop('disabled', true);
                            if (data.disponible == 1) {
                                $('#disponibleSwitch').prop('checked', true);
                                $('#disponibleSwitchLabel').text('Disponible');
                            } else {
                                $('#disponibleSwitch').prop('checked', false);
                                $('#disponibleSwitchLabel').text('No disponible');
                            }
                        }else{
                            // Si el usuario cancela, limpiar los campos
                            $('#categoria').trigger('change');
                            $('#producto').empty().trigger('change').prop('disabled', true);
                            $('#marca').empty().trigger('change').prop('disabled', true);
                            $('#modelo').empty().trigger('change').prop('disabled', true);
                        }
                    });
                }
            },
            error: function(error) {
                console.error('Error al verificar inventario:', error);
            }
        });
    }
}



function obtenerDatosModelo() {
    const $modelo = $('#modelo');

    // Si el modelo está deshabilitado, retornar null
    if ($modelo.prop('disabled')) {
        return { modeloDisponible: true, modeloId: null };;
    }
    
    // Si el modelo está vacío o no tiene valor seleccionado, retornar null
    if (!$modelo.val() || $modelo.val() === '' || $modelo.val() === null) {
        return { modeloDisponible: false, modeloId: null };
    }
    
    // Si llegamos aquí, el modelo tiene un valor válido
    return { modeloDisponible: true, modeloId: $modelo.val() };
}


// Restaurar formulario al cerrar el modal
$('#deviceModal').on('hidden.bs.modal', function () {
    $('#deviceForm').removeAttr('data-id-inventario');
    $('#deviceForm').removeData('id-inventario');
    $('#modalTitle').text('Agregar al Inventario');
    $('#basicInfoSection label[for="stock"]').text('Stock');
    $('#qty').closest('.col-md-4').remove();
    $('#categoria, #producto, #marca, #modelo, #stock').prop('disabled', false);
    $('#disponibleSwitch').prop('checked', true);
    $('#disponibleSwitchLabel').text('Disponible');
    $('#disponibleSwitch').attr('aria-checked', 'true');
});


// Evento para cambiar el estado del switch
$('#disponibleSwitch').on('change', function () {
    if ($(this).is(':checked')) {
        // Si está activado
        $('#disponibleSwitchLabel').text('Disponible');
        $(this).attr('aria-checked', 'true');
    } else {
        // Si está desactivado
        $('#disponibleSwitchLabel').text('No disponible');
        $(this).attr('aria-checked', 'false');
    }
});