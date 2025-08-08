console.log(JSON.parse(sessionStorage.getItem('usuario')))
var perfil = JSON.parse(sessionStorage.getItem('usuario'))['perfil'];

function agregarCeros(numero) {
    return numero < 10 ? '0' + numero : numero;
}

function establecerFechaActual(selector) {
    var fecha = new Date();
    var dia = ('0' + fecha.getDate()).slice(-2); // Añade un cero si el día es menor a 10
    var mes = ('0' + (fecha.getMonth() + 1)).slice(-2); // Añade un cero si el mes es menor a 10 (enero es 0)
    var anio = fecha.getFullYear();

    var fechaActual = anio + '-' + mes + '-' + dia; // Formatea la fecha
    $(selector).val(fechaActual); // Establece la fecha en el input
}

function establecerFechaHoraActual(selector) {
    var ahora = new Date();
    var dia = ahora.getDate().toString().padStart(2, '0');
    var mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan en 0
    var anio = ahora.getFullYear();
    var hora = ahora.getHours().toString().padStart(2, '0');
    var minuto = ahora.getMinutes().toString().padStart(2, '0');
    var segundo = ahora.getSeconds().toString().padStart(2, '0');

    var fechaHora = anio + '-' + mes + '-' + dia + ' ' + hora + ':' + minuto + ':' + segundo;
    $(selector).val(fechaHora);
}

function obtenerFechaHoy() {
    let fecha = new Date();
    let año = fecha.getFullYear();
    let mes = agregarCeros(fecha.getMonth() + 1);
    let dia = agregarCeros(fecha.getDate());
    return `${año}-${mes}-${dia}`;
}


function obtenerFechaHoraActual() {
    var ahora = new Date();
    var dia = ahora.getDate().toString().padStart(2, '0');
    var mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    var anio = ahora.getFullYear();
    var hora = ahora.getHours().toString().padStart(2, '0');
    var minuto = ahora.getMinutes().toString().padStart(2, '0');
    var segundo = ahora.getSeconds().toString().padStart(2, '0');

    var fechaHora = anio + '-' + mes + '-' + dia + ' ' + hora + ':' + minuto + ':' + segundo;
    return fechaHora
}

//Formatear fecha: DD-MM-YYYY --> YYYY-MM-DD
function formatearFechaInv(fecha) {
    var partesFecha = fecha.split("-");
    return partesFecha[2] + "-" + partesFecha[1] + "-" + partesFecha[0];
}

//Obtener la diferencia de dias entre una fecha y la de hoy
function difFechaActual(fecha) {
    fechaFinal = convertirFecha(fecha, 'DD-MM-YYYY', 'MM-DD-YYYY');
    fechaActual = convertirFecha(new Date(), '','MM-DD-YYYY');
    return datediff(fechaActual, fechaFinal);
}

//Convierte Fecha segun el formato
function convertirFecha(fechaStr,formatoEntrada, formatoSalida) {
    // Extrae los componentes de fecha
    var dia, mes, año;
    if (formatoEntrada === '') {
        var fecha = new Date(fechaStr);
        año = fecha.getFullYear();
        mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
        dia = fecha.getDate().toString().padStart(2, '0');
    }else{
        // Divide la cadena de fecha en sus componentes
        var fecha = fechaStr.split(' ');
        var partesFecha = fecha[0].split("-");
        if (formatoEntrada === 'MM-DD-YYYY') {
            mes = partesFecha[0];
            dia = partesFecha[1];
            año = partesFecha[2];
        } else if (formatoEntrada === 'DD-MM-YYYY') {
            dia = partesFecha[0];
            mes = partesFecha[1];
            año = partesFecha[2];
        } else if (formatoEntrada === 'YYYY-MM-DD') {
            año = partesFecha[0];
            mes = partesFecha[1];
            dia = partesFecha[2];
        }
    }
    // Formatea los componentes de la fecha
    var fechaFormateada = '';
    if (formatoSalida === 'DD-MM-YYYY') {
        fechaFormateada = dia + '-' + mes + '-' + año;
    } else if (formatoSalida === 'MM-DD-YYYY') {
        fechaFormateada = mes + '-' + dia + '-' + año;
    } else if (formatoSalida === 'YYYY-MM-DD') {
        fechaFormateada = año + '-' + mes + '-' + dia;
    }
    return fechaFormateada;
}

// Diferencia de dias entre 2 fechas (MM-DD-YYYY)
function datediff(today, date_1) {
    var fechaInicial = new Date(today);
    var fechaFinal = new Date(date_1);
    var diferenciaMs = fechaFinal - fechaInicial;
    var diferenciaDias = Math.ceil(diferenciaMs / (1000 * 3600 * 24));
    return diferenciaDias;
}

// Formatear fecha en el siguiente formato: (DD de Septiembre de YYYY)
function formatearFechaText(fecha) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dia = fecha.getDate().toString().padStart(2, '0'); // Día en formato 01, 02, etc.
    const mes = meses[fecha.getMonth()]; // Nombre del mes
    const anio = fecha.getFullYear(); // Año completo

    return `${dia} de ${mes} de ${anio}`;
}

