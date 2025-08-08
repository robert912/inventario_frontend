var FULL_LAYOUT = "#full-layout"
var menu_list = $('#menu');
var APIKEY = API_KEY;
var expiration_time;
// VARIABLES USUARIO (LOGIN)
var setContrast = (localStorage.getItem("setContrast") === null) ? false : true;
var data_usuario = JSON.parse(sessionStorage.getItem('usuario'));
var data_departamento = JSON.parse(sessionStorage.getItem('departamento'));
var token = sessionStorage.getItem('access_token');


$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        xhr.setRequestHeader("Authorization", token);
        xhr.setRequestHeader("idUsuario", data_usuario['id_usuario']);
        if (sessionStorage.getItem('access_token') == null || sessionStorage.getItem('session_expirate') == null) {
            redirect_cierre_sesion(URL_LOGIN);
        } else {
            expiration_time = sessionStorage.getItem('session_expirate')
            now = new Date();
            var expiration = new Date(expiration_time)
            if (now.getTime() > expiration.getTime()) {
                let timerInterval;
                Swal.fire({
                    icon: "info",
                    title: "El tiempo de la sesión ha expirado",
                    html: "Volverá a la página de inicio en <b>3</b> segundos",
                    timer: 3000,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent -= 1;
                        }, 1000);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        redirect_cierre_sesion(URL_LOGIN);
                    }
                });
            } else {
                updateExpiration();
            }
        }
        xhr.setRequestHeader("Authorization", sessionStorage.getItem('access_token'));
    },
    complete: function (xhr, stat) {
        if (xhr.status == 403) {
            redirect_cierre_sesion(URL_LOGIN);
        }
    }
});

$(document).ready(function () {
    $('.loader').css('display','block');
    let nombre_usuario = "";
    
    if(data_usuario != null){
        if (data_usuario.hasOwnProperty('nombre')){
            nombre_usuario = data_usuario.nombre;
            nombre_dpto = data_departamento.nombre;
        }
    }

    perfiles = JSON.parse(sessionStorage.getItem('perfiles'))

    let perfil = "";
    if (data_usuario.hasOwnProperty('perfil')){
        perfil = _.find(perfiles,(item) => item.codigo == data_usuario.perfil ).nombre;
    }

    //document.getElementById('panel_nombre_usuario').innerText = nombre_usuario;
    document.querySelectorAll('.panel_nombre_usuario').forEach(user => {
        user.innerText = nombre_usuario;
    });
    document.querySelectorAll('.panel_name_depto').forEach(dpto => {
        dpto.innerText = nombre_dpto;
    });
    
    document.getElementById('panel_nombre_perfil').innerText = perfil;
    loadMenu();
            
    var hash = location.hash.substr(1);
    setTimeout(() => {
        hash = "/views/dashboard/index"
        goURL(hash)
    }, 500);

    modifyContrast()
});

function modifyContrast(){
    if(localStorage.getItem("setContrast")){
        $('body').attr('data-theme-version', 'dark');
        $('.fa-moon').hide(); // Oculta el ícono de la luna
        $('.fa-sun').show(); // Muestra el ícono del sol
    }else{
        $('body').attr('data-theme-version', 'light');
        $('.fa-moon').show(); // Muestra el ícono de la luna
        $('.fa-sun').hide(); // Oculta el ícono del sol
    }
}

$('.change-theme').click(function() {
    // Obtiene el tema actual
    this.setContrast = (localStorage.getItem("setContrast") === null) ? false : true;
    if(this.setContrast == false){
        this.setContrast = true
        localStorage.setItem("setContrast",true);
    }else{
        this.setContrast = false
        localStorage.removeItem("setContrast");
    }
    modifyContrast()
});


function onActive(element){
    if ($(element).parent().hasClass('mm-active')){
        $(element).parent().removeClass('mm-active').find('ul').removeClass('mm-show');
    }else if ($(element).parent().hasClass('nav-item')){
        $('#menu .mm-show').removeClass('mm-show');
        $(element).parent().addClass('mm-active').siblings().removeClass('mm-active');
        $(element).parent().find('ul').addClass('mm-show')
    }else if(!$(element).parent().hasClass('submenu-item')){
        $('#menu .mm-show').removeClass('mm-show');
        $(element).parent().addClass('mm-active').siblings().removeClass('mm-active');
    }
}

$('#menu').on('click', 'a', function() {
    onActive(this);
});

