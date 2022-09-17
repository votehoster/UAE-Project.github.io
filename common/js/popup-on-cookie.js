/* popup script */

$(document).ready(function () {

    var __website_id = $('.__website_id').val();

    /* popup cookie check */
    if ($.cookie('__popup_' + __website_id) == null) {
        /* api call popup */
        $.ajax({
            method: "get",
            url: "/popups/get?website_id=" + __website_id,
            success: function (response) {
                if (response.popup != null && response.popup.active) {
                    // console.log(response);
                    $('#popup .popup__text').html(response.popup.content);

                    if (response.popup.has_btn && response.popup.btn_name && response.popup.btn_url) {
                        $('#popup .popup__button__div').removeClass('hide').addClass('show');
                        $('#popup .popup__button').text(response.popup.btn_name);
                        $('#popup .popup__button').attr('href', response.popup.btn_url);
                        $('#popup .popup__button').attr('target', '_blank');
                    }

                    var delay = response.popup.delay * 1000;

                    // Show popup       
                    setTimeout(function () {
                        $(".popup").addClass("is-on");
                    }, delay);

                    // Create expiring cookie, 3 days from now:
                    $.cookie('__popup_' + __website_id, '1', { expires: 1, path: '/' });
                }
            },
            error: function (response) {
                console.log(response);
            }
        });
    }

    $("#popup__close").on("click", function () {
        $(".popup").removeClass("is-on");
    });

});
