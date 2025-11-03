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
function loadTarjeta() {
    $.ajax({
        url: URL_BACKEND + '/calibracion/tarjetas',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data['data'].hasOwnProperty('finalizado')){
                $("#total_completado").text(data['data']['finalizado']);
                $("#total_pausa").text(data['data']['pausado']);
                $("#total_espera").text(data['data']['espera']);
                $("#total_cancelado").text(data['data']['cancelado']);
                $("#por_asignar").text(data['data']['ingresado']);
                total_espera = (data['data']['certificado'] + data['data']['ingresado']);
                $("#progreso_certificado").text(data['data']['certificado'] +'/'+ data['data']['espera']);
                $("#progress_bar_certificado").css("width",  barPorcentaje(data['data']['certificado'], data['data']['espera']) + "%");
                $("#en_proceso").text(data['data']['calibrando']);
                para_procesar = (data['data']['certificado'] + data['data']['calibrando'] + data['data']['pausado']);
                $("#progreso_proceso").text(data['data']['calibrando']+'/'+ para_procesar);
                $("#progress_bar_proceso").css("width",  barPorcentaje(data['data']['calibrando'], para_procesar) + "%");
                $("#revisionAdmin").text(data['data']['revisionAdmin']);
                $("#revisionTec").text(data['data']['revisionTec']);
                $("#para_entregar").text(data['data']['retiro']);
                //countNumerico();
            }
        },
        error: function(error) {
            console.error('Error al cargar datos:', error);
        }
    });
}


$('.search-change').on('change', function() {
    tableEstados.destroy();
    loadDataTable();
});


