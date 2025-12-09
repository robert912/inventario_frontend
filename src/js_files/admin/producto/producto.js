var tablas = {};
var equipo = {};
var data_table = {  'tabla_categoria':{'selectorId':"tabla_categoria", 'dataId':null,'url':"/categoria/all", 'sigTabla':"tabla_producto", "urlEnable":"/categoria/activar", "urlInsert":"/categoria/insert"},
                    'tabla_producto':{'selectorId':"tabla_producto", 'dataId':null, 'url':"/productos/categoria", 'sigTabla':"tabla_marca", "urlEnable":"/producto/activar", "urlInsert":"/producto/insert"},
                    'tabla_marca':{'selectorId':"tabla_marca", 'dataId':null, 'url':"/marca/producto", 'sigTabla':"tabla_modelo", "urlEnable":"/marcaEquipo/activar", "urlInsert":"/marca/insert"},
                    'tabla_modelo':{'selectorId':"tabla_modelo", 'dataId':null, 'url':"/modelo/producto_marca", 'sigTabla':null, "urlEnable":"/modelo/activar", "urlInsert":"/modelo/insert"}}

$(document).ready(function() {
    cargarTabla("tabla_categoria", null, "/categoria/all", "tabla_producto");
    
    $("#tabla_categoria").on('click', 'button.ver_equipo', function () {
        equipo['tabla_categoria'] = data_row = tablas['tabla_categoria'].row($(this).parents('tr')).data();
        cargarSiguienteTabla("tabla_producto", data_table["tabla_producto"]['dataId'] = data_row['id'], "/productos/categoria", "tabla_marca");
        $("#titulo_tabla_tipo").html(equipo['tabla_categoria']['nombre'])
    });

    $("#tabla_producto").on('click', 'button.ver_equipo', function () {
        equipo['tabla_producto'] = data_row = tablas['tabla_producto'].row($(this).parents('tr')).data();
        cargarSiguienteTabla("tabla_marca", data_table["tabla_marca"]['dataId'] = data_row['id'], "/marca/producto", "tabla_modelo");
        $("#titulo_tabla_equipo").html(equipo['tabla_categoria']['nombre'] + ' <i class="bi bi-arrow-right"></i> ' + equipo['tabla_producto']['nombre'])
    });

    $("#tabla_marca").on('click', 'button.ver_equipo', function () {
        equipo['tabla_marca'] = data_row = tablas['tabla_marca'].row($(this).parents('tr')).data();
        cargarSiguienteTabla("tabla_modelo", data_table["tabla_modelo"]['dataId'] = data_row['id'], "/modelo/producto_marca", null);
        $("#titulo_tabla_marca").html(equipo['tabla_categoria']['nombre'] + ' <i class="bi bi-arrow-right"></i> ' + equipo['tabla_producto']['nombre'] + ' <i class="bi bi-arrow-right"></i> ' +equipo['tabla_marca']['nombre'])
    });

});

