var CartDawn = CartDawn || {};

CartDawn = {
  init: function() {
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

  doAjaxAddToCart: (item) => {
    $.post('/cart/add.js', item.serialize(), null, 'json').done(function (item) {
      $('.modal-error').fadeOut(500);
      $.get('/cart?view=dawn', function(data) {
        $('body').addClass('open-minicart');
        $('.js-mini-cart').html(data);
      });

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

  initAddToCart: () => {
    $('body').on('click', CartDawn.Selector.btnAddToCart, function(e) {
      e.preventDefault();
      const productItem = $(this).parents('form[action="/cart/add"]');
      CartDawn.doAjaxAddToCart(productItem);
    });
  },

  addProductDonate: () => {
    $('body').on('change', '.js-product-donate:not([checked])', function(e) {
      e.preventDefault();
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
        success:function(data){
          $.get('/cart?view=dawn', function(data) {
            $('body').addClass('open-minicart');
            $('.js-mini-cart').html(data);
          });

          $.get('/cart.js', null, null, 'json').done(function (cart) {
            $(CartDawn.Selector.count).text(cart.item_count);
          });
        }
      });
    });
  },

  updateCartAjax:(qty, id) => {
    $.post('/cart/change.json', {
        quantity: qty,
        id: id
      }).done(function(cart) {
        $.get('/cart?view=dawn', function(data) {
          $('.js-mini-cart').html(data);
        });

        $('.js-cart-count').html(cart.item_count);
        $(CartDawn.Selector.count).text(cart.item_count);
        if(qty == '') {
          $(this).val(1);
        }
    });
  },

  plus: () => {
    $('body').on('click', CartDawn.Selector.btnPlus, function() {
      let item = $(this).parents(CartDawn.Selector.cartItem),
          id = item.attr('data-id'),
          quantity = item.find(CartDawn.Selector.qty).val(),
          number = parseFloat(quantity) + 1;

          item.find(CartDawn.Selector.qty).val(number);
      let qty = item.find(CartDawn.Selector.qty).val();
      CartDawn.updateCartAjax(qty, id);
    });
  },

  minus: () => {
    $('body').on('click', CartDawn.Selector.btnMinus, function() {
      let item = $(this).parents(CartDawn.Selector.cartItem),
          id = item.attr('data-id'),
          quantity = item.find(CartDawn.Selector.qty).val(),
          number = parseFloat(quantity) - 1;

      if (quantity >= 2) {
        item.find(CartDawn.Selector.qty).val(number);
      }

      let qty = item.find(CartDawn.Selector.qty).val();
      CartDawn.updateCartAjax(qty, id);
    })
  },

  updateQty: () => {
    $('body').on('focusout', CartDawn.Selector.qty, function() {
        let id = $(this).attr('data-cart-id'),
            qty = $(this).val();
        CartDawn.updateCartAjax(qty, id);
    });
  },

  removeItemCart() {
    $('body').on('click', CartDawn.Selector.btnRemove, function(e) {
      e.preventDefault();
      const item = $(this).parents(CartDawn.Selector.cartItem),
            id = item.attr('data-id'),
            qty = 0;
      CartDawn.updateCartAjax(qty, id);
      item.hide();
    })
  },

  closeCart: () => {
    $('body').on('click', '.js-close-minicart', function() {
      $('body').removeClass('open-minicart')
    });

    $('body').on('click', '.js-close-gift', function() {
      $('.modal-cart-gift').fadeOut(200);
    });
  },

  moreText: () => {
    $('body').on('click', '.js-donate-read-more', function() {
      $('.product-donate__desc').slideToggle(200);
      $(this).hide();
    });
  },

  addMessageToAttributes: () => {
    $('body').on('click', '.js-attr-message', function(e) {
      e.preventDefault();
      const seft = $(this);
      seft.find('.modal-cart-gift__btn-text').hide();
      seft.find('.modal-cart-gift__btn-icon').show();

      $.post('/cart.js', {
        attributes: {
          'Gift Message' : $('.modal-cart-gift__input').val()
        }
      }).done(function() {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();
      }).fail(function (jqXHR, textStatus) {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();
      });
    });

    $('body').on('click', '.js-attr-date', function(e) {
      e.preventDefault();
      const seft = $(this);
      seft.find('.modal-cart-gift__btn-text').hide();
      seft.find('.modal-cart-gift__btn-icon').show();
      $.post('/cart.js', {
        attributes: {
          'Delayed Shipping Date' : $('.modal-cart-gift__date').val()
        }
      }).done(function() {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();
      }).fail(function (jqXHR, textStatus) {
        seft.find('.modal-cart-gift__btn-text').show();
        seft.find('.modal-cart-gift__btn-icon').hide();
      });
    });
  },

  checkDelayShipping:() => {
    if($('.modal-cart-gift__checked').is(':checked')) {
      $('.modal-cart-gift__date').removeAttr('disabled');
      $('.js-attr-date').removeAttr('disabled');
    } else {
      $('.modal-cart-gift__date').attr('disabled', true);
      $('.js-attr-date').attr('disabled', true);
    }
  },

  onCheckedDelay:() => {
    $('body').on('click', '.modal-cart-gift__checked', function() {
      CartDawn.checkDelayShipping();
    });
  },

  openPopupGift: () => {
    $('body').on('change', '.js-gift-message', function() {
      $('.modal-cart-gift').fadeIn(200);
    });
  },

  openModalCart: () => {
    $('body').on('click', '.js-open-cart', function(e) {
      e.preventDefault();
      $.get('/cart?view=dawn', function(data) {
        $('body').addClass('open-minicart');
        $('.js-mini-cart').html(data);
      });
    });
  }

}

$(function() {
  CartDawn.init();
})