// Validador de campos
function validarDatos(selector) {
    var isValid = true;

    // Validar cada campo
    $(selector + ' .valid').each(function() {
        if ($(this).val() === '' || $(this).val() == null) {
            isValid = false;
            $(this).addClass('is-invalid');
            if ($(this).is('select')) {
                $(this).next('.select2-container').addClass('is-invalid');
            }
        } else {
            $(this).removeClass('is-invalid');
            if ($(this).is('select')) {
                $(this).next('.select2-container').removeClass('is-invalid');
            }
        }
    });
    return isValid
}

//Cambios en los campos in-valid los hace valid
$('.valid').on('change', function() {
    if ($(this).val() !== '') {
        $(this).removeClass('is-invalid');
        if ($(this).is('select')) {
            $(this).next('.select2-container').removeClass('is-invalid');
        }
    }
});

//Formatear RUT 17411947-3 -> 17.411.947-3
function formatearRUT(rut) {
    rut = rut.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    var formateado = rut.slice(-4, -1) + '-' + rut.substr(rut.length - 1); // Agregar guión y dígito verificador
    for (var i = 4; i < rut.length; i += 3) {
        formateado = rut.slice(-3 - i, -i) + '.' + formateado; // Agregar puntos cada tres dígitos
    }
    return formateado;
}

//Formatear Pesos 100000 -> 100.000
function formatearValorPesos(numero) {
    var value = numero.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return value;
}


españolDataTable = {
    decimal:        "",
    emptyTable:     "No hay data disponible en tabla",
    info:           "Mostrar _START_ a _END_ de _TOTAL_ registros",
    infoEmpty:      "Mostrando 0 a 0 de 0 registros",
    infoFiltered:   "(filtrado de _MAX_ total de registros)",
    infoPostFix:    "",
    thousands:      ".",
    lengthMenu:     "Mostrar _MENU_ registros",
    loadingRecords: "Cargando...",
    processing:     "Procesando...",
    search:         '<i class="fa-solid fa-magnifying-glass"></i>',
	searchPlaceholder: 'Buscar...',
    zeroRecords:    "No se encontraron registros que coinciden",
    paginate: {
        first:      "Primero",
        last:       "Último",
        next: '<i class="fa-solid fa-angle-right"></i>',
		previous: '<i class="fa-solid fa-angle-left"></i>'
    },
    aria: {
        sortAscending:  ": activar para ordernar columna ascendente",
        sortDescending: ": activar para ordernar columna descendente",
    }
}

//Modal detalle calibracion
function showModalDetalleCalibracion(data_row){
    $('#modalContainer').load('../../views/dashboard/modal_detalle_calibracion.html', function() {
        $("#tituloModal").text("Registro de calibración N°: "+data_row['id']);
        $("#modalDetalleCalibracion input").addClass('border-'+data_row['estado_equipo']['color']);
        if (data_row['estado'] < 6){
            $("#lbl_fecha_retiro").text("Fecha estimada de retiro");
            $('#div_retiro_resp').addClass('d-none');
        }
        data_row['estado'] == 0 || data_row['estado'] == 7 ? getObservacion(data_row['id']): $('#div_observacion').addClass('d-none');
        crearListaElementos(JSON.parse(data_row['accessorios']));
        $("#nombre").val(data_row['nombre_cliente']);
        $("#cotizado_por").val(data_row['cotizado_por']);
        $("#n_cotizacion").val(data_row['n_cotizacion']);
        $("#orden_compra").val(data_row['orden_compra']);
        $("#nombre_equipo").val(data_row['nombre_equipo']);
        $("#nombre_marca").val(data_row['nombre_marca']);
        $("#nombre_modelo").val(data_row['nombre_modelo']);
        $("#serie").val(data_row['serie']);
        $("#certificado").val(data_row['certificado']);
        $("#estado").val(data_row['estado_equipo']['estado']);
        $("#fecha_ingreso").val(data_row['fecha_ingreso']);
        $("#fecha_retiro").val(data_row['fecha_retiro']);
        $("#responsable_despacho").val(data_row['responsable_despacho']);
        $("#responsable_retiro").val(data_row['responsable_retiro']);
        $("#cliente_final").val(data_row['cliente_final']);
        $("#obs_admin").val(data_row['observacion']);
        $("#metrologos").val(data_row['data_metrologos'].join(", "));
        if('contacto' in data_row){
            $("#correo").val(data_row['contacto']['correo']);
            $("#fono").val(data_row['contacto']['telefono']);
        }
        inputToTextarea(data_row['estado_equipo']['color'])
        $('#modalDetalleCalibracion').modal('show');
        if(perfil == 'admin'){
            $('#n_cotizacion').removeAttr('disabled');
            $('#orden_compra').removeAttr('disabled');
            $('#serie').removeAttr('disabled');
            $('#responsable_despacho').removeAttr('disabled');
            $('#responsable_retiro').removeAttr('disabled');
            $('#cliente_final').removeAttr('disabled');
            $('#obs_admin').removeAttr('disabled');
            setTimeout(function() {
                $('.edit').change(function() {
                    $('#btn_editar').removeClass('d-none');
                });
            }, 500);
        }
        $('#btn_editar').click(function () {
            $(this).prop("disabled", true);
            datos = {
                'id': data_row['id'],
                'n_cotizacion': $("#n_cotizacion").val().trim(),
                'orden_compra': $("#orden_compra").val().trim(),
                'serie': $("#serie").val().trim(),
                'responsable_despacho': $("#responsable_despacho").val().trim(),
                'responsable_retiro': $("#responsable_retiro").val().trim(),
                'cliente_final': $("#cliente_final").val().trim(),
                'obs_admin': $("#obs_admin").val().trim(),
            }
            $.ajax({
                url: URL_BACKEND + '/calibracion/update',
                method: 'PUT',
                dataType: "json",
                data: datos,
                success: function(response) {
                    toastr.success(response['message'], "Calibración");
                    tableEstados.destroy()
                    loadDataTable()
                    $("#modalDetalleCalibracion").modal('hide');
                },
                error: function(error) {
                    toastr.warning(response['message'], "Calibración");
                }
            });
        });
    });
}

