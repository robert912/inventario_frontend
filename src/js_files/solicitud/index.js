var tableEstados;
//var object_search = {};

$(document).ready(function () {
    loadDataTable()
});

$('.search-change').on('change', function () {
    tableEstados.destroy();
    loadDataTable();
});


// Tabla con datos de calibracion
function loadDataTable() {
    tableEstados = $('#tablaSolicitudes').DataTable({
        processing: true,
        serverSide: true,
        autoFill: false,
        searching: false,
        ordering: false,
        language: españolDataTable,
        ajax: {
            url: URL_BACKEND + '/solicitud/all',
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
            // SKU (inventario.sku)
            {
                data: 'inventario.sku',
            },

            // Producto (Producto + Marca + Modelo)
            {
                data: null,
                render: function (data, type, row) {
                    let html = `<strong>${row.nombre_producto || ''}</strong>`;

                    const detalles = [];
                    if (row.nombre_marca) detalles.push(row.nombre_marca);
                    if (row.nombre_modelo) detalles.push(row.nombre_modelo);

                    if (detalles.length) {
                        html += `<br><small class="text-muted">${detalles.join(' · ')}</small>`;
                    }

                    return html;
                }
            },

            // Solicitante
            {
                data: 'solicitante.nombre',
                render: function (data) {
                    return data || '<span class="text-muted">Sin solicitante</span>';
                }
            },

            // Ubicación (viene como array)
            {
                data: null,
                render: function (data, type, row) {
                    if (row.ubicacion && row.ubicacion.length > 0) {
                        return row.ubicacion[0].nombre;
                    }
                    return '<span class="text-muted">Sin ubicación</span>';
                }
            },

            // Cantidad
            {
                data: 'cantidad',
                className: 'text-center'
            },

            // Estado (autoriza)
            {
                data: 'autoriza',
                className: 'text-center',
                render: function (data) {
                    if (data === 1) {
                        return `<span class="badge bg-success" title="Solicitudes Aprobadas"><i class="bi bi-check-circle me-1"></i>Aprobada</span>`;
                    }
                    if (data === 2) {
                        return `<span class="badge bg-danger" title="Solicitudes Rechazadas"><i class="bi bi-slash-circle me-1"></i>Rechazada</span>`;
                    }
                    if (data === 3) {
                        return `<span class="badge bg-primary" title="Solicitudes Asignada"><i class="bi bi-check-circle me-1"></i>Asignada</span>`;
                    }
                    return `<span class="badge bg-info" title="Solicitudes Pendiente"><i class="bi bi-circle me-1"></i>Pendiente</span>`;
                    
                }
            },

            // Justificación
            {
                data: 'justificacion',
                render: function (data) {
                    return data || '<span class="text-muted">—</span>';
                }
            },

            // Acciones
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function (data, type, row) {
                    const ver = `<a href="#" class="btn btn-outline-success shadow btn-xs sharp me-1 ver-detalle" title="Ver detalle"><i class="icon-magnifier"></i></a>`;
                    const puedeAsignar = (row.autoriza === 1);
                    const asignar = puedeAsignar ? `<a href="#" class="btn btn-outline-primary shadow btn-xs sharp me-1 btn-asignar" title="Asignar / Entregar"><i class="bi bi-box-seam"></i></a>` : '';
                    const cancelar = puedeAsignar ? `<a href="#" class="btn btn-outline-danger shadow btn-xs sharp btn-cancelar" title="Cancelar aprobación"><i class="bi bi-x-circle"></i></a>`: '';

                    return `<div class="d-flex">${ver}${asignar}${cancelar}</div>`;
                }
            }
        ]


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

$('#tablaSolicitudes').on('click', 'a.ver-detalle', function () {
    const data = tableEstados.row($(this).closest('tr')).data();
    showModalDetalleSolicitud(data);
});

$('#tablaSolicitudes').on('click', 'a.btn-asignar', function () {
  const row = tableEstados.row($(this).closest('tr')).data();
  asignarProducto(row.id, row.id_inventario, row.cantidad);
});

$('#tablaSolicitudes').on('click', 'a.btn-cancelar', function () {
  const row = tableEstados.row($(this).closest('tr')).data();
  cancelarAprobacion(row.id);
});

function showModalDetalleSolicitud(data) {

    // --- Reset UI de stock cada vez que se abre ---
    $('#md-stock').text('—').removeClass('text-danger text-success');
    $('#btnAprobar').prop('disabled', true); // se habilita cuando se valida stock
    $('#stockMsg').remove(); // por si quedó un mensaje anterior

    // Equipo
    $('#md-sku').text(data.inventario?.sku || '—');

    let producto = data.nombre_producto || '';
    let detalles = [];
    if (data.nombre_marca) detalles.push(data.nombre_marca);
    if (data.nombre_modelo) detalles.push(data.nombre_modelo);

    if (detalles.length) {
        producto += ' (' + detalles.join(' · ') + ')';
    }
    $('#md-producto').text(producto);

    // Solicitud
    $('#md-solicitante').text(data.solicitante?.nombre || '—');
    $('#md-ubicacion').text(data.ubicacion?.[0]?.nombre || '—');
    $('#md-cantidad').text(data.cantidad);

    // Estado
    let estadoHtml = '';
    if (data.autoriza === 1) {
        estadoHtml = '<span class="badge bg-success">Aprobada</span>';
    } else if (data.autoriza === 2) {
        estadoHtml = '<span class="badge bg-danger">Rechazada</span>';
    } else if (data.autoriza === 3) {
        estadoHtml = '<span class="badge bg-secondary">Asignada</span>';
    } else {
        estadoHtml = '<span class="badge bg-info">Pendiente</span>';
    }
    $('#md-estado').html(estadoHtml);

    // Justificación
    $('#md-justificacion').text(data.justificacion || '—');

    // Respuesta
    if (data.respuesta) {
        $('#respuestaContainer').removeClass('d-none');
        $('#md-respuesta').text(data.respuesta);
    } else {
        $('#respuestaContainer').addClass('d-none');
    }

    // Botones Aprobar / Rechazar
    if (data.autoriza === 0) {
        $('#btnAprobar, #btnRechazar').removeClass('d-none');

        $('#btnAprobar').off().on('click', function () {
            if ($(this).prop('disabled')) return;
            procesarSolicitud(data.id, 1, data.cantidad, data.id_inventario);
        });

        $('#btnRechazar').off().on('click', function () {
            procesarSolicitud(data.id, -1);
        });

        $('#btnAsignar, #btnCancelarAprobacion').addClass('d-none');
    }else if (data.autoriza === 1) {
        $('#btnAsignar, #btnCancelarAprobacion').removeClass('d-none');

        $('#btnAsignar').off().on('click', function () {
            asignarProducto(data.id, data.id_inventario, data.cantidad);
        });

        $('#btnCancelarAprobacion').off().on('click', function () {
            cancelarAprobacion(data.id);
        });
        $('#btnAprobar, #btnRechazar').addClass('d-none');
    } else {
        $('#btnAprobar, #btnRechazar, #btnAsignar, #btnCancelarAprobacion').addClass('d-none');
    }

    // Mostrar modal
    $('#modalDetalleSolicitud').modal('show');

    // --- Cargar stock y validar ---
    if (!data.id_inventario) {
        $('#md-stock').text('—').addClass('text-danger');
        // si no hay inventario, no se puede aprobar
        $('#btnAprobar').prop('disabled', true);
        return;
    }

    $.ajax({
        url: URL_BACKEND + '/inventario',
        type: 'GET',
        data: { id: data.id_inventario },
        success: function (response) {
            const item = response?.data?.[0];
            const stockDisponible = Number(item?.stock ?? 0);
            const cantidadSolicitada = Number(data.cantidad ?? 0);

            // Mostrar stock
            $('#md-stock').text(stockDisponible);

            // Validar si alcanza
            const alcanza = stockDisponible >= cantidadSolicitada;

            if (alcanza) {
                $('#md-stock').removeClass('text-danger').addClass('text-success');
                if (data.autoriza === 0) $('#btnAprobar').prop('disabled', false);
            } else {
                $('#md-stock').removeClass('text-success').addClass('text-danger');
                $('#btnAprobar').prop('disabled', true);

                // Mensaje opcional debajo del bloque stock (sin tocar HTML)
                $('#md-stock').closest('.mb-3').append(`
                    <div id="stockMsg" class="text-danger small mt-1">
                        Stock insuficiente: solicitado ${cantidadSolicitada}, disponible ${stockDisponible}.
                    </div>
                `);
            }
        },
        error: function () {
            Swal.fire('Error', 'No se pudo obtener el stock del inventario', 'error');
            $('#md-stock').text('—').addClass('text-danger');
            $('#btnAprobar').prop('disabled', true);
        }
    });
}


function procesarSolicitud(idSolicitud, accion, cantidad = null, id_inventario = null) {

    const new_estado = accion === 1 ? 1 : 2; // 1: aprobar, 2: rechazar

    Swal.fire({
        target: document.getElementById('modalDetalleSolicitud'),
        title: new_estado === 1 ? 'Aprobar solicitud' : 'Rechazar solicitud',
        text: new_estado === 1 ? '¿Deseas aprobar esta solicitud?' : 'Debes indicar el motivo del rechazo',
        icon: 'warning',

        input: new_estado === 2 ? 'textarea' : undefined,
        inputLabel: new_estado === 2 ? 'Motivo del rechazo' : undefined,
        inputPlaceholder: new_estado === 2 ? 'Escriba el motivo del rechazo...' : undefined,

        inputValidator: (value) => {
            if (new_estado === 2 && (!value || value.trim() === '')) {
                return 'Debe ingresar un motivo para rechazar la solicitud';
            }
        },

        showCancelButton: true,
        confirmButtonText: new_estado === 1 ? 'Aprobar' : 'Rechazar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: new_estado === 1 ? '#3AC977' : '#bb2d3b',

        didOpen: () => {
            const input = Swal.getInput();
            if (input) input.focus();
        }
    }).then((result) => {
        if (!result.isConfirmed) return;

        const respuesta = result.value ?? null;
        const data = {
            id: idSolicitud,
            autoriza: new_estado,
            id_inventario: new_estado === 1 ? id_inventario : null,
            cantidad: new_estado === 1 ? cantidad : null,
            respuesta: respuesta
        }

        $.ajax({
            url: URL_BACKEND + '/solicitud/responder',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                Swal.fire(
                    'Éxito',
                    new_estado === 1
                        ? 'Solicitud aprobada correctamente'
                        : 'Solicitud rechazada correctamente',
                    'success'
                );

                $('#modalDetalleSolicitud').modal('hide');
                tableEstados.ajax.reload(null, false);
            },
            error: function () {
                Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
            }
        });
    });

}


function asignarProducto(idSolicitud, id_inventario, cantidad) {
    Swal.fire({
        title: 'Asignar producto',
        text: 'Esto marcará la solicitud como entregada y descontará stock. ¿Continuar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0d6efd'
    }).then((r) => {
        if (!r.isConfirmed) return;

        $.ajax({
            url: URL_BACKEND + '/solicitud/asignar',   // <-- endpoint nuevo recomendado
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: idSolicitud, id_inventario, cantidad }),
            success: function () {
                Swal.fire('OK', 'Producto asignado y stock actualizado.', 'success');
                $('#modalDetalleSolicitud').modal('hide');
                tableEstados.ajax.reload(null, false);
            },
            error: function () {
                Swal.fire('Error', 'No se pudo asignar el producto.', 'error');
            }
        });
    });
}


function cancelarAprobacion(idSolicitud) {
    Swal.fire({
        title: 'Cancelar aprobación',
        text: 'La solicitud quedara en estado rechazada/cancelada. ¿Continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#bb2d3b'
    }).then((r) => {
        if (!r.isConfirmed) return;

        $.ajax({
            url: URL_BACKEND + '/solicitud/cancelar',  // <-- endpoint nuevo recomendado
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: idSolicitud }),
            success: function () {
                Swal.fire('OK', 'Aprobación cancelada.', 'success');
                $('#modalDetalleSolicitud').modal('hide');
                tableEstados.ajax.reload(null, false);
            },
            error: function () {
                Swal.fire('Error', 'No se pudo cancelar.', 'error');
            }
        });
    });
}

