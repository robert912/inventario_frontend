

$(document).ready(function () {
    $('.show-pass').on('click', function () {
        const passwordInput = $('#dz-password');
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            passwordInput.attr('type', 'text');
        } else {
            passwordInput.attr('type', 'password');
        }
    });
});

document.getElementById("dz-password").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        loginAction();
    }
});