function loadMenu() {
    $('.loader').css('display','block');

    var menu, rs = {}
    let data_usuario = JSON.parse(sessionStorage.getItem("usuario"))
    let headers = data_usuario.hasOwnProperty('perfil') ? {'perfil':data_usuario.perfil} : {};
    $.ajax({
        url: URL_BACKEND + '/menu',
        type: 'GET',
        headers : headers,
        dataType: 'json',
        success: async function (rs) {
            $('.loader').css('display','none');
            if (rs.response.data.hasOwnProperty("menu")) {
                var hash = location.hash.substr(1);
                menu = rs.response.data.menu
                acceso = rs.response.data.acceso;
                let perfil_usuario = JSON.parse(sessionStorage.getItem("usuario")).perfil
                acceso.forEach(element =>{
                    if(element.id == 0 && perfil_usuario != "preSuperAdm"){
                        sessionStorage.setItem('base_url',element.url);
                    }
                });
                sessionStorage.setItem('menu',JSON.stringify(menu))
                sessionStorage.setItem('acceso',JSON.stringify(acceso))

                var x = 0;
                var classOpen = ""
                menu_list.html(`
                <li class="mm-active">
                    <a href="#/views/dashboard/index" onclick="goURL('/views/dashboard/index');"><i class="fa fa-house-door"></i><span class="nav-text">Dashboard</span></a>
                </li>
                `);

                menu.forEach(dataMenu => {
                    var classActive = ""
                    if (dataMenu.submenu.length > 0) {
                        if(dataMenu.url == hash ){
                            classActive = "mm-active "
                        }
                        html = '<li class="nav-item  PM'+x+'"><a class="has-arrow " href="javascript:void(0);" aria-expanded="false"><i class="' + dataMenu.icon + '"></i><span class="nav-text">' + dataMenu.name + '</span></a><ul aria-expanded="false" class="left mm-collapse">';
                        dataMenu.submenu.forEach(datasub => {
                            if(datasub.url == hash ){
                                classActive = "mm-active"
                                classOpen = "PM"+x
                            }
                            let textLi = datasub.name;

                            html = html + '<li class="submenu-item '+classActive+'"><a href="#' + datasub.url + '" onclick="goURL(\'' + datasub.url + '\');"  class=""><i class="' + datasub.icon + '"></i>' + textLi + '</a></li>'
                            classActive = "";
                        })
                        html = html + '</ul></li>'
                        menu_list.append(html)
                    } else {
                        menu_list.append('<li class="'+classActive+'"><a href="#' + dataMenu.url + '" onclick="goURL(\'' + dataMenu.url + '\');" ><i class="' + dataMenu.icon + '"></i><span class="nav-text">' + dataMenu.name + '</span></a></li>');
                    }
                    classActive = "";
                    x++;
                });
                
                if(classOpen != ""){
                    $("."+classOpen).addClass(" open ");
                }
                
            }
        },
        error: function (request, error) {
            $('.loader').css('display', 'none');
            $("#msj_warning").show().text(`Request: ${JSON.stringify(request)} ${JSON.stringify(error)}`);
        }
    });    
}

function goURL(URL) {

    var html;
    if (URL != '') {
        let acceso_usuario = JSON.parse(sessionStorage.getItem('acceso'));
        let tiene_acceso = _.findIndex(acceso_usuario,(item) => URL.indexOf(item["url"]) >= 0 );        

        if(acceso_usuario == null || tiene_acceso != -1){
            $.ajax({
                url: URL + '.html',
                type: 'GET',
                success: function (html) {
                    $(FULL_LAYOUT).html(html);
                    $("a[href$='"+URL+"']").parent().addClass('mm-active');
                    
                },
                error: function (request, error) {
                    $.ajax({
                        url: "/views/error/error-403.html",
                        type: 'GET',
                        success: function (html) {
                            $(FULL_LAYOUT).html(html);
                        },
                        error: function (request, error) {
                            console.log("Error (1)");
                        }
                    });
                }
            });
        }else{
            $.ajax({
                url: "/views/error/error-403.html",
                type: 'GET',
                success: function (html) {
                    $(FULL_LAYOUT).html(html);
                },
                error: function (request, error) {
                    console.log("Error (2)");
                }
            });
        }

    } else {
        $.ajax({
            url: "/views/error/error-403.html",
            type: 'GET',
            success: function (html) {
                $(FULL_LAYOUT).html(html);
            },
            error: function (request, error) {
                console.log("Error (2)");
            }
        });
    }
}


function modalCambioPerfil(){
    perfil_actual = JSON.parse(sessionStorage.getItem('usuario')).perfil;
    if(perfiles.length > 0){
        html_perfiles = ``;
        for (let i = 0; i < perfiles.length; i++) {
            const perfil = perfiles[i];
                html_perfiles += `<option value=${perfil.codigo} ${perfil.codigo == perfil_actual ? 'selected' : ''}> ${perfil.nombre} </option>`
                
            }
        
        $('#cambio_perfil').html(html_perfiles);
    }
    $('#modal-cambio-perfil').modal('show');
}

