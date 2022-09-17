/* How To Include Toast */
/* 
1. add _custom_toast class to element
   add data-toast-message="<Message Here>" attribute to element

2. Toast HTML 
    <div id="custom-toast-body"></div>
*/

$(document).ready(function() {

    $(document).on('click', '._custom_toast', function() {
        // clearTimeout();
        var _show_toast = $(this).data("phasvariations") ? 1 : 0;

        if(!_show_toast) {
            $('#custom-toast-body').html($(this).data('toast-message'));
            $('#custom-toast-body').addClass('show');
    
            setTimeout(function(){
                $('#custom-toast-body').removeClass('show');
                $('#custom-toast-body').html("");
            }, 3000);
        }
    });

});