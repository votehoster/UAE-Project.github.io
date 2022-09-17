/********************
*** E-commerce Module
********************/



// const { fx, data } = require("jquery");

// Master (#_ecom_addtocart) AddToCart Button
$(document).on('click', '._ecom_addtocart', function() {
    var $this = $(this);
   
    var isProductDetailsPage = $this.data("pdetailspage");
  
    if($this.data("phasvariations") == 1 && isProductDetailsPage == 0 || isProductDetailsPage == 1 && ( $('#_pd_choices_area .p-variant:not(:has(:radio:checked))').length == $this.data("pvariationslength") || $('#_pd_choices_area .p-variant:not(:has(:radio:checked))').length > 0 ) && $this.data("pvariationslength") != 0 ) {
        // open variants popup
        $('#pqv-popup-bg').addClass('pqv-bg-open');
        $('#pqv-popup').addClass('pqv-wrap-open');

        // set variant details in popup
        $('#pqv-popup #pqv-data #pqv-data-pname').html($this.data('pname'));
        $('#pqv-popup #pqv-data #pqv-data-pcurrency').html($this.data('pcurrency'));
        $('#pqv-popup #pqv-data #pqv-data-pprice').html($this.data('pprice'));

        var variationsLength = $this.data("pvariationslength");
        var variationsStringToAppend = "";
        var cuurentStringToAppend = "";

        if(variationsLength > 0) {
            for(var i=1; i <= variationsLength; i++) {
                cuurentStringToAppend = cuurentStringToAppend + '<div class="p-variant"> <p class="p-variant-label">'+ $this.data('pvariationslabel-'+ i) +':</p>';
                var currentLabelValuesLength = $this.data('pvariationslabel-'+ i +'-choiceslength');
                if(currentLabelValuesLength > 0) {
                    var cuurentValuesStringToAppend = "";
                    for(var j=1; j <= currentLabelValuesLength; j++) {
                        var temp = '<div class="p-variant-choice">'+
                            '<input type="radio" class="pqv-variation-choice" value="'+ $this.data('pvariationslabelvalue-'+ i +'-'+j) +'" name="variant-label-'+ i +'" id="popup-variant-l-'+ i +'-c-'+ j +'">'+
                            '<label for="popup-variant-l-'+ i +'-c-'+ j +'">'+ $this.data('pvariationslabelvalue-'+ i +'-'+j) +'</label>'+
                            '</div>';
                        cuurentValuesStringToAppend = cuurentValuesStringToAppend + temp;
                    }
                    cuurentStringToAppend = cuurentStringToAppend + cuurentValuesStringToAppend;
                }
                cuurentStringToAppend = cuurentStringToAppend + '</div>';
            }
        }

        // DOM Append product variant choices
        variationsStringToAppend = cuurentStringToAppend;
        $('#pqv-popup #pqv-data #pqv-choices-area').html(variationsStringToAppend);

        // Update Popup Product Details 
        function updatePopupProductDetails() {
            var selected_choices_array = [];
            var allChoicesDIV = $('#pqv-choices-area .p-variant');
            allChoicesDIV.each(function() {
                var tempString = "";
                var vlabeltext = $(this).find(".p-variant-label").text().replace(':', '');
                var vchoicevalue = $(this).find(".p-variant-choice input[type='radio']:checked").val();
                tempString = vlabeltext + "::" + vchoicevalue ;
                selected_choices_array.push(tempString);
            });
            $.ajax({
                method: "post",
                url: "/check/product/variation/availability",
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    website_id: $('.__website_id').val(),
                    product_id: $('#pqv-addtocart-btn').data('pid'),
                    selected_choices: JSON.stringify(selected_choices_array) 
                },
                success: function (response) {
                    var api_available_stock_count = response.available_stock_count ? response.available_stock_count : -1;
                    var pqv_quantity_val = $('#pqv-data #pqv-pquantity').val() ? $('#pqv-data #pqv-pquantity').val() : 1 ;
        
                    if(response.p_currency) {
                        $('#pqv-data ._pqv_currency').html(response.p_currency);
                    }
                    if(response.p_price) {
                        $('#pqv-data ._pqv_price').html(response.p_price);
                        $('#pqv-popup #pqv-addtocart-btn').attr('data-pprice', response.p_price);
                    }
                    
                    if(response.p_has_discount) {
                        $('#pqv-data ._pqv_price').html(response.p_discounted_price);
                        $('#pqv-data ._pqv_price').append( "&nbsp; <del> " + response.p_price + " </del>" );

                        $('#pqv-popup #pqv-addtocart-btn').attr('data-phasdiscount', 1);
                        $('#pqv-popup #pqv-addtocart-btn').attr('data-pdiscount', response.p_discount_amount);
                    }
        
                    if(response.has_inventory_enable && api_available_stock_count != -1) {
                        if(api_available_stock_count >= pqv_quantity_val) {
                            $('#pqv-popup #pqv-addtocart-btn').removeClass('disabled');
                            $('#pqv-data ._pqv_error_msg').html('');
                        } else {
                            $('#pqv-data ._pqv_error_msg').html('Available Stock : ' + api_available_stock_count);
                            $('#pqv-popup #pqv-addtocart-btn').removeClass('disabled');
                        }
                    } else {
                        $('#pqv-popup #pqv-addtocart-btn').removeClass('disabled');
                    }
        
                },
                error: function (response) {
                    console.error(response);
                    $('#pqv-popup #pqv-addtocart-btn').removeClass('disabled');
                }
            });  
           
            // $.ajax({
            //     method: "post",
            //     url: "/calculate/product/tax",
            //     data: {
            //         website_id: $('.__website_id').val(),
            //         _token: $('meta[name="csrf-token"]').attr('content'),
            //         product_id: myCartArray[i].p_id,
            //         price: myCartArray[i].p_price,
            //     },
            //     success: function (response) {
            //         console.log(response) 
            //         console.log(myCartArray[i].p_price);                    
            //     },
            //     error: function (response) {                     
            //         console.log(response);
            //     }
            // })
        }

        // on selection of all radio button, enable add-to-cart btn
        $('#pqv-popup #pqv-data #pqv-choices-area').on('change', '.pqv-variation-choice', function() {
            if ($('#pqv-popup #pqv-data #pqv-choices-area .p-variant:not(:has(:radio:checked))').length == 0) {
                updatePopupProductDetails();
            }
        });

        // insert add-to-cart button
        var popupBtnString = '<a href="javascript:void(0);" '+
                'id="pqv-addtocart-btn"  '+
                'class="add-to-cart-btn disabled addtocart-btn _custom_toast _ecom_addtocart"  '+
                'type="button"  '+
                'data-toast-message=\'<i class="fas fa-check-circle"></i> Added To Cart\'  '+
                'data-button-type="text"  '+
                'data-phasvariations= "0" '+
                'data-pselectedchoicesarray=""  '+
                'data-btnispopupaddtocart="1"> '+
                '<i class="fas fa-cart-plus"></i> Add To Cart </a>';
            
        $('#pqv-popup #pqv-pquantity').after(popupBtnString)

        // Data Attributes for add-to-cart
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pid', $this.data('pid'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-purl', $this.data('purl'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pimage', $this.data('pimage'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-ptype', $this.data('ptype'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pcategory', $this.data('pcategory'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pname', $this.data('pname'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pcurrency', $this.data('pcurrency'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pprice', $this.data('pprice'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pdiscount', $this.data('pdiscount'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pquantity', $this.data('pquantity'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pshippingcost', $this.data('pshippingcost'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-ptaxcost', $this.data('ptaxcost'));
        $('#pqv-popup #pqv-addtocart-btn').attr('data-phasdiscount', $this.data('phasdiscount'));        
        $('#pqv-popup #pqv-addtocart-btn').attr('data-pvariationslength', $this.data('pvariationslength'));        

        // quantity update add-to-cart
        $('#pqv-popup #pqv-pquantity').on('change paste keyup', function() {
            $('#pqv-popup #pqv-addtocart-btn').attr('data-pquantity', $(this).val());
        });

        // Category Link
        if($this.data('pcategory')) {
            $('#pqv-popup #pqv-data .product-categories-row').css('display', 'block');
            $('#pqv-popup #pqv-data #pqv-data-pcategory').html($this.data('pcategory'));
            $('#pqv-popup #pqv-data #pqv-data-pcategory').attr('href', "/products/list/1/"+$this.data('pcategory'));
        }

    } else {       
        addToLS($this);
        doCartCalc();
        cartFirstPaint();
        replaceWithCartLink($this);
    }

    return false;
});

function getSelectedChoicesArray() {
    var allChoicesDIV = $('#pqv-popup #pqv-data #pqv-choices-area .p-variant');
    var selectedChoicesArray = [];
    allChoicesDIV.each(function() {
        var tempObj = {};
        var vlabeltext = $(this).find(".p-variant-label").text().replace(':', '');
        var vchoicevalue = $(this).find(".p-variant-choice input[type='radio']:checked").val();
        tempObj[vlabeltext]= vchoicevalue;
        selectedChoicesArray.push(tempObj);
    });
    return selectedChoicesArray;
}

function getProductDetailsSelectedChoicesArray() {
    var allChoicesDIV = $('#_pd_choices_area .p-variant');
    var selectedChoicesArray = [];
    allChoicesDIV.each(function() {
        var tempObj = {};
        var vlabeltext = $(this).find(".p-variant-label").text().replace(':', '');
        var vchoicevalue = $(this).find(".p-variant-choice input[type='radio']:checked").val();
        tempObj[vlabeltext]= vchoicevalue;
        selectedChoicesArray.push(tempObj);
    });
    return selectedChoicesArray;
}


// FOR : When any of product variant choice is changes OR
// To check product stock availability and update price/sku of product
function updateProductDetails() {
    var selected_choices_array = [];
    var allChoicesDIV = $('#_pd_choices_area .p-variant');
    allChoicesDIV.each(function() {
        var tempString = "";
        var vlabeltext = $(this).find(".p-variant-label").text().replace(':', '');
        var vchoicevalue = $(this).find(".p-variant-choice input[type='radio']:checked").val();
        tempString = vlabeltext + "::" + vchoicevalue ;
        selected_choices_array.push(tempString);
    });
    
    $.ajax({
        method: "post",
        url: "/check/product/variation/availability",
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            website_id: $('.__website_id').val(),
            product_id: $('#_pd_addtocart_btn').data('pid'),
            selected_choices: JSON.stringify(selected_choices_array) 
        },
        success: function (response) {           
             var imagepath = '../'+'../'+ response.p_variation_path +'/'+response.p_variation_image;            
             localStorage.setItem("variation_tax",response.p_price);
            var api_available_stock_count = response.available_stock_count ? response.available_stock_count : -1;
            var pd_quantity_val = $('#_pd_variation_data #pd-quantity-input').val() ? $('#_pd_variation_data #pd-quantity-input').val() : 1 ;
            if(response.p_variation_path && response.p_variation_image ){     
                $(".variation_image").attr("src",imagepath)
                $(".variation_image").attr("alt",response.p_variation_image)
                $(".variation_image").attr("title",response.p_variation_image)
                $(".variation_image_link").attr("href",imagepath)            
                $('.autoplay').slick('slickPause')      
                        $('.slick-prev').hide()
                        $('.slick-next').hide()             
                    for(var i=0;i<6;i++){
                    $("#variation_image_thumbnail").remove()
                    }            
            }
            if(response.p_currency) {
                $('#_pd_variation_data ._pd_variation_pcurrency').html(response.p_currency);
            }
            if(response.p_price) {
                $('#_pd_variation_data ._pd_variation_pprice').html(response.p_price);
                $('#_pd_addtocart_btn').attr('data-pprice', response.p_price);
            }
            if(response.p_has_discount && response.p_discounted_price) {
                if($('#_pd_variation_data ._pd_variation_pdiscounted_price').length > 0) {
                    $('#_pd_variation_data ._pd_variation_pdiscounted_price').html(response.p_discounted_price);

                    $('#_pd_addtocart_btn').attr('data-phasdiscount', 1);
                    $('#_pd_addtocart_btn').attr('data-pdiscount', response.p_discount_amount);
                } else {
                    $('#_pd_variation_data ._pd_variation_pprice').html(response.p_discounted_price);
                    $('#_pd_variation_data ._pd_variation_pprice').append( "&nbsp; <del> " + response.p_price + " </del>" );
                    $('#_pd_addtocart_btn').attr('data-phasdiscount', 1);
                    $('#_pd_addtocart_btn').attr('data-pdiscount', response.p_discount_amount);
                }
            }
            if(response.p_sku) {
                $('#_pd_variation_data ._pd_variation_psku').html(response.p_sku);
            }

            if(response.has_inventory_enable && api_available_stock_count != -1) {
                if(api_available_stock_count >= pd_quantity_val) {
                    $('#_pd_addtocart_btn').removeClass('_disabled');
                } else {
                    $('#_pd_variation_data ._pd_error_msg').html('Available Stock : ' + api_available_stock_count);
                    $('#_pd_addtocart_btn').addClass('_disabled');
                }
            } else {
                $('#_pd_addtocart_btn').removeClass('_disabled');
            }

        },
        error: function (response) {
            console.error(response);
            $('#_pd_addtocart_btn').addClass('_disabled');
        }
    });    
}
// on radio-button change
$('#_pd_choices_area').on('change', '.pd-variation-choice', function() {
    if ($('#_pd_choices_area .p-variant:not(:has(:radio:checked))').length == 0) {
        updateProductDetails();
        // $('#_pd_addtocart_btn').removeClass('_disabled');
    }
});

// Variant popup close on cross click and bg click
function closeVariantPopup() {
    $('#pqv-popup-bg').removeClass('pqv-bg-open');
    $('#pqv-popup').removeClass('pqv-wrap-open');
    $('#pqv-popup #pqv-addtocart-btn').remove();
    
    $('#pqv-popup #pqv-data-pname').empty();
    $('#pqv-popup #pqv-data-pprice').empty();
    $('#pqv-popup #pqv-choices-area').empty();
    
    $('#pqv-popup #pqv-choices-area').off();
}
$('#pqv-popup-bg').on('click', function() {
    closeVariantPopup();
});
$('#pqv-popup-close-btn').on('click', function() {
    closeVariantPopup();
});

// Replace Button Text and Link For CartPage
function replaceWithCartLink($this) {
    if($this.data('button-type') == 'text') {
        $this.html('View Cart <i class="fas fa-external-link-alt"></i>');
    } else if($this.data('button-type') == 'icon') {
        $this.html('<i class="fas fa-external-link-alt"></i>');
    }
    $this.removeClass('_custom_toast _ecom_addtocart');
    $this.prop('href', '/cart');
    $this.attr('title', 'view cart');
    $this.off('click');
}

// RE-Calculate CartAmounts (use if needed)
$('._do_cart_calc').click(function() {
    doCartCalc();
    showCartAmounts();
});

// To Check Cart-Product-Availability
$('#cart-pd-place-order').click(function() {
    var cart_details = getLS('wCart');

    $('#cart-pd-place-order').attr('disabled','disabled');
    $('#cart-pd-place-order').addClass('disabled');
    $('.cart-pd-action-btn .pin-loader').removeClass('hide');

    $.ajax({
        method: "post",
        url: "/check/product/availability",
        data: {
            cart_details: JSON.stringify(cart_details),
            website_id: $('.__website_id').val(),
            _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            $('#cart-pd-place-order').removeAttr('disabled');
            $('#cart-pd-place-order').removeClass('disabled');
            $('.cart-pd-action-btn .pin-loader').addClass('hide');

            if(response.success === 1) {
                var avail_products = response.product_status;
                var vaild_products = 0;

                if(avail_products.length > 0) {
                    for (var i = 0; i < avail_products.length; i++) {
                        if(!avail_products[i].avail) {
                            $('._pcard_id_'+avail_products[i].p_id).addClass('not-available');
                            if(avail_products[i].stock_count > 0) {
                                $('._pcard_id_'+avail_products[i].p_id +' .cp-available-msg').html('max available stock quantity is '+avail_products[i].stock_count);
                            } else if (avail_products[i].stock_count === 0 || !avail_products[i].stock_count) {
                                $('._pcard_id_'+avail_products[i].p_id +' .cp-available-msg').html('Out Of Stock');
                            }
                        } else {
                            $('._pcard_id_'+avail_products[i].p_id).removeClass('not-available');
                            $('._pcard_id_'+avail_products[i].p_id +' .cp-available-msg').html('');
                            vaild_products++;
                        }
                    }

                    if(vaild_products === avail_products.length) {
                        var redirectUrl = "/checkout";
                        window.location.href = redirectUrl;
                    }
                }
            }

            // TODO: ask why error parameter
            // if(response.error === 0) {
            //     console.log("res.err = 0, availability error");
            // }
        },
        error: function (response) {
            $('#cart-pd-place-order').removeAttr('disabled');
            $('#cart-pd-place-order').removeClass('disabled');
            $('.cart-pd-action-btn .pin-loader').addClass('hide');
        }
    })
});

// Part of availability check


$(document).ready(function() {

    // For product details page :enable add-to-cart button if product does not have variations 
    $('._ecom_addtocart').each(function() {
        if($(this).data('phasvariations') == 0) {
            $(this).removeClass('_disabled');
        }
    });

    // For product variation popup :enable add-to-cart button if product does not have variations 
    $('._ecom_addtocart').each(function() {
        if($(this).data('phasvariations') == 0) {
            $(this).removeClass('_disabled');
        }
    });

    // CartProducts Paint From LS
    cartFirstPaint();

    // Checkout First Paint
    if(getLS("wCart") != null || getLS("wCart_details") != null) {
        showCheckoutAmounts();
    }

    // Toggle Navbar Cart Dropdown
    $('#navbar-cart .cart-dropdown__trigger').on('click',function() {
        $('#navbar-cart .cart-dropdown').toggleClass('cart-dropdown_open');
    });

    // On Doc Reday Check Form CartIsCreated in LocalStorage
    if(getLS("wCart") === null) {
        noItemInCart();
    } else {
        // #(MASTER CHECK) Checking For: cart, checkout, payment page shimmer effect check
        // MekeCartVisble only if array.length is > 0
        if(getLS("wCart").length > 0) {
            $('.cart-shimmer-effect').css('display','none');
            // If on cart page
            $('.cart').css('display','block');
            // If on checkout page
            $('.checkout').css('display','block');
        }

        // To Bind Quantity-Up-Down Event After Doc Ready
        $('.cp-minus-btn').on('click', function(e) {
            e.preventDefault();
            var $this = $(this);
            var $qinput = $this.closest('div').find('input');
            var value = parseInt($qinput.val());
            var itemp_pid = $qinput.data("itemp_pid");

            if (value > 1) {
                value = value - 1;
            } else {
                value = 1;
            }
            $qinput.val(value);

            // Update Product Quantity
            updateProductQuantity(itemp_pid, value);

            // Do Cart-Calculation
            doCartCalc();

        });
         
        $('.cp-plus-btn').on('click', function(e) {
            e.preventDefault();
            var $this = $(this);
            var $qinput = $this.closest('div').find('input');
            var value = parseInt($qinput.val());
            var itemp_pid = $qinput.data("itemp_pid");
             
            if (value < 100) {
                value = value + 1;
            } else {
                value =100;
            }
            $qinput.val(value);

            // Update Product Quantity
            updateProductQuantity(itemp_pid, value);

            // Do Cart-Calculation
            doCartCalc();

        });

        // Product Remove Button Clicked
        $('._remove_prod_btn_').on('click', function(e) {
            var $this = $(this);
            var prod_id = $this.data("prod_id");

            // remove product-card from cart page
            $('#wcart-content ._pcard_id_'+prod_id).fadeOut();
            // remove product-list-item from navbar cart-list
            $('#navbar-cart ._plist_item_id_'+prod_id).fadeOut();

            deleteProduct(prod_id);
            doCartCalc();
        });

        // NAVBAR: Product Remove Button Clicked
        $('#navcart-item-list').on('click', '.navbar_remove_prod_btn_',function(e) {
            var $this = $(this);
            var prod_id = $this.data("prod_id");

            // remove product-card from cart page
            $('#wcart-content ._pcard_id_'+prod_id).fadeOut();

            // remove product-list-item from navbar cart-list
            $('#navbar-cart ._plist_item_id_'+prod_id).fadeOut();

            deleteProduct(prod_id);
            doCartCalc();
        });

    }

});

function cartFirstPaint() {
    var cartProduct = getLS("wCart");
    var cartDetails = getLS("wCart_details");
    if(cartProduct != null && cartDetails != null) {
        if(cartProduct.length > 0) {
            $('#navbar-cart #navcart-item-list').empty();

            for (var i = 0; i < cartProduct.length; i++) {
                // append product cards For CART_PAGE
                $('#wcart #wcart-content #wcart-content-inject').append(makeProductCard(cartProduct[i]));

                // append product item-list For NavBar-CART
                $('#navbar-cart #navcart-item-list').append(makeProductListItem(cartProduct[i]));
            }
            showCartAmounts();
            showCheckoutAmounts();
        } else {
            noItemInCart();
        }
    }
}

// Local-Storage Getter-Setter
function getLS(para) { return JSON.parse(localStorage.getItem(para)); }
function setLS(para1, para2) {
    localStorage.setItem(para1, JSON.stringify(para2));
}

// Update Specific Product Quantity
function updateProductQuantity(pid, quantity) {
    var myCartArray = getLS("wCart");

    if(myCartArray.length > 0) {
        for (var i = 0; i < myCartArray.length; i++) {
            if(pid === myCartArray[i].p_id) {
                myCartArray[i].p_quantity = quantity;
            }
        }
    }
    setLS("wCart", myCartArray);
}

// Delete Specific Product Quantity
function deleteProduct(pid) {
    var myCartArray = getLS("wCart");

    if(myCartArray.length > 0) {
        for (var i = 0; i < myCartArray.length; i++) {
            if(pid === myCartArray[i].p_id) {
                myCartArray.splice(i, 1);
            }
        }
    }

    if(myCartArray.length === 0) {
        $('.cart').css('display','none');
        $('#wcart-empty-block').css('display','block');

        $('.checkout').css('display','none');
        $('#wch-empty-block').css('display','block');
    }

    setLS("wCart", myCartArray);
}

function addToLS($this) {
    // var newThis = $this;
    if(getLS("wCart") === null) {
        setLS("wCart", []);
    }

    if($this.data('btnispopupaddtocart')) {
        var choicesArray = getSelectedChoicesArray();
        $this.data('pselectedchoicesarray', JSON.stringify(choicesArray));
    }

    if($this.data('phasvariations') && $this.data('pdetailspage')) {
        var choicesArray = getProductDetailsSelectedChoicesArray();
        $this.data('pselectedchoicesarray', JSON.stringify(choicesArray));
    }

    var myCartArray = getLS("wCart");

    if(myCartArray.length > 0) {
        var isNew = true;

        for (var i = 0; i < myCartArray.length; i++) {
            if (myCartArray[i].p_id == $this.data('pid')) {
                myCartArray[i].p_quantity++;
                isNew = false;
            }
        }

        if(isNew) {
            myCartArray.push(makeObj($this));
            setLS("wCart", myCartArray);
        } else {
            setLS("wCart", myCartArray);
        }
    } else {
        myCartArray.push(makeObj($this));
        setLS("wCart", myCartArray);
    }

    if(myCartArray.length == 1) {
        $('#navbar-cart-empty-block').css('display','none');
    }
}

function makeObj($this) {
    var tempObj = {
        "p_id": $this.data('pid'),
        "p_url": $this.data('purl'),
        "p_image": $this.data('pimage'),
        "p_type": $this.data('ptype'),
        "p_category": $this.data('pcategory'),
        "p_name": $this.data('pname'),
        "p_currency": $this.data('pcurrency'),
        "p_price": parseFloat($this.data('pprice')),
        "p_unitprice": parseFloat($this.data('pprice')),
        "p_selectedchoicesarray": ($this.data('pselectedchoicesarray')),
        "p_discount": parseFloat($this.data('pdiscount')),
        "p_quantity": parseFloat($this.data('pquantity')),
        "p_shippingcost": parseFloat($this.data('pshippingcost')),
        "p_taxcost": parseFloat($this.data('ptaxcost')),
        "p_hasdiscount": $this.data('phasdiscount'),
        "p_totaldiscount": parseFloat($this.data('pdiscount')),
        "p_shippingtotalcost": parseFloat($this.data('pshippingcost')),
        "p_taxtotalcost": parseFloat($this.data('ptaxcost')),
        "p_ptotal_": parseFloat($this.data('pprice'))
    };
    return tempObj;
}

function makeProductCard(obj) {
    var selectedChoicesString = '';
    if(obj.p_selectedchoicesarray) {
        var tempArray = JSON.parse(obj.p_selectedchoicesarray);
        tempArray.forEach(function(iobj) {
            for (let key in iobj){
                selectedChoicesString += '<div class="cp-variant"><span>'+ key +':</span> <span>'+ iobj[key] +'</span> </div>';
            }
        });
    }

    if(obj.p_hasdiscount) {
        var myCardString = '<div class="cc-product-row _parent_card_row _pcard_id_'+ obj.p_id +'">'+
        '<div class="bs4-row row">'+
        '<div class="bs4-col-md-6 col-md-6">'+
        '<div class="cp-info-wrap">'+
        '<div class="cp-info">'+
        '<div class="cp-name-wrap">'+
        '<div class="cp-name">'+
        '<a href="'+ obj.p_url +'">'+ obj.p_name +'</a>'+
        '</div>'+
        '</div>'+
        '<div class="cp-category">'+
        'Category: '+ obj.p_category +''+
        '</div>'+
        '<div>'+ selectedChoicesString +'</div>'+
        '<div class="cp-product-actions">'+
        '<div class="cp-quantity-wrap _quantity_change">'+
        '<span class="qtitle">Quantity: </span> '+
        '<div class="cp-quantity">'+
        '<button class="cp-minus-btn _do_cart_calc" type="button" name="button">'+
        '<i class="fas fa-minus-circle"></i>'+
        '</button>'+
        '<input type="text" id="cp-quantity-'+ obj.p_id +'" class="bs3-cart-input-style _set_prod_quantity" data-itemp_pid='+ obj.p_id +' name="name" value="'+ obj.p_quantity +'" disabled>'+
        '<button class="cp-plus-btn _do_cart_calc" type="button" name="button">'+
        '<i class="fas fa-plus-circle"></i>'+
        '</button>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<div class="bs4-col-md-6 col-md-6">'+
        '<div class="cp-price-wrap">'+
        '<div class="cp-price">'+
        '<span>Price:</span>'+
        '<span class="price-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_price">'+ obj.p_price +'</span></span>'+
        '</div>'+
        '<div class="cp-discount">'+
        '<span>Discount:</span>'+
        '<span class="discount-amount"> - <span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_discount">'+obj.p_discount +'</span></span>'+
        '</div>'+
        '<div class="cp-tax">'+
        '<span>Tax:</span>'+
        '<span class="tax-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_taxtotalcost">'+ obj.p_taxtotalcost +'</span></span>'+
        '</div>'+
        '<div class="cp-shipping">'+
        '<span>Shipping Charges:</span>'+
        '<span class="shipping-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_shippingtotalcost">'+ obj.p_shippingtotalcost +'</span></span>'+
        '</div>'+
        '<div class="cp-total">'+
        '<span>Total:</span>'+
        '<span class="total-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_ptotal_">'+ obj.p_ptotal_ +'</span></span>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<div class="bs4-row row">'+
        '<div class="bs4-col-md-8 col-md-8">'+
        '<div class="cp-available-msg">'+
        '</div>'+
        '</div>'+
        '<div class="bs4-col-md-4 col-md-4">'+
        '<div class="cp-row-action">'+
        '<button class="cp-remove-btn _do_cart_calc _remove_prod_btn_" data-prod_id="'+ obj.p_id +'"><i class="far fa-trash-alt"></i> REMOVE</button>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>';
    } else {
        var myCardString = '<div class="cc-product-row _parent_card_row _pcard_id_'+ obj.p_id +'">'+
        '<div class="bs4-row row">'+
        '<div class="bs4-col-md-6 col-md-6">'+
        '<div class="cp-info-wrap">'+
        '<div class="cp-info">'+
        '<div class="cp-name-wrap">'+
        '<div class="cp-name">'+
        '<a href="'+ obj.p_url +'">'+ obj.p_name +'</a>'+
        '</div>'+
        '</div>'+
        '<div class="cp-category">'+
        'Category: '+ obj.p_category +''+
        '</div>'+
        '<div>'+ selectedChoicesString +'</div>'+
        '<div class="cp-product-actions">'+
        '<div class="cp-quantity-wrap _quantity_change">'+
        '<span class="qtitle">Quantity: </span> '+
        '<div class="cp-quantity">'+
        '<button class="cp-minus-btn _do_cart_calc" type="button" name="button">'+
        '<i class="fas fa-minus-circle"></i>'+
        '</button>'+
        '<input type="text" id="cp-quantity-'+ obj.p_id +'" class="bs3-cart-input-style _set_prod_quantity" data-itemp_pid='+ obj.p_id +' name="name" value="'+ obj.p_quantity +'" disabled>'+
        '<button class="cp-plus-btn _do_cart_calc" type="button" name="button">'+
        '<i class="fas fa-plus-circle"></i>'+
        '</button>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<div class="bs4-col-md-6 col-md-6">'+
        '<div class="cp-price-wrap">'+
        '<div class="cp-price">'+
        '<span>Price:</span>'+
        '<span class="price-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_price">'+ obj.p_price +'</span></span>'+
        '</div>'+
        '<div class="cp-tax">'+
        '<span>Tax:</span>'+
        '<span class="tax-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_taxtotalcost">'+ obj.p_taxtotalcost +'</span></span>'+
        '</div>'+
        '<div class="cp-shipping">'+
        '<span>Shipping Charges:</span>'+
        '<span class="shipping-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_shippingtotalcost">'+ obj.p_shippingtotalcost +'</span></span>'+
        '</div>'+
        '<div class="cp-total">'+
        '<span>Total:</span>'+
        '<span class="total-amount"><span class="_set_currency">'+ obj.p_currency +'</span>'+
        '&nbsp; <span class="_set_prod_ptotal_">'+ obj.p_ptotal_ +'</span></span>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<div class="bs4-row row">'+
        '<div class="bs4-col-md-8 col-md-8">'+
        '<div class="cp-available-msg">'+
        '</div>'+
        '</div>'+
        '<div class="bs4-col-md-4 col-md-4">'+
        '<div class="cp-row-action">'+
        '<button class="cp-remove-btn _do_cart_calc _remove_prod_btn_" data-prod_id="'+ obj.p_id +'"><i class="far fa-trash-alt"></i> REMOVE</button>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>';

    }

    return myCardString;
}

function makeProductListItem(obj) {
    var selectedChoicesString = '';
    if(obj.p_selectedchoicesarray) {
        selectedChoicesString = '<span class="item-variant-choices">';
        var tempArray = JSON.parse(obj.p_selectedchoicesarray);
        tempArray.forEach(function(iobj) {
            for (let key in iobj){
                selectedChoicesString += '<span class="item-vlabel">'+ key +':</span> <span class="item-vvalue">'+ iobj[key] +'</span> &nbsp;';
            }
        });
        selectedChoicesString += '</span>';
    }

    if(obj.p_hasdiscount) {
        var discounted_price = shrinkFloat(obj.p_unitprice-obj.p_discount);
        var myListItemString = '<li class="cart-dropdown__item _plist_item_id_'+ obj.p_id +'">'+
        '<div class="item-wrap">'+
        '<div class="item-name-remove">'+
        '<div class="i-name-wrap">'+
        '<a href="'+ obj.p_url +'" class="i-name">'+ obj.p_name +'</a>'+
        selectedChoicesString +
        '</div>'+
        '<button class="i-remove navbar_remove_prod_btn_" data-prod_id="'+ obj.p_id +'"><i class="far fa-trash-alt"></i></button>'+
        '</div>'+
        '<div class="item-price-quantity">'+
        '<span class="i-quantity">'+ obj.p_quantity +'</span> x '+
        '<span class="i-d-currency">'+ obj.p_currency +'</span>  '+
        '<span class="i-d-price">'+ discounted_price +'</span>  '+
        '<span class="strick-off">  <span class="i-currency">'+ obj.p_currency +'</span>  '+
        '<span class="i-price">'+ obj.p_unitprice +'</span> </span>'+
        '</div>'+
        '</div>'+
        '</li>';
    } else {
        var myListItemString = '<li class="cart-dropdown__item _plist_item_id_'+ obj.p_id +'">'+
        '<div class="item-wrap">'+
        '<div class="item-name-remove">'+
        '<div class="i-name-wrap">'+
        '<a href="'+ obj.p_url +'" class="i-name">'+ obj.p_name +'</a>'+
        selectedChoicesString +
        '</div>'+
        '<button class="i-remove navbar_remove_prod_btn_" data-prod_id="'+ obj.p_id +'"><i class="far fa-trash-alt"></i></button>'+
        '</div>'+
        '<div class="item-price-quantity">'+
        '<span class="i-quantity">'+ obj.p_quantity +'</span> x '+
        '<span class="i-currency">'+ obj.p_currency +'</span>  '+
        '<span class="i-price">'+ obj.p_unitprice +'</span>'+
        '</div>'+
        '</div>'+
        '</li>';
    }

    return myListItemString;
}

function doCartCalc() {
    if(getLS("wCart") != null) {
        myCartArray = getLS("wCart");
        var tax_for_product;
        var myCartDetailsObj = {
            "cart_currency": "INR",
            "cart_count": 0.00,
            "cart_grandtotal": 0.00,
            "cart_mrp_total": 0.00,
            "cart_taxcost": 0.00,
            "cart_order_total": 0.00,
            "cart_has_discount": 0.00,
            "cart_discount_total": 0.00,
            "cart_shippingcost": 0.00
        };
        
        if(myCartArray.length > 0) {
            for (var i = 0; i < myCartArray.length; i++) {
               

                var prod_unitprice = myCartArray[i].p_unitprice;
                var prod_price = myCartArray[i].p_price;
                var prod_discount = myCartArray[i].p_discount;
                var prod_taxcost = myCartArray[i].p_taxcost;
                var prod_shippingcost = myCartArray[i].p_shippingcost;
                var prod_quantity = myCartArray[i].p_quantity;

                // product array
                myCartArray[i].p_price = shrinkFloat(prod_unitprice*prod_quantity);
                myCartArray[i].p_totaldiscount = shrinkFloat(prod_discount*prod_quantity);
                myCartArray[i].p_taxtotalcost = shrinkFloat(prod_taxcost*prod_quantity);
                myCartArray[i].p_shippingtotalcost = shrinkFloat(prod_shippingcost*prod_quantity);
                myCartArray[i].p_ptotal_ = shrinkFloat(((prod_unitprice*prod_quantity)-myCartArray[i].p_totaldiscount)+(myCartArray[i].p_taxtotalcost)+(myCartArray[i].p_shippingtotalcost));

                // cart object
                myCartDetailsObj.cart_mrp_total += shrinkFloat(prod_unitprice*prod_quantity);
                myCartDetailsObj.cart_mrp_total = shrinkFloat(myCartDetailsObj.cart_mrp_total);

                myCartDetailsObj.cart_taxcost += shrinkFloat(myCartArray[i].p_taxtotalcost);
                myCartDetailsObj.cart_taxcost = shrinkFloat(myCartDetailsObj.cart_taxcost);

                myCartDetailsObj.cart_discount_total += shrinkFloat(myCartArray[i].p_totaldiscount);
                myCartDetailsObj.cart_discount_total = shrinkFloat(myCartDetailsObj.cart_discount_total);

                myCartDetailsObj.cart_order_total += shrinkFloat(((prod_unitprice*prod_quantity)-(myCartArray[i].p_totaldiscount))+(myCartArray[i].p_taxtotalcost));
                myCartDetailsObj.cart_order_total = shrinkFloat(myCartDetailsObj.cart_order_total);

                myCartDetailsObj.cart_shippingcost += shrinkFloat(myCartArray[i].p_shippingcost*prod_quantity);
                myCartDetailsObj.cart_shippingcost = shrinkFloat(myCartDetailsObj.cart_shippingcost);

                myCartDetailsObj.cart_currency = myCartArray[i].p_currency;

                $.ajax({
                    method: "post",
                    url: "/calculate/product/tax",
                    async: false,
                    data: {
                        website_id: $('.__website_id').val(),
                        _token: $('meta[name="csrf-token"]').attr('content'),
                        product_id: myCartArray[i].p_id,
                        price: myCartArray[i].p_price,
                    },
                    success: function (response) {
                         tax_for_product = getLS('wCart')                       
                            for(var i=0; i<tax_for_product.length ; i++){
                                if(tax_for_product[i].p_id == response.p_id){
                                    tax_for_product[i].p_taxcost = response.product_tax
                                    tax_for_product[i].p_taxtotalcost = response.product_tax
                                    setLS("wCart",tax_for_product)                                              
                                }
                            }
                    },
                    error: function (response) {                     
                        console.log(response);
                    }
                })
            }
            // Cart products count
            myCartDetailsObj.cart_count = myCartArray.length;
            // Cart GrandTotal
            myCartDetailsObj.cart_grandtotal = shrinkFloat(myCartDetailsObj.cart_order_total+myCartDetailsObj.cart_shippingcost);

            // Store Product ObjArray
            setLS("wCart",myCartArray);
            // Store CartDetails Obj
            setLS("wCart_details",myCartDetailsObj)
            // setLS("wCart",tax_for_product) 
            // Reflect Calculation Amount
            showCartAmounts();
            showCheckoutAmounts();

        } else {
            $('#navbar-cart ._set_navprod_count').text(0);
            $('#navbar-cart ._set_navcart_total').text(0.00);

            // Store CartDetails Obj
            setLS("wCart_details", {})
            noItemInCart();
        }
    }

}

function shrinkFloat(fnum) {
    return parseFloat(fnum.toFixed(2));
}

function showCartAmounts() {
    var p_array = getLS("wCart");
    var c_obj = getLS("wCart_details");

    if(p_array.length > 0 && !jQuery.isEmptyObject(c_obj)) {
        $('#wcart ._set_currency').text(c_obj.cart_currency);
        $('#navbar-cart ._set_navcart_currency').text(c_obj.cart_currency);

        $('#wcart ._set_product_count').text(c_obj.cart_count);
        $('#wcart ._show_grand_total').text(c_obj.cart_grandtotal);
        $('#navbar-cart ._set_navprod_count').text(c_obj.cart_count);
        $('#navbar-cart ._set_navcart_total').text(c_obj.cart_grandtotal);

        $('#wcart ._show_mrp_cost').text(c_obj.cart_mrp_total);
        $('#wcart ._show_tax_cost').text(c_obj.cart_taxcost);
        $('#wcart ._show_order_cost').text(c_obj.cart_order_total);
        $('#wcart ._show_discount_cost').text(c_obj.cart_discount_total);
        $('#wcart ._show_shipping_cost').text(c_obj.cart_shippingcost);

        for (var i = 0; i < p_array.length; i++) {
            var discount_amount=shrinkFloat(p_array[i].p_discount*p_array[i].p_quantity);
            $('._pcard_id_'+p_array[i].p_id+' ._set_prod_price').text(p_array[i].p_price);
            $('._pcard_id_'+p_array[i].p_id+' ._set_prod_discount').text(discount_amount);
            $('._pcard_id_'+p_array[i].p_id+' ._set_prod_taxtotalcost').text(p_array[i].p_taxtotalcost);
            $('._pcard_id_'+p_array[i].p_id+' ._set_prod_shippingtotalcost').text(p_array[i].p_shippingtotalcost);
            $('._pcard_id_'+p_array[i].p_id+' ._set_prod_ptotal_').text(p_array[i].p_ptotal_);
        }

    } else {
        noItemInCart();
    }
}

function noItemInCart() {
    if($('.cart-shimmer-effect').length > 0) {
        setTimeout(function() {
            $('.cart-shimmer-effect').css('display','none');
            $('#wcart-empty-block').css('display','block');

            $('#navbar-cart-empty-block').css('display','block');

            $('#navbar-cart ._set_navprod_count').text(0);
            $('#navbar-cart ._set_navcart_total').text('-');
        }, 1000);
    } else {
        $('#wcart-empty-block').css('display','block');

        $('#navbar-cart-empty-block').css('display','block');

        $('#navbar-cart ._set_navprod_count').text(0);
        $('#navbar-cart ._set_navcart_total').text('-');
    }
}

// ### CHECKOUT

// #checkout page price details
function showCheckoutAmounts() {
    var p_array = getLS("wCart");
    var c_obj = getLS("wCart_details");

    if(p_array.length > 0 && !jQuery.isEmptyObject(c_obj)) {
        $('#wch-price-details ._set_currency').text(c_obj.cart_currency);

        $('#wch-price-details ._set_product_count').text(c_obj.cart_count);
        $('#wch-price-details ._show_grand_total').text(c_obj.cart_grandtotal);

        $('#wch-price-details ._show_mrp_cost').text(c_obj.cart_mrp_total);
        $('#wch-price-details ._show_tax_cost').text(c_obj.cart_taxcost);
        $('#wch-price-details ._show_order_cost').text(c_obj.cart_order_total);
        // $('#wch-price-details ._show_discount_cost').text(c_obj.cart_discount_total);
        $('#wch-price-details ._show_shipping_cost').text(c_obj.cart_shippingcost);

    } else {
        noItemInCart();
    }
}

$(document).ready(function() {
    updatePayNowBtnText();
    
    // On Change of payment option checkboxes
    $('.wch-payment-options input').on('change', function() {
        updatePayNowBtnText();
    });

    $('#b_as_s_address').on('change', function() {
        $('#toggle-billing-address').slideToggle();
    });

    if($.validate) {
        $.validate({
            form: '#wch-form',
            scrollToTopOnError: false,
            onSuccess : function($form) {
                // Show loader and Disable PLace Order Btn 
                $('#wch-pd-action-btn').attr('disabled','disabled');
                $('#wch-pd-action-btn').addClass('disabled');
                $('.wch-pd-action .pin-loader').removeClass('hide');
    
                var formData = $form.serializeArray();
                var userDataObj = {};
    
                $(formData).each(function (i, field) {
                    userDataObj[field.name] = field.value;
                });
    
                var cart_details = getLS('wCart');
                var cart_totals_details = getLS('wCart_details');
                
                var payment_type = $('.wch-payment-options input[name=payment_option]:checked').val();
                var paypal_payment_email = $('.wch-payment-options input[name=payment_option]:checked').data('paypal-email');
    
                $.ajax({
                    method: "post",
                    url: "/process/cart",
                    data: {
                        cart_details: JSON.stringify(cart_details),
                        customer_details: JSON.stringify(userDataObj),
                        payment_type: payment_type,
                        website_id: $('.__website_id').val(),
                        _token: $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (response) {
                        // Remove Disable From Place Order Btn
                        $('#wch-pd-action-btn').removeAttr('disabled');
                        $('#wch-pd-action-btn').removeClass('disabled');
                        $('.wch-pd-action .pin-loader').addClass('hide');
    
                        if(response.order_status.payment_type === "DIRECT" || response.order_status.payment_type === "COD") {
                            flushCartLS();
                            var redirectUrl = response.order_status.o_id+"/thanks";
                            window.location.href = redirectUrl;
    
                        } else if(response.order_status.payment_type === "PAYPAL") {
                            // flushCartLS();
                            var website_id = $('.__website_id').val();
                            var o_id = response.order_status.o_id;
                            var currency_code =response.order_status.currency;
                            var _token= $('meta[name="csrf-token"]').attr('content');
                            var paypal_email = paypal_payment_email;
                            var item_name_string = "order_id_" + response.order_status.o_id
                            var item_number = response.order_status.ecom_order_id;
                            var item_amount = response.order_status.total_amt;
                            var paypal_return_url = document.location.origin +"/"+response.order_status.o_id+"/thanks";
                            var current_url = document.location.href;
                            var paypal_notify_url = encodeURI("https://websites.co.in/generate/order/invoice?website_id="+website_id+"&o_id="+o_id+"&_token="+_token);
    
                            fx.settings = {from: "USD", to: "USD"};                         
                            fx.rates ={
                                "USD":1,
                            }
                            fx.base="USD";
                            // Currency Conversion to USD
                            let demo = () => {                             
                                let rate;
                                try{
                                    rate = fx(item_amount).from(currency_code).to("USD");
                                }
                                catch(err){
                                    rate = fx(item_amount).from("USD").to("USD");
                                    console.log("error", rate)
                                }
    
                                item_amount = rate.toFixed(2);
    
                                var redirectUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_cart&add=1&business=" + paypal_email + "&item_name=" + item_name_string + "&item_number=" + item_number + "&currency_code=USD&amount=" + item_amount + "&return=" + paypal_return_url + "&cancel_return="+ current_url + "&notify_url="+ paypal_notify_url;
                                
                                
                                window.location.href = redirectUrl;
                                // flushCartLS();
                                
            
                            }   
                            // fetch('https://api.exchangeratesapi.io/latest?base=USD')
                            //     .then((resp) => resp.json())
                            //     .then((data) => fx.rates = data.rates)
                            //     .then(demo);
                            $.ajax({
                                method: "get",
                                url: "/api/convert/to/usd",
                                data: {                                  
                                    website_id: $('.__website_id').val(),
                                    currency_code: currency_code,
                                },
                                success: function (response) {
                                    fx.rates[currency_code] = response.value
                                    demo();
                                },
                                error: function (response) {                     
                                    
                                }                              
                            })
                            
                        }
                        // fsc
                        else if(response.order_status.payment_type === "FSC_PAY") {
                        var s = {
                            'products' : [
                                            {
                                                'path':'book',
                                                'quantity': 1
                                            }
                            ],
                            'checkout': true
                        }
                    
                        fastspring.builder.push(s);
                        // fscPay(response)
                        }

            // FlutterwaveCheckout
            else if(response.order_status.payment_type === "FTLWAVE_PAY") {

                console.log(response.order_status.api_key);
                //alert(JSON.stringify(response.order_status.api_key));

               
                    $.ajax({
                        method: "get",
                        url: "/api/convert/to/convertcurrency",
                        data: {
                            from: response.order_status.currency,
                            to: 'USD',
                            amount: response.order_status.total_amt,
                        },
                        success: function(usdresponse) {
                            // fx.rates[currency_code] = response.value
                            // demo();
                            console.log(JSON.stringify(usdresponse.value));

                        if (usdresponse.value>= 1000){
                            alert("Amount should be less than 1000 USD, please try with another payment gateway!");
                           }
                         else { 
                            var o_id = response.order_status.o_id;
                            var testAmount = response.order_status.total_amt;
                            var _token = $('meta[name="csrf-token"]').attr('content');
                            var website_id = $('.__website_id').val();
                            // const API_publicKey = response.order_status.api_key;

                 
                            var o_id = response.order_status.o_id;
                            var testAmount = response.order_status.total_amt;
                            var _token = $('meta[name="csrf-token"]').attr('content');
                            var website_id =  $('.__website_id').val();
                            // const API_publicKey = response.order_status.api_key;
                            var FLUTTERWAVE_SECRET = response.order_status.api_secret_key;

                            var CurrencyUsing = "USD";
                            var AmountUsing = usdresponse.value;
                            var currencyFromdashBoard = response.order_status.currency; 

                            //Checking if current currency is supported by flutterwave (USD is removed)
                            var flutterwave_supported_currencies_arr = ['CFA','CAD','CVE','GHS','MUR','EGP','EUR','GMD','GNF','KES','LRD','MWK','MAD','MZN','NGN','RWF','SLL','STD','ZAR','TZS','UGX','XAF','XOF','ZMK','ZMW','ARS'];
                            if(flutterwave_supported_currencies_arr.includes(currencyFromdashBoard)){
                                CurrencyUsing = response.order_status.currency;
                                AmountUsing = response.order_status.total_amt; 
                                //Rounding up amount
                                AmountUsing = Math.ceil(AmountUsing); 
                            }

                            FlutterwaveCheckout ({
                                // PBFPubKey: API_publicKey,
                                public_key:response.order_status.api_key,
                                // response.order_status.api_key,
                                //"FLWPUBK_TEST-SANDBOXDEMOKEY-X"
                                tx_ref: Date.now(),
                                amount:AmountUsing,
                                currency: CurrencyUsing,
                                country: response.order_status.country,
                                payment_options: " ",
                                // redirect_url: // specified redirect URL
                                //"https://callbacks.piedpiper.com/flutterwave.aspx?ismobile=34",
                                meta: {
                                    website_id :  $('.__website_id').val(),
                                    order_id : response.order_status.o_id,

                                },
                                
                                            customer: {
                                                email: response.order_status.email,
                                                phone_number: response.order_status.contact,
                                                name: response.order_status.name,
                                            },
                                            callback: function(data) {
                                                // if(data.status="successful")
                                                // {
                                                    var transaction_id = data.transaction_id;
                                                    var _token = $('meta[name="csrf-token"]').attr('content');
                                                    var order_id =response.order_status.o_id;

                                                    $.ajax({
                                                        type: "POST",
                                                        url:"/flutterwave/verify",
                                                        data: {
                                                            transaction_id, 
                                                            _token,
                                                            FLUTTERWAVE_SECRET,
                                                        },
                                                        success: function(verifyresponse){
                                                        

                                                            var ress =JSON.parse(verifyresponse);
                                                            console.log(ress.status);


                                                                if(ress.status == "success")
                                                                {
                                                                    
                                                                    generateInvoice($('.__website_id').val(),order_id );
                                                                    flushCartLS();
                                                                    var redirectUrl = response.order_status.o_id+"/thanks";
                                                                    window.location.href = redirectUrl;
                                                                    
                                                                } 
                                                                else{
                                                                    flushCartLS();
                                                                    var redirectUrl = response.order_status.o_id+"/thanks";
                                                                    window.location.href = redirectUrl;
                                                                }   
                                                        
                                                        }                 
                                                        
                                                    });
                                                // generateInvoice($('.__website_id').val(), response.order_status.o_id);
                                                //     // console.log(data.transaction_id);
                                                // }
                                            },
                                            onclose: function() {
                                                // flushCartLS();
                                                // var redirectUrl = response.order_status.o_id+"/thanks";
                                                // window.location.href = redirectUrl;
                                            },
                                            customizations: {
                                                title: response.order_status.business_name,
                                                description: "Payment for items in cart",
                                                logo: "https://lh3.googleusercontent.com/NgRLiC79mSbFLg0muWI54Ebt3NK6X_0tjK--UpEcARdPqlBbkV9JLUSXapnj5syC5wwO=w300",
                                            },

                                        
                            });
                        }
                        },
                        error: function(response) {

                        }
                    });
               
        }    
                        
                        // razor
                        else {
                            razorPay(response);
                        }
                    },
                    error: function (response) {
                        // Disable PLace Order Btn
                        $('#wch-pd-action-btn').removeAttr('disabled');
                        $('#wch-pd-action-btn').removeClass('disabled');
                        $('.wch-pd-action .pin-loader').addClass('hide');
    
                        // Show Error Msg On Checkout Page
                        $('#wcheckout-error-msg').addClass('show');
                        $('#wcheckout-error-msg .error-msg').text(response.responseJSON.user_message);
                    }
                })
    
                return false; // Will stop the submission of the form
            },
        });
    }


    

    function fscErrorCallback(error_code, error_string){
        alert("Fastspring Error ");
    }

    function fscPopupClosed(){
       
                    alert("Fastspring Close Error");
                    }
            
  
    // function fscPopupClosed(order){
        8
    //     // alert("Fastspring Close");
    // }

    // PlaceOrder btn click submit form
    $('#wch-pd-action-btn').on('click', function(e) {
        e.preventDefault();
        var payment_type = $('.wch-payment-options input[name=payment_option]:checked').val();
        var cart_details = getLS('wCart');

        $.ajax({
            method: "post",
            url: "/check/product/availability",
            data: {
                cart_details: JSON.stringify(cart_details),
                website_id: $('.__website_id').val(),
                _token: $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                // alert ("hi!") ;
                if(response.success === 1) {
                    var avail_products = response.product_status;
                    var vaild_products = 0;
    
                    if(avail_products.length > 0) {
                        for (var i = 0; i < avail_products.length; i++) {
                            if(avail_products[i].avail) {
                                vaild_products++;   
                            }
                        }
    
                        if(vaild_products === avail_products.length) {
                            $('#wcheckout-error-msg').removeClass('show');
                            $('#wcheckout-error-msg .error-msg').text("");

                            if(!payment_type) {
                                // Show Error Msg: No payment type selected
                                $('#wcheckout-error-msg').addClass('show');
                                $('#wcheckout-error-msg .error-msg').text("Please select payment mode.");
                            } else {
                                $('#wcheckout-error-msg').removeClass('show');
                                $('#wcheckout-error-msg .error-msg').text("");
                    
                                // Submit Checkout Address Form
                                $("#wch-form").submit();
                            }
                        } else {
                            $('#wcheckout-error-msg').addClass('show');
                            $('#wcheckout-error-msg .error-msg').text('Please review your cart items.');
                        }
                    }
                }
            },
            error: function (response) {
                alert ("hello!") ;
                $('#wcheckout-error-msg').addClass('show');
                $('#wcheckout-error-msg .error-msg').text(response.responseJSON.user_message);
                console.log(response);
            }
        })

        
    });

});

    // FLUTTERWAVE


    


// Razor-Pay payment function
function razorPay(response){
    var options = {
        'key': response.order_status.api_key,
        'order_id': response.order_status.razorpay_order_id,
        'subscription_card_change': 0,
        'name': response.order_status.business_name,
        'description': response.order_status.description,
        'image': response.order_status.logo,
        'handler': function(handler_response){
            $.ajax({
                method: "post",
                url: "/order/status/store",
                data: {
                    ecom_order_id: response.order_status.ecom_order_id,
                    status: 'PAID',
                    razorpay_order_id: handler_response.razorpay_order_id,
                    razorpay_payment_id: handler_response.razorpay_payment_id,
                    razorpay_signature: handler_response.razorpay_signature,
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (status_respose) {
                    generateInvoice($('.__website_id').val(), response.order_status.o_id);

                    // On Success Redirect HERE
                    flushCartLS();
                    var redirectUrl = response.order_status.o_id+"/thanks";
                    window.location.href = redirectUrl;
                },
                error: function (status_respose) {
                    // Disable PLace Order Btn
                    $('#wch-pd-action-btn').removeAttr('disabled');
                    $('#wch-pd-action-btn').removeClass('disabled');
                    $('.wch-pd-action .pin-loader').addClass('hide');

                    // Show Error Msg On Checkout Page
                    $('#wcheckout-error-msg').addClass('show');
                    $('#wcheckout-error-msg .error-msg').text(status_respose.responseJSON.user_message);
                }
            });
        },
        'prefill': {
            'name': response.order_status.name,
            'email': response.order_status.email,
            'contact': response.order_status.contact
        },
        'notes': {
            'o_id': response.order_status.o_id
        },
        'theme': {
            'color': '#3c8dbc'
        },
        'modal': {
            backdropclose: false,
            escape: false,
            ondismiss: function(dismiss_response){
                $.ajax({
                    method: "post",
                    url: "/order/status/store",
                    data: {
                        ecom_order_id: response.order_status.ecom_order_id,
                        status: 'CANCELLED',
                        _token: $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (status_respose) {

                    },
                    error: function (status_respose) {
                        // Disable PLace Order Btn
                        $('#wch-pd-action-btn').removeAttr('disabled');
                        $('#wch-pd-action-btn').removeClass('disabled');
                        $('.wch-pd-action .pin-loader').addClass('hide');

                        // Show Error Msg On Checkout Page
                        $('#wcheckout-error-msg').addClass('show');
                        $('#wcheckout-error-msg .error-msg').text(status_respose.responseJSON.user_message);
                    }
                });

            }
        }
    };

    var razor = new Razorpay(options);
    razor.open();
}

// Generate Invoice
function generateInvoice(w_id, o_id) {
    $.ajax({
        method: "post",
        url: "/generate/order/invoice",
        data: {
            website_id: w_id,
            o_id: o_id,
            _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
        },
        error: function (response) {
            console.log(response);
        }
    })
}

function updatePayNowBtnText() {
    var pay_btn_text = $('input[name=payment_option]:checked').data('btn-text');
    $('.wch-pd-action-btn').text(pay_btn_text);
}

function flushCartLS(){
    setLS("wCart", []);
    setLS("wCart_details", {});
}

// Payment Page Shimmer-Effect Hide on Timeout
$(document).ready(function() {
    setTimeout(function() {
        $('.payment-shimmer-effect').css('display','none');
        $('.payment').css('display','block');
        $('.payment-empty-wrap').css('display','block');
    }, 1000);
});