function inputToTextarea(color) {
    var textarea = $('#certificado');
    var items = textarea.val().split(',').filter(function(linea) {
        return linea.trim() !== '';
    });
    if (items.length > 1) {
        var newText = items.join('\n');
        var nuevoTextarea = $('<textarea>').attr('id', textarea.attr('id')).addClass('form-control').addClass('border-'+color).val(newText);
        textarea.replaceWith(nuevoTextarea);
    } 
}

// Función para crear la lista de elementos
function crearListaElementos(elementosArray) {
    skipNext = false;
    if(elementosArray != null){
        elementosArray.forEach(function(elemento, index) {
            var li = elemento === 'Otros' ? $('<li>').text(elemento + ': ' + elementosArray[index + 1]) : $('<li>').text(elemento);
            skipNext ? skipNext = false : $('#listAccessorios').append(li);
            if (elemento === 'Otros')
                skipNext = true;
        });
    }else{
        $('#listaElementos').addClass('d-none')
    }
}

function getObservacion(id_calibracion){
    $.ajax({
        url: URL_BACKEND + '/observacion/get_id',
        method: 'GET',
        data: { id: id_calibracion },
        success: function(data) {
            $("#observacion").text(data['data']['observacion'])
        },
        error: function(error) {
            $('#div_observacion').addClass('d-none');
            console.error('Error al cargar datos:', error);
        }
    });
}

//Imprime Modal de identificción
function printTarjetaIdentificacion(data_row, showModal, urlTemplate){
    $('#modalContainer').load('../../template/'+urlTemplate+'.html', function() {
        $("#tituloTabla").text("Tarjeta Identificación N°: "+data_row['id']+" - Instrumentos recibidos para calibración");
        $("#id_ingreso").text(data_row['id']);
        $("#printCliente").text(data_row['nombre_cliente']);
        $("#printFechaIn").text(data_row['fecha_ingreso']);
        $('#'+showModal).modal('show');

        $('#btnImprimir').click(function(){
            if (data_row['nombre_cliente'].length > 18) {
                $('.imagen').hide();
            }
            var modalContent = document.getElementById('modalPrint').innerHTML;
            var printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><title>Modal Impreso</title>');
            printWindow.document.write(stylesPrintEtiqueta);
            printWindow.document.write('</head><body>');
            printWindow.document.write(modalContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
            $("#"+showModal).modal('hide');
        });
    });
}

var stylesPrintEtiqueta = `
<style>
    #labelPrint {
        margin-block-start: 0px;
        margin-block-end: 0px;
        position: absolute;
        top: 0; /* Posición desde arriba */
        left: 0; /* Posición desde la izquierda */
        width: 95%;
        height: auto;
        font-size: 11px;
        padding: 0; /* Elimina rellenos */
        margin: 0; /* Elimina rellenos */
        text-align: center;
        font-family: Arial, sans-serif;
    }

    h2 {
        display: block;
        font-size: 1.5em;
        margin-block-start: 0px;
        margin-block-end: 2px;
        font-weight: bold;
        }

    p {
        display: block;
        margin-block-start: 0px;
        margin-block-end: 0px;
    }

    #printCliente {
        text-transform: capitalize;
        font-weight: bold;
    }

    .imagen {
        margin-block-start: 0px;
        margin-block-end: 0px;
        font-weight: bold;
        width: 50%; /* Ajusta el ancho de la imagen al 100% del contenedor */
        height: auto; /* Permite que la altura se ajuste automáticamente para mantener la proporción */
        display: inline-block; /* Para evitar espacios extraños debajo de la imagen */
    }
</style>`;