// Función para cargar una tabla
function cargarTabla(selectorId, dataId, url, sigTabla) {
    //mostrarColumnaValor = selectorId == 'tabla_producto' ? true : false;
    //mostrarColProcedimiento = selectorId == 'tabla_producto' ? true : false;
    mostrarSigTabla = selectorId != 'tabla_modelo' ? true : false;
    tablas[selectorId] = $('#' + selectorId).DataTable({
        order: [[0, "asc"]],
        columnDefs: [{
            targets: 0,
            visible: false
        }],
        searching: true,
        ordering: true,
        language: españolDataTable,
        ajax: {
            url: URL_BACKEND + url,
            type: 'GET',
            //data: { id: dataId },
            data: function (d) {
                var object_search = {};
                //object_search["limit"] = d.length;
                //object_search["offset"] = d.start;
                object_search["draw"] = d.draw;
                object_search["id"] = dataId;
                if (selectorId == 'tabla_modelo'){
                    object_search["producto"] = equipo['tabla_producto']['id'];
                    object_search["marca"] = dataId;
                }
                return object_search;
            },
            dataFilter: function (response) {
                const json_response = jQuery.parseJSON(response);
                const data = json_response.data;
                const datas = JSON.stringify({
                    aaData: data,
                });
                return datas; 
            },
        },
        columns: [
            { title: 'Id', data: 'id' },
            { title: 'Tipo equipo', data: function (element) { return `<span class="text-uppercase">${element['nombre']}</span>` } },
            // {
            //     title: 'Valor', data: function (element) {
            //         return 'valor' in element ? `<span>$ ${formatearValorPesos(element['valor'])}</span>` : '' ;
            //     },
            //     "searchable": false,
            //     "orderable": false,
            //     visible: mostrarColumnaValor // Aquí controlas la visibilidad de la columna
            // },
            // {
            //     title: 'Proced./Norma', data: function (element) {
            //         return mostrarColProcedimiento ? `<span>${element['procedimiento']}</span>` : '' ;
            //     },
            //     "searchable": false,
            //     "orderable": false,
            //     visible: mostrarColProcedimiento
            // },
            {
                title: 'Estado', data: function (element) {
                    if (element.estado)
                        return '<span class="badge badge-success light border-0">Activo</span>'
                    else
                        return '<span class="badge badge-danger light border-0">Inactivo</span>'
                },
                "searchable": false
            },
            {
                title: 'Acciones', data: function (element) {
                    if (element.estado)
                        return `
                            <div class="">
                                <a href="#" class="btn btn-outline-danger shadow btn-xs sharp me-1 enable-disable" title='Desactivar' ><i class="fa-solid fa-user-xmark"></i></a>
                                <a href="#" class="btn btn-outline-primary shadow btn-xs sharp me-1 editar_equipo" title="Editar Equipo"><i class="fa-regular fa-pen-to-square"></i></a>
			                </div>`;
                    else
                        return `
                            <div class="">
                                <a href="#" class="btn btn-outline-success shadow btn-xs sharp me-1 enable-disable" title='Activar' ><i class="fa-solid fa-user-check"></i></a>
                                <a href="#" class="btn btn-outline-primary shadow btn-xs sharp me-1 editar_equipo" title="Editar Equipo"><i class="fa-regular fa-pen-to-square"></i></a>
			                </div>`;
                },
                "searchable": false,
                "orderable": false
            },
            {
                title: '', data: function (element) {
                    if (sigTabla != null)
                        return `<button type="button" class="btn light btn-info btn-xxs ver_equipo" data-bs-toggle="collapse" data-bs-target="#seccion_${sigTabla}" aria-expanded="false" aria-controls="seccion_${sigTabla}">Ver ${sigTabla.replace(/tabla_/g, ' ')}</button>`
                    else
                        return ''
                },
                "searchable": false,
                "orderable": false,
                visible: mostrarSigTabla
            }
        ]
    });
}

// Función para cargar la siguiente tabla
function cargarSiguienteTabla(selectorId, dataId, url, sigTabla) {
    // Destruir la tabla actual si ya existe
    if (tablas[selectorId]) {
        tablas[selectorId].destroy();
    }
    cargarTabla(selectorId, dataId, url, sigTabla);
}


$('#div_seccion_tabla').on('click', 'a.enable-disable', function () {
    var tablaId = $(this).closest('table').attr('id');
    let data_row = tablas[tablaId].row($(this).parents('tr')).data()
    datos = {
        id: data_row['id'],
        estado: data_row['estado'] ? 0 : 1
    }
    if (tablaId == 'tabla_marca'){
        datos["id_producto"] = data_row['id_equipo'];
        datos["id_marca"] = data_row['id_marca'];
    }
    Swal.fire({
        title: `Cambio de Estado`,
        text: `¿Desea ${data_row['estado'] ? 'Desactivar' : 'Activar'} Este Equipo?`,
        showCancelButton: true,
        confirmButtonText: data_row['estado'] ? 'Desactivar' : 'Activar',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: URL_BACKEND + data_table[tablaId]['urlEnable'],
                dataType: "json",
                data: datos,
                success: function (response) {
                    if (response['success']) {
                        Swal.fire({
                            icon: "success",
                            title: response['message'],
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        toastr.warning(response['message'], "Equipo");
                    }
                    if (tablas[tablaId]) {
                        tablas[tablaId].destroy();
                    }
                    cargarTabla(data_table[tablaId]['selectorId'], data_table[tablaId]['dataId'], data_table[tablaId]['url'], data_table[tablaId]['sigTabla']);
                }, error: function (error) {
                    console.error('Error al cargar datos:', error);
                    toastr.warning("No se pudo actualizar la data", "Equipo");
                }
            });
        }
    });
});


$('#div_seccion_tabla').on('click', 'a.editar_equipo', function () {
    
    var tablaId = $(this).closest('table').attr('id');
    let data_row = tablas[tablaId].row($(this).parents('tr')).data()
    modalProducto(tablaId, data_row);
});

$('#btnTipoAdd').click(function() {
    modalProducto('tabla_categoria');
});

$('#btnEquipoAdd').click(function() {
    modalProducto('tabla_producto');
});

$('#btnMarcaAdd').click(function() {
    modalProducto('tabla_marca');
});