// Tabla con datos de calibracion
function loadDataTable() {
    const storedLimit = localStorage.getItem('datatable_limit');
    const pageLength = storedLimit ? parseInt(storedLimit) : 10;
    timeInterval = timereload()
    tableEstados = $('#tablaHistorialAsignacion').DataTable({
        processing: true,
        serverSide: true,
        pageLength: pageLength,
        autoFill: false,
        searching: false,
        ordering:  false,
        language: españolDataTable,
        ajax: {
            url: URL_BACKEND + '/asignacion/historial',
            type: "GET",
            dataType: "json",
            data: function (d) {
                const fields = [
                    { key: 'id', selector: '#search-id' },
                    { key: 'producto', selector: '#search-producto' },
                    { key: 'marca', selector: '#search-marca' },
                    { key: 'modelo', selector: '#search-modelo' },
                    { key: 'serie', selector: '#search-serie' },
                    { key: 'categoria', selector: '#search-categoria' },
                    { key: 'estado_dispositivo', selector: '#search-estado' },  // es un <select>
                    { key: 'ubicacion', selector: '#search-ubicacion' },
                    { key: 'responsable', selector: '#search-responsable' },
                    { key: 'tipo_adquisicion', selector: '#search-tipo-adquisicion' },
                    { key: 'nro_documento', selector: '#search-nro-documento' },
                    { key: 'codigo_usach', selector: '#search-codigo-usach' },
                    { key: 'fecha_compra', selector: '#search-fecha-compra' },
                    { key: 'fecha_ingreso', selector: '#search-fecha-ingreso' },
                ];
                var object_search = {};
                object_search["limit"] = d.length;
                object_search["offset"] = d.start;
                object_search["draw"] = d.draw;
                //object_search['estado'] = $("#select-estado").val();

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
            { data: 'nombre_producto',
                render: function(data) {
                    return `<span class="text-capitalize" style="max-width: 200px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nombre_marca',
                render: function(data) {
                    return `<span class="text-uppercase" style="max-width: 80px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nombre_modelo',
                render: function(data) {
                    return `<span style="max-width: 100px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nro_serie',
                render: function(data) {
                    return `<span style="max-width: 120px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nombre_categoria',
                render: function(data) {
                    return `<span class="text-capitalize" style="max-width: 150px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nombre_estado_dispositivo',
                render: function(data) {
                    return `<span class="">${data || ''}</span>`;
                }
            },
            { data: 'nombre_ubicacion',
                render: function(data) {
                    return `<span class="text-capitalize" style="max-width: 150px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nombre_responsable',
                render: function(data) {
                    return `<span class="text-capitalize" style="max-width: 180px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nombre_tipo_adquisicion',
                render: function(data) {
                    return `<span class="text-capitalize" style="max-width: 120px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'nro_documento',
                render: function(data) {
                    return `<span style="max-width: 100px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'codigo_usach',
                render: function(data) {
                    return `<span style="max-width: 100px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data || ''}</span>`;
                }
            },
            { data: 'fecha_ingreso',
                render: function(data) {
                    return data ? data : '-';
                }
            },
            { title: '', 
                render: function (data, type, row) {
                    return `
                    <div class="d-flex">
                        <a href="#" class="btn btn-outline-success shadow btn-xs sharp me-1 ver-detalle" title='Ver detalle' ><i class='icon-magnifier'></i></a>
                        <a href="#" class="btn btn-outline-purple shadow btn-xs sharp me-1 print-etiqueta" title='Imprimir etiqueta'><i class="fa fa-print"></i></a>
                        ${row['estado'] < 4 && row['estado'] != 0 ? '<a href="#" class="btn btn-outline-danger shadow me-1 btn-xs sharp cancelar" title="Cancelar proceso"><i class="bi bi-x-octagon"></i></a>' : ''}
                    </div>`;
                },
                "searchable": false,
                "orderable": false
            }
        ],
        createdRow: function (row, data, index) {
            if(data['estado'] > 0 && data['estado'] != 6 && data['estado'] != 5 && data['fecha_retiro'] != null){
                var fecha_final = data['fecha_retiro']
                diasDif = difFechaActual(fecha_final)
                if(diasDif <= 0){
                    $('td', row).addClass('text-danger');   //add class to row
                    $('td', row).css('font-weight', 'bold');  //add style to cell in third column
                }
                else if(0 > diasDif && diasDif <= 2){
                    $('td', row).addClass('text-warning');   //add class to row
                    $('td', row).css('font-weight', 'bold');  //add style to cell in third column
                }
            }   
         },
    });
    tableEstados.on('length.dt', function(e, settings, len) {
        localStorage.setItem('datatable_limit', len); // guarda el valor en localStorage
    });
}

$(window).off('hashchange');
$(window).on('hashchange', function() { 
    clearInterval(timeInterval);
});

function timereload(){
    return setInterval(function(){
        console.log("recargo la tabla");
        $('#tablaHistorialAsignacion').DataTable().ajax.reload();
    }, 300000);
}


function barPorcentaje(numerador,denominador){
    return porcentaje = (numerador / denominador) * 100;
}

function searchValid(value) {
    return value !== undefined && value !== null && value.trim() !== '';
}


$('#tablaHistorialAsignacion').on('click', 'a.ver-detalle', function () {
    let data_row = tableEstados.row($(this).parents('tr')).data();
    showModalDetalleCalibracion(data_row);
});

$('#tablaHistorialAsignacion').on('click', 'a.print-etiqueta', function () {
    let data_row = tableEstados.row($(this).parents('tr')).data();
    printTarjetaIdentificacion(data_row,'modalPrintIngreso','tarjetaIngreso');
});

$('#tablaHistorialAsignacion').on('click', 'a.cancelar', function () {
    let data_row = tableEstados.row($(this).parents('tr')).data();
    Swal.fire({
        title: "Cancelar Calibración",
        text: "Está seguro que quieres cancelar esta calibración? No podrás revertir esta decisión!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        cancelButtonText: "Volver",
        confirmButtonText: "Si, Cancelar!"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                text: "Ingrese una observación por el cual se cancelara la calibración",
                input: "text",
                inputAttributes: {
                  autocapitalize: "off"
                },
                showCancelButton: true,
                confirmButtonText: "Confirmar",
                showLoaderOnConfirm: true,
                preConfirm: async (observacion) => {
                    try {
                        var datos = {
                            id: data_row['id'],
                            observacion: observacion,
                            estado: 0
                        };
                        const response = await 
                        $.ajax({
                            type: "PUT",
                            url: URL_BACKEND + "/cambiarestado",
                            dataType: "json",
                            data: datos
                        });

                        if (!response.success) {
                        return Swal.showValidationMessage(`
                            ${await response.message}
                        `);
                        }
                        return response.data;
                    } catch (error) {
                        Swal.showValidationMessage(`
                            Problemas con la solicitud: ${error}
                        `);
                    } 
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Estado Actualizado",
                        text: `Estado del id: ${result.value} de calibración fue modificado con exito`,
                        icon: "success",
                    });
                    tableEstados.destroy()
                    loadDataTable()
                }
            });
        }
    });
});


