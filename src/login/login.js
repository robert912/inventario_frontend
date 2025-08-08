

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
