var api = {};
var tokenRecaptcha = "6Lc1WpMrAAAAAAqVt8lvLiL1TjX_sXHJZuOTUOQj";
renderGoogleButton();

var loginAction = function () {
    if (!$("#username").val() || !$("#dz-password").val()) {
        toastr.error('Por favor, completa todos los campos.', 'Error');
        return;
    }

    // Ejecuta reCAPTCHA v3 y luego llama a la API
    grecaptcha.ready(function () {
        grecaptcha.execute(tokenRecaptcha, { action: 'login' }).then(function (token) {
            const data = {
                usuario: $("#username").val(),
                password: btoa($("#dz-password").val()),
                token_recaptcha: token
            };
            makeAjaxRequest('/login', 'POST', data, handleLoginResponse);
        });
    });
};

function handleCredentialResponse(response) {
    const token = response.credential;
    makeAjaxRequest("/login/google", 'POST', { credential: token }, handleLoginResponse);
}

function makeAjaxRequest(url, method, data, successCallback, errorCallback) {
    $.ajax({
        url: URL_BACKEND + url,
        method: method,
        dataType: "json",
        data: JSON.stringify(data),
        headers: {
            "token_recaptcha": tokenRecaptcha,
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        success: successCallback,
        error: errorCallback || function (xhr, status, error) {
            toastr.error('Ha ocurrido un error inesperado', 'Error');
        }
    });
}

function handleLoginResponse(response) {
    if (response.success) {
        //console.log(response)
        //sessionStorage.setItem('access_token', response.access_token);
        //sessionStorage.setItem('idUsuario', response.data.id);
        //sessionStorage.setItem('nombre_user', response.data.nombre);
        //sessionStorage.setItem('avatar', response.data.avatar);
        var now = new Date();
        now.setMinutes(now.getMinutes() + tiempo_para_expirar);
        sessionStorage.setItem('session_expirate', now)
        window.location.href = "/src/login/index.html?token="+response.access_token
    } else {
        toastr.error(response.message, 'Error');
    }
}

// Google Identity Services: render siempre el botón
function renderGoogleButton() {
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: "455558882520-mbkd8jsjj3ea5geo0n939khg38m4m2bd.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large", text: "continue_with", shape: "pill" }
        );
    } else {
        // Si Google aún no está disponible, reintenta hasta que cargue
        setTimeout(renderGoogleButton, 300);
    }
}