$('#btnModeloAdd').click(function() {
    modalProducto('tabla_modelo');
});

function modalProducto(selectorId, data){
    // Cargar el modal
    $('#modalContainer').load('../../views/admin/producto/modal_crear_producto.html', async function() {
        var etiquetaInput = '';
        var datos = {}
        switch (selectorId) {
            case 'tabla_categoria':
                $("#equipo").removeClass("valid");
                $('#equipo, #marca, #modelo, #modeloValor').hide();
                $('#equipoProcedimiento, #modeloValor, label[for="equipoProcedimiento"], label[for="modeloValor"]').hide();
                $('label[for="equipo"], label[for="marca"], label[for="modelo"], label[for="modeloValor"], .custom-checkbox').hide();
                etiquetaInput = 'categoria';
                if (typeof data != 'undefined') {
                    $("#tituloModal").text("Editar categoria");
                    $("#submitFormEquipo").text("Editar");
                    $("#categoria").val(data['nombre']);
                }
                break;
            case 'tabla_producto':
                $('#marca, #modelo').hide();
                $('#equipoProcedimiento, #modeloValor, label[for="equipoProcedimiento"], label[for="modeloValor"]').hide();
                $('label[for="marca"], label[for="modelo"], .custom-checkbox').hide();
                await inicializarSelectCategorias('categoriaContainer', 'modalAgregarProducto', data);
                $("#equipo").addClass('valid');
                datos['id_categoria'] = data_table[selectorId]['dataId'];
                etiquetaInput = 'equipo';
                if (typeof data != 'undefined') {
                    $("#tituloModal").text("Editar Equipo");
                    $("#submitFormEquipo").text("Editar");
                    $("#equipo").val(data['nombre']);
                    //$("#equipoProcedimiento").val(data['procedimiento']);
                    //$("#modeloValor").val(data['valor']);
                }
                break;
            case 'tabla_marca':
                $('#modelo').hide();
                $('label[for="modelo"]').hide();
                await inicializarSelectCategorias('categoriaContainer', 'modalAgregarProducto', equipo['tabla_producto']);
                $('#categoria').prop('disabled', true);
                $('#equipo').val(equipo['tabla_producto']['nombre']).prop('disabled', true);
                $('#modeloValor').val(equipo['tabla_producto']['valor']).prop('disabled', true);
                $('#equipoProcedimiento').val(equipo['tabla_producto']['procedimiento']).prop('disabled', true);
                $("#marca").addClass('valid');
                datos['id_producto'] = data_table[selectorId]['dataId'];
                etiquetaInput = 'marca';
                if (typeof data != 'undefined') {
                    $("#tituloModal").text("Editar Marca");
                    $("#submitFormEquipo").text("Editar");
                    $('.custom-checkbox').hide();
                    $("#marca").val(data['nombre']);
                }
                break;
            case 'tabla_modelo':
                $('.custom-checkbox').hide();
                await inicializarSelectCategorias('categoriaContainer', 'modalAgregarProducto', equipo['tabla_producto']);
                $('#categoria').prop('disabled', true);
                $('#equipo').val(equipo['tabla_producto']['nombre']).prop('disabled', true);
                $('#modeloValor').val(equipo['tabla_producto']['valor']).prop('disabled', true);
                $('#equipoProcedimiento').val(equipo['tabla_producto']['procedimiento']).prop('disabled', true);
                $('#marca').val(equipo['tabla_marca']['nombre']).prop('disabled', true);
                $("#modelo").addClass('valid');
                etiquetaInput = 'modelo';
                if (typeof data != 'undefined') {
                    $("#tituloModal").text("Editar Modelo");
                    $("#submitFormEquipo").text("Editar");
                    $("#modelo").val(data['nombre']);
                    datos['id_producto_marca'] = data['id_producto_marca'];
                    //$("#modeloValor").val(data['valor']);
                }
                break;
            default:
                break;
        }
        $('#modalAgregarProducto').modal('show');

        $("#submitFormEquipo").click(function () {
            $(this).prop("disabled", true);
            if (validarDatos("#modalAgregarProducto")) {
                datos['nombre'] = $("#"+etiquetaInput).val()
                if(etiquetaInput == 'marca'){
                    if ($("#nuevo").is(':checked')) {
                        datos['nombre'] = $("#"+etiquetaInput).val()
                    } else {
                        //datos['nombre'] = $("#"+etiquetaInput).val()
                        datos['id_marca'] = parseInt($("#"+etiquetaInput).val())
                    }
                }
                if(etiquetaInput == 'equipo'){
                    let categoriasSeleccionadas = $('#categoria').val() || [];
                    datos['categoria'] = categoriasSeleccionadas.join(',');
                    //datos['procedimiento'] = $("#equipoProcedimiento").val();
                    //datos['valor'] = $("#modeloValor").val();
                }
                if(etiquetaInput == 'modelo'){
                    datos["producto"] = equipo['tabla_producto']['id'];
                    datos["marca"] = equipo['tabla_marca']['id'];
                }
                if (typeof data != 'undefined'){
                    datos['id'] = etiquetaInput != 'marca' ? data['id'] : data['id_marca']
                }
                $.ajax({
                    type: "POST",
                    url: URL_BACKEND + data_table[selectorId]['urlInsert'],
                    dataType: "json",
                    data: datos,
                    success: function (response) {
                        if (response && response['success']) {
                            toastr.success(response['message'], "Equipo");
                            if (tablas[selectorId]) {
                                tablas[selectorId].destroy();
                            }
                            cargarTabla(data_table[selectorId]['selectorId'], data_table[selectorId]['dataId'], data_table[selectorId]['url'], data_table[selectorId]['sigTabla']);
                        } else {
                            toastr.warning(response['message'], "Equipo");
                        }
                        $("#modalAgregarProducto").modal('hide');
                    },
                    error: function (xhr, status, error) {
                        // Manejo de errores
                        console.log(error);
                    }
                });
            } else {
                $(this).prop("disabled", false);
                toastr.info("Complete los datos solicitados", "Atención");
            }
        });

        $('input[type=radio][name=addMarca]').change(function() {
            if (this.id === 'existente') { // Si se selecciona Marca Existente
                $('#marcaContainer').html('<select id="marca" class="form-control text-capitalize valid" ></select>');
                cargarSelector("marca", data_table[selectorId]['dataId'], '/marca/allbyequipodistinct', 'Seleccione una marca');
                // Inicializo Select2 después de cargar el modal
                setTimeout(() => {
                    $("#marca").select2({
                        dropdownParent: $("#modalAgregarProducto"), // importante para que funcione dentro del modal
                        tags: true, // permite agregar nuevos valores
                        placeholder: "Escriba o seleccione una opción",
                        allowClear: true,
                        width: "100%"
                    });
                }, 300);
            } else { // Si se selecciona Nueva Marca
                $('#marcaContainer').html('<input type="text" id="marca" class="form-control text-capitalize valid" placeholder="Marca del Equipo" autocomplete="off">');
            }
        });

        //Cambios en los campos in-valid los hace valid
        $('.valid').on('change', function() {
            if ($(this).val() !== '') {
                $(this).removeClass('is-invalid');
                if ($(this).is('select')) {
                    $(this).next('.select2-container').removeClass('is-invalid');
                }
            }
        });

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


// 🔧 Inicializa y carga el Select2 de categorías
async function inicializarSelectCategorias(categoriaContainerId, modalParentId, data) {
    const $container = $('#' + categoriaContainerId);

    // Reemplaza el contenido con el select multiple
    $container.html(`
        <label for="categoria" class="col-form-label">Categoría:<span class="required">*</span></label>
        <select id="categoria" class="form-control valid text-capitalize form-multi-select" multiple data-coreui-search="global"></select>
        <div class="invalid-feedback">Seleccione o ingrese una o más categorías.</div>
    `);

    // Inicializa Select2
    $("#categoria").select2({
        dropdownParent: $("#" + modalParentId),
        placeholder: "Escriba o seleccione una o más categorías",
        allowClear: true,
        tags: true, // Permite agregar nuevas
        width: "100%",
        tokenSeparators: [',', ';']
    });

    // Cargar todas las categorías disponibles
    try {
        const response = await $.ajax({
            url: URL_BACKEND + '/categoria/all',
            type: 'GET',
            dataType: 'json'
        });

        if (response.success && response.data) {
            let categorias = response.data;
            categorias.forEach(c => {
                let option = new Option(c.nombre, c.id, false, false);
                $('#categoria').append(option);
            });
        }

        // Si hay data (modo edición), cargar las categorías seleccionadas
        if (typeof data !== 'undefined' && data.id) {
            const responseSel = await $.ajax({
                url: URL_BACKEND + '/categoria/byproducto',
                type: 'GET',
                data: { id_producto: data.id },
                dataType: 'json'
            });

            if (responseSel.success && responseSel.data) {
                let idsSeleccionadas = responseSel.data.map(c => c.id);
                $('#categoria').val(idsSeleccionadas).trigger('change');
            }
        }

    } catch (error) {
        console.error("Error al inicializar Select2 de categorías:", error);
    }
}
