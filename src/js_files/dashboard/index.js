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
    cargarEstadosTabla()
    //loadDataTable()
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


cargarEstadosTabla = () => {
    const opciones = `
    <option value='[0,1,2,3,4,5,6,7,8]' selected>Todos</option>
      <option value="[0]">Cancelado</option>
      <option value="[1]">Ingresado</option>
      <option value="[2]">N° Asignado</option>
      <option value="[3]">Calibrando</option>
      <option value="[8]">Revisión Tec</option>
      <option value="[4]">Revisión Admin</option>
      <option value="[5]">Espera Retiro</option>
      <option value="[6]">Entregado</option>
      <option value="[7]">Pausado</option>
    `
    $("#select-estado").html(opciones);
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
    tableEstados = $('#tablaEstadoEquipos').DataTable({
        processing: true,
        serverSide: true,
        pageLength: pageLength,
        autoFill: false,
        searching: false,
        ordering:  false,
        language: españolDataTable,
        ajax: {
            url: URL_BACKEND + '/obtenerequipos',
            type: "GET",
            dataType: "json",
            data: function (d) {
                const fields = [
                    { key: 'id', selector: '#search-id' },
                    { key: 'cliente', selector: '#search-cliente' },
                    { key: 'equipo', selector: '#search-equipo' },
                    { key: 'marca', selector: '#search-marca' },
                    { key: 'modelo', selector: '#search-modelo' },
                    { key: 'serie', selector: '#search-serie' },
                    { key: 'certificado', selector: '#search-certificado' },
                    { key: 'orden', selector: '#search-orden' },
                ];
                var object_search = {};
                object_search["limit"] = d.length;
                object_search["offset"] = d.start;
                object_search["draw"] = d.draw;
                object_search['estado'] = $("#select-estado").val();

                fields.forEach(field => {
                    const value = $(field.selector).val();
                    if (searchValid(value)) {
                        object_search[field.key] = value;
                    }
                });

                const pendiente = $('#search-pendiente').is(':checked');
                if (pendiente) {
                    object_search['pendiente'] = 1;
                }
                if (!object_search.hasOwnProperty('estado'))
                    object_search["estado"] ='[0,1,2,3,4,5,6,7,8]';
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
            {data: 'id' },
            {data: 'nombre_cliente', 
                render: function(data, type, row) {
                  return `<span class="text-capitalize" style="max-width: 300px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data}</span>`;
                } 
            },
            {data: 'nombre_equipo', 
                render: function(data, type, row) {
                  return `<span class="text-capitalize" style="max-width: 200px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data}</span>`;
                } 
            },
            {data: 'nombre_marca', 
                render: function(data, type, row) {
                  return `<span class="text-uppercase" style="max-width: 80px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data}</span>`;
                } 
            },
            {data: 'nombre_modelo', 
                render: function(data, type, row) {
                  return `<span style="max-width: 100px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data}</span>`;
                } 
            },
            {data: 'serie', 
                render: function(data, type, row) {
                  return `<span style="max-width: 100px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data}</span>`;
                } 
            },
            {data: function (element) {
                return `<div class="tbl-progress-box">
                <div class="progress border">
                    <div class="border progress-bar-striped bg-${element['estado_equipo']['color']} progress-animated" style="width:${element['estado_equipo']['progreso']}%; height:5px; border-radius:4px;" role="progressbar"></div>
                </div>
                <span class="text-${element['estado_equipo']['color']}">${element['estado_equipo']['progreso']}%</span>
                </div>`
            }},
            {data: function (element) {
                return `<span class="badge bg-${element['estado_equipo']['color']} border-0">${element['estado_equipo']['estado']}</span>`
            }},
            {data: 'certificado', 
                render: function(data, type, row) {
                  return `<span style="max-width: 100px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data}</span>`;
                } 
            },
            {data: 'fecha_ingreso', orderable: false },
            {data: 'fecha_retiro', orderable: false },
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
        $('#tablaEstadoEquipos').DataTable().ajax.reload();
    }, 300000);
}


function barPorcentaje(numerador,denominador){
    return porcentaje = (numerador / denominador) * 100;
}

function searchValid(value) {
    return value !== undefined && value !== null && value.trim() !== '';
}
//#############  Inicio Contador de la clase count ###################}
//function countNumerico(){
//    var counters = $(".count");
//    var countersQuantity = counters.length;
//    var counter = [];
//
//    for (i = countersQuantity; i < countersQuantity; i++) {
//        counter[i] = parseInt(counters[i].innerHTML);
//    }
//
//    var count = function(start, value, id) {
//        var localStart = start;
//        setInterval(function() {
//            if (localStart < value) {
//            localStart++;
//            counters[id].innerHTML = localStart;
//            }
//        }, 200);
//    }
//
//    for (j = 0; j < countersQuantity; j++) {
//        count(0, counter[j], j);
//    }
//}
//#############  Fin Contador de la clase count ###################}

$('#tablaEstadoEquipos').on('click', 'a.ver-detalle', function () {
    let data_row = tableEstados.row($(this).parents('tr')).data();
    showModalDetalleCalibracion(data_row);
});

$('#tablaEstadoEquipos').on('click', 'a.print-etiqueta', function () {
    let data_row = tableEstados.row($(this).parents('tr')).data();
    printTarjetaIdentificacion(data_row,'modalPrintIngreso','tarjetaIngreso');
});

$('#tablaEstadoEquipos').on('click', 'a.cancelar', function () {
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

/*$('#tablaEstadoEquipos').on('change', function() {
    const invalidos = ['', null];

    if (!invalidos.includes($("#search-id").val())) {
        alert("cliente")
        alert($("#search-id").val())
        object_search.id = $("#search-id").val();
    } else if ((Object.keys(object_search).includes('id'))) {
        delete object_search.id;
    }

    if (!invalidos.includes($("#search-cliente").val())) {
        object_search.cliente = $("#search-cliente").val();
    } else if ((Object.keys(object_search).includes('cliente'))) {
        delete object_search.cliente;
    }

    if (!invalidos.includes($("#search-equipo").val())) {
        object_search.equipo = $("#search-equipo").val();
    } else if ((Object.keys(object_search).includes('equipo'))) {
        delete object_search.equipo;
    }

    if (!invalidos.includes($("#search-marca").val())) {
        object_search.marca = $("#search-marca").val();
    } else if ((Object.keys(object_search).includes('marca'))) {
        delete object_search.marca;
    }

    if (!invalidos.includes($("#search-modelo").val())) {
        object_search.modelo = $("#search-modelo").val();
    } else if ((Object.keys(object_search).includes('modelo'))) {
        delete object_search.modelo;
    }

    if (!invalidos.includes($("#search-serie").val())) {
        object_search.serie = $("#search-serie").val();
    } else if ((Object.keys(object_search).includes('serie'))) {
        delete object_search.serie;
    }

    if (!invalidos.includes($("#select-estado").val())) {
        object_search.estado = $("#select-estado").val();
    } else if ((Object.keys(object_search).includes('estado'))) {
        delete object_search.estado;
    }

    if (!invalidos.includes($("#search-fecha_ingreso").val())) {
        object_search.fecha_ingreso = $("#search-fecha_ingreso").val();
    } else if ((Object.keys(object_search).includes('fecha_ingreso'))) {
        delete object_search.fecha_ingreso;
    }
    tableEstados.destroy()
    loadDataTable()
});*/



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

    
    cargarSelector("marca", null, "/marca/activas", 'Seleccione una Marca');
    cargarSelector("estado", null, "/estado_dispositivo", 'Seleccione un Estado');
    cargarSelector("categoria", null, "/categorias/activas", 'Seleccione una Categoría');


    $("#categoria").off("change").change(function(){
        cargarSelector("producto", $(this).val(), "/productos/categoria", 'Seleccione un Dispositivo');
        $('#select_equipo').prop('disabled', false);;
    });
    
    $("#producto").off("change").change(function(){
        const container = document.getElementById('otroDispositivoContainer');
        $("#otroDispositivoContainer").addClass("d-none");
        container.innerHTML = '';
        if (this.value == 9) { // Si el valor es "Otro"
            $("#otroDispositivoContainer").removeClass("d-none");
            container.innerHTML = `
                <label for="otroProducto" class="form-label">Especifique el dispositivo<span class="required">*</span></label>
                <input type="text" class="form-control" id="otroProducto" placeholder="Ingrese el dispositivo" required>
                <div class="invalid-feedback">Por favor ingrese el dispositivo</div>
            `;
        }
    });


    $("#select_marc").off("change").change(function(){
        id_marca_send = $(this).find('option:selected').attr('id_marca');
        cargarSelector("select_modelo", $(this).val(), "/modelobymarca");
        $('#select_modelo').prop('disabled', false);
        //$("#btnModeloAdd").removeAttr("style").prop('disabled', false);
    });
    
}


function cargarSelector(selectorId, dataId, url, placeholder) {
    $.ajax({
        url:  URL_BACKEND + url,
        type: 'GET',
        data: { id: dataId },
        success: function(respuesta) {
            $('#' + selectorId).empty();
            console.log(respuesta)
            respuesta = respuesta["data"]
            if (respuesta.length){
                if (respuesta.length > 1){
                    $('#' + selectorId).append($('<option>', {
                        value: '',
                        text: placeholder,
                        disabled: true,
                        selected: true
                    }));
                }
                $.each(respuesta, function(i, item) {
                    var optionData = {
                        value: item.id,
                        text: item.nombre
                    };
                    $('#' + selectorId).append($('<option>', optionData));
                });
                if (respuesta.length == 1)
                    $('#' + selectorId).trigger('change');
            }else{
                $('#' + selectorId).append($('<option>', {
                    value: '',
                    text: 'No existe data disponible',
                    disabled: true,  // Hacer que el placeholder no sea seleccionable
                    selected: true   // Hacer que el placeholder sea la opción seleccionada inicialmente
                }));
            }
        },
        error: function() {
            toastr.warning("información no encontrada", "Error");
        }
    });
}

