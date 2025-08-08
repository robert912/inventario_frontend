var URL_sesion = window.location.href;
var modulos = [
    "/views/dashboard/error",
]
function cerrarSesion(){
    token_login = sessionStorage.getItem("access_token");
        $.ajax({
        url: URL_BACKEND + "/logout/system",
        type: 'POST',
        headers: { 'token': token_login},//, "X-Api-Key": API_KEY},
        success: function (rs_logout) {
            url_inicio_sesion = rs_logout.success == true ? rs_logout.data.url : URL_LOGIN
            redirect_cierre_sesion(url_inicio_sesion);
        },
        error: function (request, error) {
            redirect_cierre_sesion(URL_LOGIN);
        }
    });
    
}

function redirect_cierre_sesion(url){
    let inicio_sesion = sessionStorage.getItem("inicio_sesion")
    sessionStorage.clear();
    sessionStorage.setItem('inicio_sesion',inicio_sesion);
    window.location.href = url;
}
function updateExpiration(){
    var now = new Date();
    now.setMinutes(now.getMinutes() + tiempo_para_expirar);
    sessionStorage.setItem('session_expirate',now)
}

let modulo_valido = _.findIndex(modulos,(item) => URL_sesion.indexOf(item) >= 0 );
if (modulo_valido == -1){
    
    if(sessionStorage.getItem('access_token') == null || sessionStorage.getItem('session_expirate') == null){
        cerrarSesion();
    }else{
        expiration_time = sessionStorage.getItem('session_expirate')
        now = new Date();
        var expiration = new Date(expiration_time) 
        if (now.getTime() > expiration.getTime()) {
            cerrarSesion();
        }else{
            updateExpiration();
        }  
    }
}
