var CartDawn = CartDawn || {};

CartDawn = {
  init: function () {
    this.initAddToCart();
    this.plus();
    this.minus();
    this.updateQty();
    this.removeItemCart();
    this.addProductDonate();
    this.closeCart();
    this.moreText();
    this.addMessageToAttributes();
    this.checkDelayShipping();
    this.onCheckedDelay();
    this.openPopupGift();
    this.openModalCart();
    this.toggleButton();
    this.closePopupCart();
  },

  Selector: {
    btnAddToCart: '[data-add-to-cart]',
    count: '.js-header-cart-count',
    btnPlus: '.cart__btn-plus',
    btnMinus: '.cart__btn-minus',
    cartItem: '.mini-cart__item',
    qty: '.mini-cart__qty-input',
    btnRemove: '.js-remove-item-cart',
    btnDonate: '.js-product-donate'
  },

  doAjaxAddToCart: (item, btn) => {
    $('.cart-overlay').show();
    $.post(window.Shopify.routes.root + 'cart/add.js', item.serialize(), null, 'json').done(function (item) {
      $('.modal-error').fadeOut(500);
      gtag('event', 'page_view', {
        'send_to': 'AW-968343338',
        'ecomm_pagetype': 'product',
        'ecomm_prodid': item.sku + '-' + item.variant_id,
        'ecomm_totalvalue': item.price / 100
      });

      const isPopup = btn.getAttribute('data-popup-cart');
      if(isPopup == 'true') {
        const slider = '.js-products-slider';
        const cartModal = $('.gift-cart-modal');
        CartDawn.productSider(slider, 3);
        setTimeout(() => {
          $('.gift-cart-modal__label').first().focus()
        }, 1000);
        cartModal.fadeIn(300);
        $('.cart-overlay').hide();
      } else {
        $.get('/cart?view=dawn', function (data) {
          $('body').addClass('open-minicart');
          $('.js-mini-cart').focus();
          $('.js-mini-cart').html(data);
          setTimeout(() => {
            $('.js-close-minicart').focus()
          }, 1000);
          CartDawn.shippingInsurance();
          $('.cart-overlay').hide();

          //         var cart_items = [];

          //         $.each(CartJS.cart.items, function(i,v) {
          //           cart_items.push(v.sku + '-' + v.variant_id);
          //         });

          //         //Ads updates - 5/18/20
          //         gtag('event', 'page_view', {
          //           'send_to': 'AW-968343338',
          //           'ecomm_pagetype': 'cart',
          //           'ecomm_prodid': cart_items,
          //           'ecomm_totalvalue': CartJS.cart.total_price / 100
          //         });
        });
      }

      $.get('/cart.js', null, null, 'json').done(function (data) {
        $(CartDawn.Selector.count).text(data.item_count);
        $('.js-cart-count').html(data.item_count);
      });

    }).fail(function ({ responseJSON }) {
      const { description } = responseJSON;
      $('.modal-error').fadeIn(500);
      $('.js-message-error').html(description);
    });
  },

  productSider: (slider, perView) => {
    const product = new Swiper(slider, {
      loop: false,
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 16,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 16
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 2,
          spaceBetween: 16
        },
        1024: {
          slidesPerView: perView,
          slidesPerGroup: perView,
          spaceBetween: 16
        },
      }
    });
  },

  closePopupCart: () => {
    $('body').on('click', '.gift-cart-modal__close', function (e) {
      e.preventDefault();
      $('.gift-cart-modal').fadeOut(300);
    });

    $('.gift-cart-modal').click(function (e) {
      if (!$(event.target).closest('.gift-cart-modal__container').length && !$(event.target).is('.gift-cart-modal__container')) {
        $('.gift-cart-modal').fadeOut(300);
      }
    });
  },

  initAddToCart: () => {
    $('body').on('click', CartDawn.Selector.btnAddToCart, function (e) {
      e.preventDefault();
      const btn = this;
      const personalizedMessage = document.querySelector('#personalized-message');
      let currentDecadeValue = document.querySelector('input[name="properties[Decade]"]');
      let decadeOption = document.querySelector('input[name="decade-input"]:checked');

      if (decadeOption) {
        if (currentDecadeValue) {
          currentDecadeValue.value = decadeOption.value;
        } else {
          $(this).parents('form').append(`<input type="hidden" name="properties[Decade]" value="${decadeOption.value}">`);
        }
      }
      if (personalizedMessage) {
        if (personalizedMessage.value.length == '') {
          personalizedMessage.classList.add('error');
        } else {
          personalizedMessage.classList.remove('error');
          const productItem = $(this).parents('form');
          CartDawn.doAjaxAddToCart(productItem, btn);
        }
      } else {
        const productItem = $(this).parents('form');
        CartDawn.doAjaxAddToCart(productItem, btn);
      }
    });
  },

  addProductDonate: () => {
    $('body').on('click', '.js-product-donate:not([checked])', function (e) {
      e.preventDefault();
      $('.cart-overlay').show();
      data = {
        items: [
          {
            "id": $(this).val(),
            "quantity": 1
          }
        ]
      };

      jQuery.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: data,
        dataType: 'json',
        success: function (data) {
          $.get('/cart?view=dawn', function (data) {
            $('body').addClass('open-minicart');
            $('.cart-overlay').hide();
            CartDawn.shippingInsurance();
            $('.js-mini-cart').html(data);
          });

          $.get('/cart.js', null, null, 'json').done(function (cart) {
            $(CartDawn.Selector.count).text(cart.item_count);
          });
        },
        error: function (data) {
          console.log(data);
        }
      });
    });
  },

  updateCartAjax: (qty, id, target) => {
    $('.cart-overlay').show();
    $.post('/cart/change.json', {
      quantity: qty,
      id: id
    }).done(async function (cart) {
      await $.get('/cart?view=dawn', function (data) {
        $('.cart-overlay').hide();
        $('.js-mini-cart').html(data);
        CartDawn.shippingInsurance();
      });

      $('.js-cart-count').html(cart.item_count);
      $('.packabag-sidebar__count').html(cart.item_count);

      $(CartDawn.Selector.count).text(cart.item_count);
      if (qty == '') {
        $(this).val(1);
      }
      let id = '#' + target.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
      $(id).focus();
    });
  },

  plus: () => {
    $('body').on('click', CartDawn.Selector.btnPlus, function () {
      let item = $(this).parents(CartDawn.Selector.cartItem),
        id = item.attr('data-id'),
        quantity = item.find(CartDawn.Selector.qty).val(),
        number = parseFloat(quantity) + 1;
      item.find(CartDawn.Selector.qty).val(number);

      let qty = item.find(CartDawn.Selector.qty).val();
      CartDawn.updateCartAjax(qty, id, $(this).attr('id'));
    });
  },

  minus: () => {
    $('body').on('click', CartDawn.Selector.btnMinus, function () {
      let item = $(this).parents(CartDawn.Selector.cartItem),
        id = item.attr('data-id'),
        quantity = item.find(CartDawn.Selector.qty).val(),
        number = parseFloat(quantity) - 1;

      if (quantity >= 1) {
        item.find(CartDawn.Selector.qty).val(number);
      }

      let qty = item.find(CartDawn.Selector.qty).val();
      CartDawn.updateCartAjax(qty, id, $(this).attr('id'));
    })
  },

  updateQty: () => {
    $('body').on('change', CartDawn.Selector.qty, function () {
      let id = $(this).attr('data-cart-id'),
        qty = $(this).val();
      CartDawn.updateCartAjax(qty, id, $(this).attr('id'));
    });
  },

  removeItemCart() {
    $('body').on('click', CartDawn.Selector.btnRemove, function (e) {
      e.preventDefault();
      const item = $(this).parents(CartDawn.Selector.cartItem),
        id = item.attr('data-id'),
        qty = 0;
      CartDawn.updateCartAjax(qty, id);
      item.hide();
    })
  },

  closeCart: () => {
    $('body').on('click', '.js-close-minicart', function () {
      $('#cart-icon-bubble').focus();
      $('body').removeClass('open-minicart');
      $('body').attr('aria-hidden', 'false');
      $('.Rise__widget, #gorgias-chat-container').show();
    });

    $('body').on('click', '.js-close-gift', function () {
      $('#cart-icon-bubble').focus();
      $('.modal-cart-gift').fadeOut(200);
    });

    $('body').on('keydown', '.js-close-minicart', function (e) {
      if (e.shiftKey && e.keyCode === 9) {
        $('#cart-icon-bubble').focus();
        $('body').removeClass('open-minicart');
        $('body').attr('aria-hidden', 'false');
        $('.Rise__widget, #gorgias-chat-container').show();
      }
    });

    $(document).on('keydown', function (e) {
      if (e.keyCode == 27) {
        if ($('body').hasClass('open-minicart') && $('.modal-cart-gift').css('display', 'none')) {
          $('#cart-icon-bubble').focus();
          $('body').removeClass('open-minicart');
          $('.Rise__widget, #gorgias-chat-container').show();
        }

        if ($('.modal-cart-gift').css('display', 'block')) {
          $('.modal-cart-gift').css('display', 'none');
        }
      }

    });

    $('body').on('click', '.js-remove-donate', function () {
      $('.product-donate').slideToggle(200);
    });
  },

  moreText: () => {
    $('body').on('click', '.js-donate-read-more', function () {
      $('.product-donate__desc').slideToggle(200);
      $(this).hide();
    });

    $('body').on('click', '.js-read-less', function () {
      $('.product-donate__desc').slideToggle(200);
      $('.js-donate-read-more').show();
    });
  },

  addMessageToAttributes: () => {
    $('body').on('click', '.js-attr-message', function (e) {
      e.preventDefault();
      const seft = $(this);
      seft.find('.modal-cart-gift__btn-text').hide();
      seft.find('.modal-cart-gift__btn-icon').show();

      $.post('/cart.js', {
        attributes: {
          'Gift Message': $('.modal-cart-gift__input').val()
        }
      }).done(function () {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();

        seft.text('Message Saved!');
        setTimeout(function () {
          seft.text('Save Message');
        }, 2500);

        $.get('/cart?view=dawn', function (data) {
          $('.js-mini-cart').html(data);
        });
      }).fail(function (jqXHR, textStatus) {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();
      });
    });

    $('body').on('click', '.js-attr-date', function (e) {
      e.preventDefault();
      const seft = $(this);
      seft.find('.modal-cart-gift__btn-text').hide();
      seft.find('.modal-cart-gift__btn-icon').show();
      $.post('/cart.js', {
        attributes: {
          'Delayed Shipping Date': $('.modal-cart-gift__date').val()
        }
      }).done(function () {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();

        seft.text('Date Confirmed!');
        setTimeout(function () {
          seft.text('Confirm Date');
        }, 2500);

        $.get('/cart?view=dawn', function (data) {
          $('.js-mini-cart').html(data);
        });
      }).fail(function (jqXHR, textStatus) {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();
      });
    });
  },

  checkDelayShipping: () => {
    if ($('.modal-cart-gift__checked').is(':checked')) {
      $('.modal-cart-gift__date').removeAttr('disabled');
      $('.js-attr-date').removeAttr('disabled');
    } else {
      $('.modal-cart-gift__date').attr('disabled', true);
      $('.js-attr-date').attr('disabled', true);
    }
  },

  onCheckedDelay: () => {
    $('body').on('click', '.modal-cart-gift__checked', function () {
      CartDawn.checkDelayShipping();
    });
  },

  openPopupGift: () => {
    let labelID;
    $('body').on('click', 'label', function () {
      labelID = $(this).attr('for');
      $('#' + labelID).trigger('click');
      if (labelID === 'GiftMessage') {
        $('.modal-cart-gift').fadeIn(200);
      }
    });

    $('body').on('keypress', 'label', function (event) {
      labelID = $(this).attr('for');
      if (event.key === "Enter") {
        $('#' + labelID).trigger('click');
        if (labelID === 'GiftMessage') {
          $('.modal-cart-gift').fadeIn(200);
          $('.modal-cart-gift').focus();
        }
      }
    });
  },

  openModalCart: () => {
    $('body').on('click', '.js-open-cart', function (e) {
      e.preventDefault();
      let cartModal = document.querySelector('.js-mini-cart');
      cartModal.setAttribute('tabIndex', '-1');
      cartModal.focus();
      cartModal.addEventListener('blur', this.removeAttribute('tabindex'), {one: true});

      $.get('/cart?view=dawn', function (data) {
        $('body').addClass('open-minicart');
        $('body').attr('aria-hidden', 'true');
        $('.js-mini-cart').html(data);
        CartDawn.shippingInsurance();
        $('.Rise__widget, #gorgias-chat-container').hide();

        //         var cart_items = [];
        //         $.each(data.items, function(i,v) {
        //           cart_items.push(v.sku + '-' + v.variant_id);
        //         });         

        //         gtag('event', 'page_view', {
        //           'send_to': 'AW-968343338',
        //           'ecomm_pagetype': 'cart',
        //           'ecomm_prodid': cart_items,
        //           'ecomm_totalvalue': data.total_price / 100
        //         });         
      });
    });
  },

  shippingInsurance: () => {
    window.variantArray = window.OTCIns.variants.map(function (v) {
      return v.id;
    });

    var shippingLevel;
    // $(document).on('cart.ready', function(event, cart) {
    $.get('/cart.js', null, null, 'json').done(function (cart) {
      // Get the correct shipping insurance variant
      /*
      * lt = less than
      * gt = greater than
      * sl = shipping level
      */
      var arr_1 = [{ lt: 10000, sl: 10 }];
      var arr_2 = [{ gt: 90000, lt: 100000, sl: 51 }];
      var arr_3 = [{ gt: 130000, lt: 140000, sl: 58 }, { gt: 140000, lt: 150000, sl: 59 }, { gt: 150000, lt: 155000, sl: 60 }, { gt: 155000, lt: 160000, sl: 61 },
      { gt: 160000, lt: 170000, sl: 62 }, { gt: 170000, lt: 175000, sl: 63 }, { gt: 175000, lt: 180000, sl: 64 }, { gt: 180000, lt: 190000, sl: 65 },
      { gt: 190000, lt: 197500, sl: 66 }, { gt: 190000, lt: 197500, sl: 66 }, { gt: 197500, lt: 210000, sl: 67 }, { gt: 210000, lt: 240000, sl: 68 },
      { gt: 240000, lt: 300000, sl: 69 }, { gt: 300000, lt: 350000, sl: 70 }, { gt: 350000, lt: 400000, sl: 71 }, { gt: 400000, lt: 500000, sl: 72 },
      { gt: 500000, lt: 600000, sl: 73 }, { gt: 600000, lt: 650000, sl: 74 }, { gt: 650000, lt: 750000, sl: 75 }, { gt: 750000, lt: 820000, sl: 76 },
      { gt: 820000, lt: 890000, sl: 77 }, { gt: 890000, lt: 950000, sl: 78 }, { gt: 950000, lt: 1000000, sl: 79 }, { gt: 1000000, lt: 1100000, sl: 80 },
      { gt: 1100000, lt: 1150000, sl: 81 }, { gt: 1150000, lt: 1200000, sl: 82 }, { gt: 1200000, lt: 1300000, sl: 83 }, { gt: 1300000, lt: 15000000, sl: 84 }
      ];

      var sl = 10; // shipping level initial value

      for (var i = 10001; i < 90000; i++) {
        i -= 1;
        sl += 1;
        arr_1 = [...arr_1, { gt: i, lt: i + 2000, sl: sl }]
        i += 2000;
      };

      sl = 51; // update the value of shipping level after first loop

      for (var i = 100001; i < 130000; i++) {
        i -= 1;
        sl += 1;
        arr_2 = [...arr_2, { gt: i, lt: i + 5000, sl: sl }]
        i += 5000;
      };

      var final = [...arr_1, ...arr_2, ...arr_3];
      var shippingValue = 0;

      function cart_price_loop(cart_val, cart_items) {
        for (var j = 0; j < cart_items.length; j++) {
          if (cart_items[j].requires_shipping == false) {
            cart_val -= cart_items[j].final_line_price;
          }
        }
        for (var i = 0; i < final.length; i++) {
          if (cart_val < 10000) {
            shippingValue = 10;
            break;
          }
          else if (cart_val >= final[i].gt && cart_val <= final[i].lt) {
            shippingValue = final[i].sl;
            break;
          }
          else {
            shippingValue = 85;
          }
        }
        return shippingValue;
      }
      shippingLevel = cart_price_loop(cart.total_price, cart.items);
      var variantId, variantPrice;

      $.each(window.OTCIns.variants, function (i, v) {
        var insuranceLevel = v.sku.replace('OTCINS', '');

        if (insuranceLevel == shippingLevel) {
          variantId = v.id;
          variantPrice = v.title
          return false;
        }
      });

      localStorage.setItem('shippingInsuranceVariant', variantId);
      $('.js-add-gift-card').val(variantId);
      $('#insurance-cost').text(variantPrice);
    })
  },

  toggleButton: () => {
    const cartToggleTitle = document.querySelectorAll('.js-toggle-title');
    cartToggleTitle.forEach(function (items) {
      items.onclick = function (e) {
        items.parentNode.classList.toggle('acitve');
        if (items.parentNode.classList.contains('acitve')) {
          e.currentTarget.parentNode.setAttribute("aria-expanded", "true");
        } else {
          e.currentTarget.parentNode.setAttribute("aria-expanded", "false");
        }
      }

    })
  }
}

$(function () {
  CartDawn.init();
})