function cambiarPerfil(){
    let url_dashboard = "/views/dashboard/index";
    let codigo_perfil_select = $('#cambio_perfil').val();
    let data_usuario = JSON.parse(sessionStorage.getItem('usuario'));
    data_usuario.perfil = codigo_perfil_select;
    sessionStorage.setItem('usuario',JSON.stringify(data_usuario));
    toastr.success("Cambio de perfil exitoso");
    $('#modal-cambio-perfil').modal('hide');
    loadMenu();
    let perfil = _.find(perfiles,(item) => item.codigo == data_usuario.perfil ).nombre;
    document.getElementById('panel_nombre_perfil').innerText = perfil;
    document.getElementById('panel_nombre_perfil').css = perfil;
    //window.location.href = window.location.pathname +"#"+ url_dashboard;
    goURL(url_dashboard)
}

function modalCambioContrasena(){
    let contrasena_actual = $('#contrasena_actual');
    let contrasena_nueva = $('#contrasena_nueva');
    let confirmacion_contrasena_nueva = $('#confirmacion_contrasena_nueva');
    contrasena_actual.val(null).removeClass('error-input');
    contrasena_nueva.val(null).removeClass('error-input');
    confirmacion_contrasena_nueva.val(null).removeClass('error-input');
    $('#modal-cambio-contrasena').modal('show');
}

function cambiarContrasena(){
    let error = false;
    let mensaje = "";
    let contrasena_actual = $('#contrasena_actual');
    let contrasena_nueva = $('#contrasena_nueva');
    let confirmacion_contrasena_nueva = $('#confirmacion_contrasena_nueva');
    contrasena_actual.removeClass('error-input');
    contrasena_nueva.removeClass('error-input');
    confirmacion_contrasena_nueva.removeClass('error-input');
    if(contrasena_actual.val() == "" || contrasena_actual.val() == null){
        error = true;
        mensaje = "Contraseña actual es requerido!"
        contrasena_actual.addClass('error-input');
    }
    else if(contrasena_nueva.val() == "" || contrasena_nueva.val() == null){
        error = true;
        mensaje = "Contraseña nueva es requerido!"
        contrasena_nueva.addClass('error-input');
    }
    else if(confirmacion_contrasena_nueva.val() == "" || confirmacion_contrasena_nueva.val() == null){
        error = true;
        mensaje = "Confirmación contraseña es requerido!"
        confirmacion_contrasena_nueva.addClass('error-input');
    }
    else if(contrasena_nueva.val() != confirmacion_contrasena_nueva.val()){
        error = true;
        mensaje = "La nueva contraseña no coincide!"
        confirmacion_contrasena_nueva.addClass('error-input');
    }

    if(!error){
        let params = {
            "contrasena_actual" : btoa(contrasena_actual.val()),
            "contrasena_nueva" : btoa(contrasena_nueva.val())
        }
        $('#loading_cambio_contrasena').css('display','block');
        $("#aceptar_cambio_contrasena").addClass('d-none');
        $("#cancelar_cambio_contrasena").addClass('d-none');
        $.ajax({
            url: URL_BACKEND + '/usuario/cambioContrasena',
            type: 'POST',
            contentType: "application/json",
            dataType: "json",
            data : JSON.stringify(params),
            success: function (response) {
                $('#loading_cambio_contrasena').css('display','none');
                $("#aceptar_cambio_contrasena").removeClass('d-none');
                $("#cancelar_cambio_contrasena").removeClass('d-none');
                if(response.hasOwnProperty('estado') && response.estado == 1){
                    toastr.success("Cambio de contraseña exitoso");
                    $('#modal-cambio-contrasena').modal('hide');
                }else if(response.hasOwnProperty('estado') && response.estado == 2){
                    contrasena_actual.addClass('error-input');
                    toastr.warning(response.mensaje, "Cambio de contraseña");
                }else if(response.hasOwnProperty('estado') && (response.estado == 3 || response.estado == 4 )){
                    contrasena_nueva.addClass('error-input');
                    confirmacion_contrasena_nueva.addClass('error-input');
                    toastr.warning(response.mensaje, "Cambio de contraseña");
                }

            },
            error: function (response_error) {
                toastr.error('ha ocurrido un error al cambiar la contraseña', "Cambio de contraseña");
            }
        });
    }else{
        toastr.warning(mensaje,"Cambio de contraseña");
    }
}