// Abrir modal para agregar
function openAddModal() {
    editingId = null;
    currentDetailId = null;
    document.getElementById('modalTitle').textContent = 'Asignar Producto';
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceId').value = '';
    document.getElementById('archivosList').innerHTML = '';
    
    // Establecer fecha actual por defecto
    document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
    //document.getElementById('fechaCompra').value = new Date().toISOString().split('T')[0];
    
    // Limpiar validaciones
    document.getElementById('deviceForm').classList.remove('was-validated');

    cargarSelector("categoria", null, "/categorias/activas", 'Seleccione una Categoría');
    cargarSelector("estado", null, "/estado_dispositivo", 'Seleccione un Estado');
    cargarSelector("responsable", null, "/responsable/activas", 'Seleccione un Responsable');
    cargarSelector("ubicacion", null, "/ubicacion/activas", 'Seleccione una Ubicación');
    cargarSelector("adquisicion", null, "/tipo_adquisicion/activas", 'Seleccione una forma de adquisicion');

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
        cargarSelector("producto", $(this).val(), "/productos/categoria", 'Seleccione un Equipo');
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

    $("#estado").off("change").change(function(){
        $("#divBaja").addClass("d-none");
        if (this.value == 4) { // Si el valor es "De Baja"
            $("#divBaja").removeClass("d-none");
            document.getElementById('fechaBaja').value = new Date().toISOString().split('T')[0];
        }
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

function guardarDispositivo() {
    // Validar formulario
    let form = document.getElementById('deviceForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    // Capturar datos del formulario
    let data = {
        id_producto: $("#producto").val(),
        id_modelo: $("#modelo").val(),
        nro_serie: $("#serie").val(),
        id_marca: $("#marca").val(),
        id_categoria: $("#categoria").val(),
        id_ubicacion: $("#ubicacion").val(),
        id_departamento: $("#departamento").val(),
        id_responsable: $("#responsable").val(),
        id_estado: $("#estado").val(),
        id_tipo_adquisicion: $("#adquisicion").val(),
        fecha_ingreso: $("#fechaIngreso").val(),
        fecha_compra: $("#fechaCompra").val() || null,
        fecha_baja: $("#fechaBaja").val() || null,
        codigo_usach: $("#invetario").val(),
        nro_documento: $("#metodoCompra").val(),
        estado: 1
    };

    // Llamada AJAX al backend
    $.ajax({
        url: URL_BACKEND + "/asignacion/insert",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                toastr.success("Dispositivo agregado correctamente", "Éxito");
                $("#deviceModal").modal("hide");
                tableEstados.ajax.reload(); // refrescar la tabla
            } else {
                toastr.warning(response.message || "No se pudo guardar el dispositivo", "Atención");
            }
        },
        error: function (xhr) {
            toastr.error("Error al guardar dispositivo: " + xhr.responseText, "Error");
        }
    });
}


$(document).on('click', '#generatePdf', function () {
    $.ajax({
        url: URL_BACKEND + '/generate_pdf',
        method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        headers: {
            'Authorization': token,
            "Accept": "application/pdf",
            "Access-Control-Allow-Origin": "*"
        },
        success: function (response, status, xhr) {
            var blob = new Blob([response], { type: 'application/pdf' });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "documento.pdf";
            link.click();


            $('#message').html('<div class="alert alert-success">PDF generado y descargado con éxito</div>');
        },
        error: function (xhr, status, error) {
            $('#message').html('<div class="alert alert-danger">Error al generar el PDF: ' + error + '</div>');
        }
    });
});

