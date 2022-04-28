var CartDawn = CartDawn || {};

CartDawn = {
  init: function() {
    this.initAddToCart();
  },

  Selector: {
    btnAddToCart: '[data-add-to-cart]',
  },

  doAjaxAddToCart: function(item) {
    $.post('/cart/add.js', item.serialize(), null, 'json').done(function (data) {
      $('.modal-error').fadeOut(500);
      $.get('/cart?view=dawn', function(data) {
        $('body').addClass('open-minicart');
        $('.js-mini-cart').html(data);
      });

      $.get('/cart.js', null, null, 'json').done(function (data) {
        $('.js-header-cart-count').text(data.item_count);
        // if(data.item_count > 0) {
        //     $('.header__join').addClass('hide');
        //     $('.header__mini-cart').removeClass('hide');
        // } else {
        //     $('.header__join').removeClass('hide');
        //     $('.header__mini-cart').addClass('hide');
        // }
      });
    }).fail(function ({ responseJSON }) {
        const { description } = responseJSON;
        $('.modal-error').fadeIn(500);
        $('.js-message-error').html(description);
    });
  },

  initAddToCart: function() {
    $('body').on('click', '[data-add-to-cart]', function(e) {
      e.preventDefault();
      const productItem = $(this).parents('form[action="/cart/add"]');
      CartDawn.doAjaxAddToCart(productItem);
    });

  // $('body').on('click', '.js-open-minicart', function(e) {
  //   e.preventDefault();
  //   $('body').addClass('open-minicart');
  //   $.get('/cart?view=dawn', function(data) {
  //       $('.js-mini-cart').html(data);
  //   });
  // })
  }
}

$(function() {
  CartDawn.init();
})
