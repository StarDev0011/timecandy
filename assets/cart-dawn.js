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
      if (isPopup == 'true') {
        const slider = '.js-products-slider';
        const cartModal = $('.gift-cart-modal');
        CartDawn.productSlider(slider, 3);
        setTimeout(() => {
          $('.gift-cart-modal__label').first().focus()
        }, 1000);
        let currentSessions = window.sessionStorage.getItem("popup-cart-storage") || "";
        if (!window.sessionStorage.getItem("popup-cart-storage") || window.sessionStorage.getItem("popup-cart-storage").split(',').filter(product => product == item.product_id).length < 1) {
          cartModal.fadeIn(300);
          window.sessionStorage.setItem("popup-cart-storage", currentSessions.concat(',' + item.product_id));
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
          });
        }
        $('.cart-overlay').hide();
      } else {
        if ($('body').hasClass('pack-a-bag-test')) { 
          $('.header__icon--cart').addClass('animated tada');
          setTimeout(function(){ $('.header__icon--cart').removeClass('animated tada'); }, 2000)
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
          });
        }
      }

      CartDawn.updateCartCount(btn);

    }).fail(function ({ responseJSON }) {
      const { description } = responseJSON;
      $('.modal-error').fadeIn(500);
      $('.js-message-error').html(description);
      $('.cart-overlay').hide();
    });
  },

  updateCartCount: (btn) => {
    $.get('/cart.js', null, null, 'json').done(function (data) {
      $(CartDawn.Selector.count).text(data.item_count);
      $('.js-cart-count').html(data.item_count);
      $('.packabag-sidebar__count').innerHTML = data.item_count;
        document.querySelector('.js-cart-count').innerHTML = data.item_count;

      if (document.getElementById('drop-zone')) {
        if (document.querySelector('.packabag-sidebar__count')) {
          document.querySelector('.packabag-sidebar__count').innerHTML = data.item_count;
        }

        var obj_mp3 = document.getElementById("resource_mp3_drop_to_bag");
        if (obj_mp3) {
          obj_mp3.src = 'https://cdn.shopify.com/s/files/1/0004/8132/9204/t/55/assets/Candy_Type1_Bag_PickUp_Fienup_002.mp3';
          obj_mp3.play();
          $('.packabag-sidebar__bag').addClass('animated tada');
          setTimeout(function () { $('.packabag-sidebar__bag').removeClass('animated tada') }, 1000);
        }
      }
    });
  },

  productSlider: (slider, perView) => {
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
    $('body').on('click', CartDawn.Selector.btnAddToCart, async function (e) {
      const btn = this;
      const personalizedMessage = document.querySelector('#personalized-message');
      let currentDecadeValue = document.querySelector('input[name="properties[Decade]"]');
      let decadeOption = document.querySelector('input[name="decade-input"]:checked');
      let roseOptions = document.querySelectorAll('.product-rose-color .qty-input');
      let personalizedImage = document.querySelector('#personalized-image');

      if (decadeOption) {
        if (currentDecadeValue) {
          currentDecadeValue.value = decadeOption.value;
        } else {
          $(this).parents('form').append(`<input type="hidden" name="properties[Decade]" value="${decadeOption.value}">`);
        }
      }
      if (roseOptions) {
        roseOptions.forEach(function(option) {
          if (!parseInt(option.value) > 0) {
            option.closest(".product-rose-color-option").querySelector('.product-form__roses-hidden-sku').disabled = true;
            option.disabled = true;
          }
        });
      }

      if (personalizedImage) {
        return;
      }      
      
      e.preventDefault();

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
        if (window.iceBrix) {
          await $.get('/cart.js', null, null, 'json').done(function (data) {
            if (data.items.filter((e) => e.id == '7455857868852').length > 0) {
              $('input[name="items[1]id"]').remove();
              $('input[name="items[1]quantity"]').remove();
            }
            else if (btn.dataset.iceBrix === 'true' && window.iceBrix) {
              productItem.append(`<input type="hidden" name="items[1]id" value="${window.iceBrix.id}"><input type="hidden" name="items[1]quantity" value="1">`)
            }
          });
        }
        CartDawn.doAjaxAddToCart(productItem, btn);

        if (roseOptions) {
          roseOptions.forEach(function(option) {
            if (!parseInt(option.value) > 0) {
              option.closest(".product-rose-color-option").querySelector('.product-form__roses-hidden-sku').disabled = false;
              option.disabled = false;
            }
          });
        }        
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

  updateCartAjax: async (qty, id, target, removeIceBrix) => {
    $('.cart-overlay').show();
    let formData = {
      quantity: qty,
      id: id
    };
    if (removeIceBrix && window.iceBrix) {
      await $.post('/cart/change.json', { quantity: 0, id: window.iceBrix.id }).done(async function () { });
    }
    await $.post('/cart/change.json', formData).done(async function (cart) {
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
      if (target) {
        let key = '#' + target.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");
        $(key).focus();
      }
      let subTotalItem = $(`.mini-cart__item[data-id="${id}"] .mini-cart__total__sub-price`);
      $('#cart-log').html("<span>Item Subtotal: " + subTotalItem[0] + "</span>" + "<span>Cart Total: " + cart.items_subtotal_price / 100 + "</span>")
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
        number = parseFloat(quantity) - 1,
        dataIceBrix = item.attr('data-ice-brix');
      if (quantity >= 1) {
        item.find(CartDawn.Selector.qty).val(number);
      }

      let qty = item.find(CartDawn.Selector.qty).val();
      if (dataIceBrix && ($(CartDawn.Selector.cartItem + "[data-ice-brix=true]").length == 1) && (qty == 0)) {
        CartDawn.updateCartAjax(qty, id, $(this).attr('id'), true);
      } else {
        CartDawn.updateCartAjax(qty, id, $(this).attr('id'));
      }
    })
  },

  updateQty: () => {
    $('body').on('change', CartDawn.Selector.qty, function (e) {
      e.preventDefault();
      e.stopPropagation();
      let id = $(this).attr('data-cart-id'),
        qty = $(this).val(),
        dataIceBrix = $(this).parents(CartDawn.Selector.cartItem).attr('data-ice-brix');
      if (dataIceBrix && ($(CartDawn.Selector.cartItem + "[data-ice-brix=true]").length == 1) && (qty == 0)) {
        CartDawn.updateCartAjax(qty, id, $(this).attr('id'), true);
      } else {
        CartDawn.updateCartAjax(qty, id, $(this).attr('id'));
      }
    });
  },

  removeItemCart() {
    $('body').on('click', CartDawn.Selector.btnRemove, function (e) {
      e.preventDefault();
      const item = $(this).parents(CartDawn.Selector.cartItem),
        id = item.attr('data-id'),
        qty = 0,
        dataIceBrix = $(this).parents(CartDawn.Selector.cartItem).attr('data-ice-brix');
      if (dataIceBrix && ($(CartDawn.Selector.cartItem + "[data-ice-brix=true]").length == 1)) {
        CartDawn.updateCartAjax(qty, id, false, true);
      } else {
        CartDawn.updateCartAjax(qty, id, false);
      }
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
          $('#confirmDate').html("<span>Date Confirmed!</span>");
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

    $('.modal-cart-gift').on('click', function(e) {
      if (e.target !== this)
        return;
      
      $('#cart-icon-bubble').focus();
      $('.modal-cart-gift').fadeOut(200);
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
      cartModal.addEventListener('blur', this.removeAttribute('tabindex'), { one: true });
      $('.Rise__widget').css("z-index", "0");
      $.get('/cart?view=dawn', function (data) {
        $('body').addClass('open-minicart');
        $('body').attr('aria-hidden', 'true');
        $('.js-mini-cart').html(data);
        CartDawn.shippingInsurance();
        $('.Rise__widget, #gorgias-chat-container').hide();
      });
    });
  },

  shippingInsurance: () => {
    let variantID = parseInt(localStorage.getItem('shippingInsuranceVariant'));
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
      if($('#CartInclude').prop('checked')) {
        localStorage.setItem('shippingInsurance', true);
      } else {
        localStorage.setItem('shippingInsurance', false);
      }
      const isShippingIns = localStorage.getItem('shippingInsurance');
      if(isShippingIns == 'true') {
        if(variantID != variantId) {
          $.post('/cart/add.json', {quantity: 1, id: variantId}).done(function() {
            $.post('/cart/change.json', {quantity: 0, id: variantID}).done(function() {
              $.get('/cart?view=dawn', function (data) {
                $('.cart-overlay').hide();
                $('.js-mini-cart').html(data);
                localStorage.setItem('shippingInsuranceVariant', variantId);
                $('.js-add-gift-card').val(variantId);
                $('#insurance-cost').text(variantPrice);
              });
            });
          })
        }
      }
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

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

var windowWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

if (document.getElementById('drop-zone')) {  
  if (['searchspring.domReady']) {
    ['searchspring.domReady'].forEach(function (e) {
      window.addEventListener(e, (event) => {
        initDraggable();
      });
    });
  }
  
  window.addEventListener('DOMContentLoaded', (event) => {
    initDraggable();
  });
}

function initDraggable() {
    
  window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };  

  var position = { x: 0, y: 0 };
  function listener(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    var { currentTarget, interaction } = event;
    var element = currentTarget;
    switch (event.type) {
      case 'dragstart':
        //console.log('dragstart');
        if (
          interaction.pointerIsDown &&
          !interaction.interacting() &&
          currentTarget.style.transform === ''
        ) {

        } else if (interaction.pointerIsDown && !interaction.interacting()) {
          const regex = /translate\(([\d]+)px, ([\d]+)px\)/i;
          const transform = regex.exec(currentTarget.style.transform);

          if (transform && transform.length > 1) {
            position.x = Number(transform[1]);
            position.y = Number(transform[2]);
          }
          element.style.cssText = "z-index: 102; opacity: .75;"
          element.closest('.card-product__item').classList.add('active')
          document.querySelector('#MainContent').style.overflowX = 'visible'
          document.querySelector('.packabag-sidebar__bag').classList.add("animated", "infinite", "pulse")
        }
        break;
      case 'dragmove':
        //log('dragmove');
        position.x += event.dx;
        position.y += event.dy;
        document.querySelector('.packabag-sidebar__bag').classList.add("animated", "infinite", "pulse")
        event.target.style.cssText = "z-index: 102; opacity: .75"
        event.target.style.transform = `translate(${position.x}px, ${position.y}px) scale(.85)`
        break;
      case 'dragend':
        event.stopImmediatePropagation();
        event.preventDefault();
        element.style.cssText = `
          transform: translate(0px, 0px);
          z-index: 1;
          opacity: 1;
          scale: 1;
        `;
        element.closest('.card-product__item').classList.remove('active');
        position = { x: 0, y: 0 };
        document.querySelector('#MainContent').style.overflowX = 'hidden'
        document.querySelector('.packabag-sidebar__bag').classList.remove("animated", "infinite", "pulse");
        break;
    }
  }

  if (!isTouchDevice() && windowWidth > 989) {  
    $('.card-product__picture, .collection-pack-a-bag .card-product__title').on('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    });

    interact('.card-product__picture').draggable({
      onstart: listener,
      onmove: listener,
      onend: listener,
      max: Infinity,
      maxPerElement: 1,
    }).styleCursor(true);

    interact('#drop-zone')
    .dropzone({
      accept: '.card-product__picture',
      overlap: 'cursor',
      ondrop: async function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var elCopy = event.relatedTarget.cloneNode(true);
        elCopy.classList.add('on-bag');

        $('#drop-zone').append(elCopy);


        let formData = {};
        await $.get('/cart.js', null, null, 'json').done(function (data) {
          elCopy.classList.add('in-bag');
          if (data.items.filter((e) => e.id == '7455857868852').length > 0) {
            formData = {
              'items': [{
                'id': event.relatedTarget.dataset.productId,
                'quantity': 1
              }]
            };
          } else if (event.relatedTarget.dataset.iceBrix && window.iceBrix) {
            formData = {
              'items': [{
                'id': event.relatedTarget.dataset.productId,
                'quantity': 1
              },
              {
                'id': window.iceBrix.id,
                'quantity': 1
              }
              ]
            };
          } else {
            formData = {
              'items': [{
                'id': event.relatedTarget.dataset.productId,
                'quantity': 1
              }]
            };
          }
        });
        fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
          .then(response => {
            CartDawn.updateCartCount({ classList: 'card-product__pack-bag' });
            setTimeout(function(){
              elCopy.remove();
            },2000);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    });
  }         

  if(isTouchDevice() || windowWidth < 990) {
    var tapped = false;

    $('.card-product__picture').on('touchstart, click',function(e){
        if(!tapped){ 
          tapped = setTimeout(function(){
              tapped = null;
              e.preventDefault();
          },300);   
        } else {    
          clearTimeout(tapped); 
          tapped = null;

          var productItem = $(this).parents('.card-product__item').find('form');
          var btn = productItem.find('button')[0];
          CartDawn.doAjaxAddToCart(productItem, btn);            
        }
        e.preventDefault()
    });
  }
}

$(function () {
  CartDawn.init();
})
