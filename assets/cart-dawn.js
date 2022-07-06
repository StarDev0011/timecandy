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
    this.toggleButton();
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
    $('.cart-overlay').show();
    $.post(window.Shopify.routes.root + 'cart/add.js', item.serialize(), null, 'json').done(function (item) {
      $('.modal-error').fadeOut(500);
      $.get('/cart?view=dawn', function(data) {
        $('body').addClass('open-minicart');
        $('.js-mini-cart').html(data);
        CartDawn.shippingInsurance();
        $('.cart-overlay').hide();
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
      const personalizedMessage = document.querySelector('#personalized-message');
      if(personalizedMessage) {
        if(personalizedMessage.value.length == '') {
          personalizedMessage.classList.add('error');
        } else {
          personalizedMessage.classList.remove('error');
          const productItem = $(this).parents('form');
          CartDawn.doAjaxAddToCart(productItem);
        }
      } else {
        const productItem = $(this).parents('form');
        CartDawn.doAjaxAddToCart(productItem);
      }
    });
  },

  addProductDonate: () => {
    $('body').on('change', '.js-product-donate:not([checked])', function(e) {
      //debugger;
      e.preventDefault();
      $('.cart-overlay').show();
      console.log($(this).val());
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
            $('.cart-overlay').hide();
            CartDawn.shippingInsurance();
            $('.js-mini-cart').html(data);
          });

          $.get('/cart.js', null, null, 'json').done(function (cart) {
            $(CartDawn.Selector.count).text(cart.item_count);
          });
        },
        error:function(data){
          console.log(data); 
        }
      });
    });
  },

  updateCartAjax:(qty, id) => {
    $('.cart-overlay').show();
    $.post('/cart/change.json', {
        quantity: qty,
        id: id
      }).done(function(cart) {
        $.get('/cart?view=dawn', function(data) {
          $('.cart-overlay').hide();
          $('.js-mini-cart').html(data);
          CartDawn.shippingInsurance();
        });

        $('.js-cart-count').html(cart.item_count);
        $('.packabag-sidebar__count').html(cart.item_count);

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

      if (quantity >= 1) {
        item.find(CartDawn.Selector.qty).val(number);
      }

      let qty = item.find(CartDawn.Selector.qty).val();
      CartDawn.updateCartAjax(qty, id);
    })
  },

  updateQty: () => {
    $('body').on('change', CartDawn.Selector.qty, function() {
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

    $('body').on('click', '.js-remove-donate', function() {
      $('.product-donate').slideToggle(200);
    });
  },

  moreText: () => {
    $('body').on('click', '.js-donate-read-more', function() {
      $('.product-donate__desc').slideToggle(200);
      $(this).hide();
    });

    $('body').on('click', '.js-read-less', function() {
      $('.product-donate__desc').slideToggle(200);
      $('.js-donate-read-more').show();
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
        $.get('/cart?view=dawn', function(data) {
          $('.js-mini-cart').html(data);
        });
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
        $.get('/cart?view=dawn', function(data) {
          $('.js-mini-cart').html(data);
        });
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
      debugger;
      $.get('/cart?view=dawn', function(data) {
        $('body').addClass('open-minicart');
        $('.js-mini-cart').html(data);
        CartDawn.shippingInsurance();
      });
    });
  },

  shippingInsurance: () => {
    //window.OTCIns = {"id":4480997228596,"title":"Shipping Insurance","handle":"routeins-1","description":"\u003cp\u003eOver the river and through the woods can sometimes be a dangerous journey for candy. That's why we now offer low-cost shipping insurance to protect your precious cargo on its way to you. \u003c\/p\u003e\n\u003cp\u003eIn the event that your package is lost, stolen, or arrives broken, we will provide a hassle-free replacement or refund to you.\u003c\/p\u003e","published_at":"2020-03-05T13:08:11-05:00","created_at":"2020-03-05T13:08:11-05:00","vendor":"Route","type":"Insurance","tags":["Exclude"],"price":98,"price_min":98,"price_max":14038,"available":true,"price_varies":true,"compare_at_price":null,"compare_at_price_min":0,"compare_at_price_max":0,"compare_at_price_varies":false,"variants":[{"id":40328650817588,"title":"$0.98","option1":"$0.98","option2":null,"option3":null,"sku":"OTCINS10","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $0.98","public_title":"$0.98","options":["$0.98"],"price":98,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768103","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328650850356,"title":"$1.15","option1":"$1.15","option2":null,"option3":null,"sku":"OTCINS11","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $1.15","public_title":"$1.15","options":["$1.15"],"price":115,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768110","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328650883124,"title":"$1.35","option1":"$1.35","option2":null,"option3":null,"sku":"OTCINS12","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $1.35","public_title":"$1.35","options":["$1.35"],"price":135,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768127","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328650915892,"title":"$1.55","option1":"$1.55","option2":null,"option3":null,"sku":"OTCINS13","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $1.55","public_title":"$1.55","options":["$1.55"],"price":155,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768134","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328650948660,"title":"$1.75","option1":"$1.75","option2":null,"option3":null,"sku":"OTCINS14","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $1.75","public_title":"$1.75","options":["$1.75"],"price":175,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768141","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328650981428,"title":"$1.95","option1":"$1.95","option2":null,"option3":null,"sku":"OTCINS15","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $1.95","public_title":"$1.95","options":["$1.95"],"price":195,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768158","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651014196,"title":"$2.15","option1":"$2.15","option2":null,"option3":null,"sku":"OTCINS16","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $2.15","public_title":"$2.15","options":["$2.15"],"price":215,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768165","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651046964,"title":"$2.35","option1":"$2.35","option2":null,"option3":null,"sku":"OTCINS17","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $2.35","public_title":"$2.35","options":["$2.35"],"price":235,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768172","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651079732,"title":"$2.55","option1":"$2.55","option2":null,"option3":null,"sku":"OTCINS18","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $2.55","public_title":"$2.55","options":["$2.55"],"price":255,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768189","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651112500,"title":"$2.75","option1":"$2.75","option2":null,"option3":null,"sku":"OTCINS19","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $2.75","public_title":"$2.75","options":["$2.75"],"price":275,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768196","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651145268,"title":"$2.95","option1":"$2.95","option2":null,"option3":null,"sku":"OTCINS20","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $2.95","public_title":"$2.95","options":["$2.95"],"price":295,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768202","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651178036,"title":"$3.15","option1":"$3.15","option2":null,"option3":null,"sku":"OTCINS21","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $3.15","public_title":"$3.15","options":["$3.15"],"price":315,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768219","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651210804,"title":"$3.35","option1":"$3.35","option2":null,"option3":null,"sku":"OTCINS22","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $3.35","public_title":"$3.35","options":["$3.35"],"price":335,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768226","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651243572,"title":"$3.55","option1":"$3.55","option2":null,"option3":null,"sku":"OTCINS23","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $3.55","public_title":"$3.55","options":["$3.55"],"price":355,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768233","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651276340,"title":"$3.75","option1":"$3.75","option2":null,"option3":null,"sku":"OTCINS24","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $3.75","public_title":"$3.75","options":["$3.75"],"price":375,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768240","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651309108,"title":"$3.95","option1":"$3.95","option2":null,"option3":null,"sku":"OTCEINS25","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $3.95","public_title":"$3.95","options":["$3.95"],"price":395,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768257","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651341876,"title":"$4.15","option1":"$4.15","option2":null,"option3":null,"sku":"OTCINS26","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $4.15","public_title":"$4.15","options":["$4.15"],"price":415,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768264","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651374644,"title":"$4.35","option1":"$4.35","option2":null,"option3":null,"sku":"OTCINS27","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $4.35","public_title":"$4.35","options":["$4.35"],"price":435,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768271","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651407412,"title":"$4.55","option1":"$4.55","option2":null,"option3":null,"sku":"OTCINS28","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $4.55","public_title":"$4.55","options":["$4.55"],"price":455,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768288","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651440180,"title":"$4.75","option1":"$4.75","option2":null,"option3":null,"sku":"OTCINS29","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $4.75","public_title":"$4.75","options":["$4.75"],"price":475,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768295","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651472948,"title":"$4.95","option1":"$4.95","option2":null,"option3":null,"sku":"OTCINS30","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $4.95","public_title":"$4.95","options":["$4.95"],"price":495,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768301","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651505716,"title":"$5.15","option1":"$5.15","option2":null,"option3":null,"sku":"OTCINS31","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $5.15","public_title":"$5.15","options":["$5.15"],"price":515,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768318","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651538484,"title":"$5.35","option1":"$5.35","option2":null,"option3":null,"sku":"OTCINS32","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $5.35","public_title":"$5.35","options":["$5.35"],"price":535,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768325","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651571252,"title":"$5.55","option1":"$5.55","option2":null,"option3":null,"sku":"OTCINS33","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $5.55","public_title":"$5.55","options":["$5.55"],"price":555,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768332","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651604020,"title":"$5.75","option1":"$5.75","option2":null,"option3":null,"sku":"OTCINS34","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $5.75","public_title":"$5.75","options":["$5.75"],"price":575,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768349","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651636788,"title":"$5.95","option1":"$5.95","option2":null,"option3":null,"sku":"OTCINS35","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $5.95","public_title":"$5.95","options":["$5.95"],"price":595,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768356","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651669556,"title":"$6.15","option1":"$6.15","option2":null,"option3":null,"sku":"OTCINS36","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $6.15","public_title":"$6.15","options":["$6.15"],"price":615,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768363","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651702324,"title":"$6.35","option1":"$6.35","option2":null,"option3":null,"sku":"OTCINS37","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $6.35","public_title":"$6.35","options":["$6.35"],"price":635,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768370","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651735092,"title":"$6.55","option1":"$6.55","option2":null,"option3":null,"sku":"OTCINS38","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $6.55","public_title":"$6.55","options":["$6.55"],"price":655,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768387","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651767860,"title":"$6.75","option1":"$6.75","option2":null,"option3":null,"sku":"OTCINS39","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $6.75","public_title":"$6.75","options":["$6.75"],"price":675,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768394","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651800628,"title":"$6.95","option1":"$6.95","option2":null,"option3":null,"sku":"OTCINS40","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $6.95","public_title":"$6.95","options":["$6.95"],"price":695,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768400","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651833396,"title":"$7.15","option1":"$7.15","option2":null,"option3":null,"sku":"OTCINS41","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $7.15","public_title":"$7.15","options":["$7.15"],"price":715,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768417","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651866164,"title":"$7.35","option1":"$7.35","option2":null,"option3":null,"sku":"OTCINS42","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $7.35","public_title":"$7.35","options":["$7.35"],"price":735,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768424","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651898932,"title":"$7.55","option1":"$7.55","option2":null,"option3":null,"sku":"OTCINS43","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $7.55","public_title":"$7.55","options":["$7.55"],"price":755,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768431","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651931700,"title":"$7.75","option1":"$7.75","option2":null,"option3":null,"sku":"OTCINS44","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $7.75","public_title":"$7.75","options":["$7.75"],"price":775,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768448","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651964468,"title":"$7.95","option1":"$7.95","option2":null,"option3":null,"sku":"OTCINS45","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $7.95","public_title":"$7.95","options":["$7.95"],"price":795,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768455","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328651997236,"title":"$8.15","option1":"$8.15","option2":null,"option3":null,"sku":"OTCINS46","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $8.15","public_title":"$8.15","options":["$8.15"],"price":815,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768462","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652030004,"title":"$8.35","option1":"$8.35","option2":null,"option3":null,"sku":"OTCINS47","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $8.35","public_title":"$8.35","options":["$8.35"],"price":835,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768479","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652062772,"title":"$8.55","option1":"$8.55","option2":null,"option3":null,"sku":"OTCINS48","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $8.55","public_title":"$8.55","options":["$8.55"],"price":855,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768486","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652095540,"title":"$8.75","option1":"$8.75","option2":null,"option3":null,"sku":"OTCINS49","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $8.75","public_title":"$8.75","options":["$8.75"],"price":875,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768493","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652128308,"title":"$8.95","option1":"$8.95","option2":null,"option3":null,"sku":"OTCINS50","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $8.95","public_title":"$8.95","options":["$8.95"],"price":895,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768509","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652161076,"title":"$9.38","option1":"$9.38","option2":null,"option3":null,"sku":"OTCINS51","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $9.38","public_title":"$9.38","options":["$9.38"],"price":938,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768516","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652193844,"title":"$10.03","option1":"$10.03","option2":null,"option3":null,"sku":"OTCINS52","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $10.03","public_title":"$10.03","options":["$10.03"],"price":1003,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768523","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652226612,"title":"$10.68","option1":"$10.68","option2":null,"option3":null,"sku":"OTCINS53","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $10.68","public_title":"$10.68","options":["$10.68"],"price":1068,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768530","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652259380,"title":"$11.33","option1":"$11.33","option2":null,"option3":null,"sku":"OTCINS54","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $11.33","public_title":"$11.33","options":["$11.33"],"price":1133,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768547","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652292148,"title":"$11.98","option1":"$11.98","option2":null,"option3":null,"sku":"OTCINS55","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $11.98","public_title":"$11.98","options":["$11.98"],"price":1198,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768554","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652324916,"title":"$12.63","option1":"$12.63","option2":null,"option3":null,"sku":"OTCINS56","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $12.63","public_title":"$12.63","options":["$12.63"],"price":1263,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768561","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652357684,"title":"$13.28","option1":"$13.28","option2":null,"option3":null,"sku":"OTCINS57","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $13.28","public_title":"$13.28","options":["$13.28"],"price":1328,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768578","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652390452,"title":"$13.93","option1":"$13.93","option2":null,"option3":null,"sku":"OTCINS58","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $13.93","public_title":"$13.93","options":["$13.93"],"price":1393,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768585","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652423220,"title":"$14.58","option1":"$14.58","option2":null,"option3":null,"sku":"OTCINS59","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $14.58","public_title":"$14.58","options":["$14.58"],"price":1458,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768592","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652455988,"title":"$15.23","option1":"$15.23","option2":null,"option3":null,"sku":"OTCINS60","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $15.23","public_title":"$15.23","options":["$15.23"],"price":1523,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768608","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652488756,"title":"$15.88","option1":"$15.88","option2":null,"option3":null,"sku":"OTCINS61","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $15.88","public_title":"$15.88","options":["$15.88"],"price":1588,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768615","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652521524,"title":"$16.53","option1":"$16.53","option2":null,"option3":null,"sku":"OTCINS62","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $16.53","public_title":"$16.53","options":["$16.53"],"price":1653,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768622","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652554292,"title":"$17.18","option1":"$17.18","option2":null,"option3":null,"sku":"OTCINS63","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $17.18","public_title":"$17.18","options":["$17.18"],"price":1718,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768639","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652587060,"title":"$17.83","option1":"$17.83","option2":null,"option3":null,"sku":"OTCINS64","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $17.83","public_title":"$17.83","options":["$17.83"],"price":1783,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768646","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652619828,"title":"$18.48","option1":"$18.48","option2":null,"option3":null,"sku":"OTCINS65","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $18.48","public_title":"$18.48","options":["$18.48"],"price":1848,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768653","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652652596,"title":"$19.13","option1":"$19.13","option2":null,"option3":null,"sku":"OTCINS66","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $19.13","public_title":"$19.13","options":["$19.13"],"price":1913,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768660","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652685364,"title":"$19.78","option1":"$19.78","option2":null,"option3":null,"sku":"OTCINS67","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $19.78","public_title":"$19.78","options":["$19.78"],"price":1978,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768677","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652718132,"title":"$20.43","option1":"$20.43","option2":null,"option3":null,"sku":"OTCINS68","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $20.43","public_title":"$20.43","options":["$20.43"],"price":2043,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768684","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652750900,"title":"$24.38","option1":"$24.38","option2":null,"option3":null,"sku":"OTCINS69","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $24.38","public_title":"$24.38","options":["$24.38"],"price":2438,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768691","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652783668,"title":"$31.63","option1":"$31.63","option2":null,"option3":null,"sku":"OTCINS70","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $31.63","public_title":"$31.63","options":["$31.63"],"price":3163,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768707","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652816436,"title":"$38.88","option1":"$38.88","option2":null,"option3":null,"sku":"OTCINS71","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $38.88","public_title":"$38.88","options":["$38.88"],"price":3888,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768714","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652849204,"title":"$46.13","option1":"$46.13","option2":null,"option3":null,"sku":"OTCINS72","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $46.13","public_title":"$46.13","options":["$46.13"],"price":4613,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768721","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652881972,"title":"$53.38","option1":"$53.38","option2":null,"option3":null,"sku":"OTCINS73","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $53.38","public_title":"$53.38","options":["$53.38"],"price":5338,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768738","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652914740,"title":"$60.63","option1":"$60.63","option2":null,"option3":null,"sku":"OTCINS74","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $60.63","public_title":"$60.63","options":["$60.63"],"price":6063,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768745","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652947508,"title":"$67.88","option1":"$67.88","option2":null,"option3":null,"sku":"OTCINS75","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $67.88","public_title":"$67.88","options":["$67.88"],"price":6788,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768752","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328652980276,"title":"$75.13","option1":"$75.13","option2":null,"option3":null,"sku":"OTCINS76","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $75.13","public_title":"$75.13","options":["$75.13"],"price":7513,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768769","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653013044,"title":"$82.38","option1":"$82.38","option2":null,"option3":null,"sku":"OTCINS77","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $82.38","public_title":"$82.38","options":["$82.38"],"price":8238,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768776","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653045812,"title":"$89.63","option1":"$89.63","option2":null,"option3":null,"sku":"OTCINS78","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $89.63","public_title":"$89.63","options":["$89.63"],"price":8963,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768783","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653078580,"title":"$96.88","option1":"$96.88","option2":null,"option3":null,"sku":"OTCINS79","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $96.88","public_title":"$96.88","options":["$96.88"],"price":9688,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768790","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653111348,"title":"$104.13","option1":"$104.13","option2":null,"option3":null,"sku":"OTCINS80","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $104.13","public_title":"$104.13","options":["$104.13"],"price":10413,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768806","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653144116,"title":"$111.38","option1":"$111.38","option2":null,"option3":null,"sku":"OTCINS81","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $111.38","public_title":"$111.38","options":["$111.38"],"price":11138,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768813","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653176884,"title":"$118.63","option1":"$118.63","option2":null,"option3":null,"sku":"OTCINS82","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $118.63","public_title":"$118.63","options":["$118.63"],"price":11863,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768820","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653209652,"title":"$125.88","option1":"$125.88","option2":null,"option3":null,"sku":"OTCINS83","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $125.88","public_title":"$125.88","options":["$125.88"],"price":12588,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768837","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653242420,"title":"$133.13","option1":"$133.13","option2":null,"option3":null,"sku":"OTCINS84","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $133.13","public_title":"$133.13","options":["$133.13"],"price":13313,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768844","requires_selling_plan":false,"selling_plan_allocations":[]},{"id":40328653275188,"title":"$140.38","option1":"$140.38","option2":null,"option3":null,"sku":"OTCINS85","requires_shipping":false,"taxable":false,"featured_image":null,"available":true,"name":"Shipping Insurance - $140.38","public_title":"$140.38","options":["$140.38"],"price":14038,"weight":0,"compare_at_price":null,"inventory_management":null,"barcode":"850006768851","requires_selling_plan":false,"selling_plan_allocations":[]}],"images":["\/\/cdn.shopify.com\/s\/files\/1\/0004\/8132\/9204\/products\/shipping-insurance.png?v=1583442803"],"featured_image":"\/\/cdn.shopify.com\/s\/files\/1\/0004\/8132\/9204\/products\/shipping-insurance.png?v=1583442803","options":["Title"],"media":[{"alt":null,"id":6277317525556,"position":1,"preview_image":{"aspect_ratio":1.25,"height":1000,"width":1250,"src":"https:\/\/cdn.shopify.com\/s\/files\/1\/0004\/8132\/9204\/products\/shipping-insurance.png?v=1583442803"},"aspect_ratio":1.25,"height":1000,"media_type":"image","src":"https:\/\/cdn.shopify.com\/s\/files\/1\/0004\/8132\/9204\/products\/shipping-insurance.png?v=1583442803","width":1250}],"requires_selling_plan":false,"selling_plan_groups":[],"content":"\u003cp\u003eOver the river and through the woods can sometimes be a dangerous journey for candy. That's why we now offer low-cost shipping insurance to protect your precious cargo on its way to you. \u003c\/p\u003e\n\u003cp\u003eIn the event that your package is lost, stolen, or arrives broken, we will provide a hassle-free replacement or refund to you.\u003c\/p\u003e"};
    //window.OTCIns = {"id":7676481667299,"title":"Shipping Insurance","price":98,"price_min":98,"price_max":14038,"available":true,"variants":[{ "id": 42837795668195, "title": "$0.98", "price": 98, "sku": "OTCINS10" }, { "id": 42837795700963, "title": "$1.15", "price": 115, "sku": "OTCINS11" }, { "id": 42837795733731, "title": "$1.35", "price": 135, "sku": "OTCINS12" }, { "id": 42837795766499, "title": "$1.55", "price": 155, "sku": "OTCINS13" }, { "id": 42837795799267, "title": "$1.75", "price": 175, "sku": "OTCINS14" }, { "id": 42837795832035, "title": "$1.95", "price": 195, "sku": "OTCINS15" }, { "id": 42837795864803, "title": "$2.15", "price": 215, "sku": "OTCINS16" }, { "id": 42837795897571, "title": "$2.35", "price": 235, "sku": "OTCINS17" }, { "id": 42837795930339, "title": "$2.55", "price": 255, "sku": "OTCINS18" }, { "id": 42837795963107, "title": "$2.75", "price": 275, "sku": "OTCINS19" }, { "id": 42837795995875, "title": "$2.95", "price": 295, "sku": "OTCINS20" }, { "id": 42837796028643, "title": "$3.15", "price": 315, "sku": "OTCINS21" }, { "id": 42837796061411, "title": "$3.35", "price": 335, "sku": "OTCINS22" }, { "id": 42837796094179, "title": "$3.55", "price": 355, "sku": "OTCINS23" }, { "id": 42837796126947, "title": "$3.75", "price": 375, "sku": "OTCINS24" }, { "id": 42837796159715, "title": "$3.95", "price": 395, "sku": "OTCEINS25" }, { "id": 42837796192483, "title": "$4.15", "price": 415, "sku": "OTCINS26" }, { "id": 42837796225251, "title": "$4.35", "price": 435, "sku": "OTCINS27" }, { "id": 42837796258019, "title": "$4.55", "price": 455, "sku": "OTCINS28" }, { "id": 42837796290787, "title": "$4.75", "price": 475, "sku": "OTCINS29" }, { "id": 42837796323555, "title": "$4.95", "price": 495, "sku": "OTCINS30" }, { "id": 42837796356323, "title": "$5.15", "price": 515, "sku": "OTCINS31" }, { "id": 42837796389091, "title": "$5.35", "price": 535, "sku": "OTCINS32" }, { "id": 42837796421859, "title": "$5.55", "price": 555, "sku": "OTCINS33" }, { "id": 42837796454627, "title": "$5.75", "price": 575, "sku": "OTCINS34" }, { "id": 42837796487395, "title": "$5.95", "price": 595, "sku": "OTCINS35" }, { "id": 42837796520163, "title": "$6.15", "price": 615, "sku": "OTCINS36" }, { "id": 42837796552931, "title": "$6.35", "price": 635, "sku": "OTCINS37" }, { "id": 42837796585699, "title": "$6.55", "price": 655, "sku": "OTCINS38" }, { "id": 42837796618467, "title": "$6.75", "price": 675, "sku": "OTCINS39" }, { "id": 42837796651235, "title": "$6.95", "price": 695, "sku": "OTCINS40" }, { "id": 42837796684003, "title": "$7.15", "price": 715, "sku": "OTCINS41" }, { "id": 42837796716771, "title": "$7.35", "price": 735, "sku": "OTCINS42" }, { "id": 42837796749539, "title": "$7.55", "price": 755, "sku": "OTCINS43" }, { "id": 42837796782307, "title": "$7.75", "price": 775, "sku": "OTCINS44" }, { "id": 42837796815075, "title": "$7.95", "price": 795, "sku": "OTCINS45" }, { "id": 42837796847843, "title": "$8.15", "price": 815, "sku": "OTCINS46" }, { "id": 42837796880611, "title": "$8.35", "price": 835, "sku": "OTCINS47" }, { "id": 42837796913379, "title": "$8.55", "price": 855, "sku": "OTCINS48" }, { "id": 42837796946147, "title": "$8.75", "price": 875, "sku": "OTCINS49" }, { "id": 42837796978915, "title": "$8.95", "price": 895, "sku": "OTCINS50" }, { "id": 42837797011683, "title": "$9.38", "price": 938, "sku": "OTCINS51" }, { "id": 42837797044451, "title": "$10.03", "price": 1003, "sku": "OTCINS52" }, { "id": 42837797077219, "title": "$10.68", "price": 1068, "sku": "OTCINS53" }, { "id": 42837797109987, "title": "$11.33", "price": 1133, "sku": "OTCINS54" }, { "id": 42837797142755, "title": "$11.98", "price": 1198, "sku": "OTCINS55" }, { "id": 42837797175523, "title": "$12.63", "price": 1263, "sku": "OTCINS56" }, { "id": 42837797208291, "title": "$13.28", "price": 1328, "sku": "OTCINS57" }, { "id": 42837797241059, "title": "$13.93", "price": 1393, "sku": "OTCINS58" }, { "id": 42837797273827, "title": "$14.58", "price": 1458, "sku": "OTCINS59" }, { "id": 42837797306595, "title": "$15.23", "price": 1523, "sku": "OTCINS60" }, { "id": 42837797339363, "title": "$15.88", "price": 1588, "sku": "OTCINS61" }, { "id": 42837797372131, "title": "$16.53", "price": 1653, "sku": "OTCINS62" }, { "id": 42837797404899, "title": "$17.18", "price": 1718, "sku": "OTCINS63" }, { "id": 42837797437667, "title": "$17.83", "price": 1783, "sku": "OTCINS64" }, { "id": 42837797470435, "title": "$18.48", "price": 1848, "sku": "OTCINS65" }, { "id": 42837797503203, "title": "$19.13", "price": 1913, "sku": "OTCINS66" }, { "id": 42837797535971, "title": "$19.78", "price": 1978, "sku": "OTCINS67" }, { "id": 42837797568739, "title": "$20.43", "price": 2043, "sku": "OTCINS68" }, { "id": 42837797601507, "title": "$24.38", "price": 2438, "sku": "OTCINS69" }, { "id": 42837797634275, "title": "$31.63", "price": 3163, "sku": "OTCINS70" }, { "id": 42837797667043, "title": "$38.88", "price": 3888, "sku": "OTCINS71" }, { "id": 42837797699811, "title": "$46.13", "price": 4613, "sku": "OTCINS72" }, { "id": 42837797732579, "title": "$53.38", "price": 5338, "sku": "OTCINS73" }, { "id": 42837797765347, "title": "$60.63", "price": 6063, "sku": "OTCINS74" }, { "id": 42837797798115, "title": "$67.88", "price": 6788, "sku": "OTCINS75" }, { "id": 42837797830883, "title": "$75.13", "price": 7513, "sku": "OTCINS76" }, { "id": 42837797863651, "title": "$82.38", "price": 8238, "sku": "OTCINS77" }, { "id": 42837797896419, "title": "$89.63", "price": 8963, "sku": "OTCINS78" }, { "id": 42837797929187, "title": "$96.88", "price": 9688, "sku": "OTCINS79" }, { "id": 42837797961955, "title": "$104.13", "price": 10413, "sku": "OTCINS80" }, { "id": 42837797994723, "title": "$111.38", "price": 11138, "sku": "OTCINS81" }, { "id": 42837798027491, "title": "$118.63", "price": 11863, "sku": "OTCINS82" }, { "id": 42837798060259, "title": "$125.88", "price": 12588, "sku": "OTCINS83" }, { "id": 42837798093027, "title": "$133.13", "price": 13313, "sku": "OTCINS84" }, { "id": 42837798125795, "title": "$140.38", "price": 14038, "sku": "OTCINS85" }]};
    window.variantArray = window.OTCIns.variants.map(function(v) {
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
      var arr_1 = [{lt:10000, sl: 10}];
      var arr_2 = [{gt:90000, lt:100000, sl: 51}];
      var arr_3 = [{gt:130000, lt:140000, sl: 58}, {gt:140000, lt:150000, sl: 59}, {gt:150000, lt:155000, sl: 60}, {gt:155000, lt:160000, sl: 61},
                    {gt:160000, lt:170000, sl: 62}, {gt:170000, lt:175000, sl: 63}, {gt:175000, lt:180000, sl: 64}, {gt:180000, lt:190000, sl: 65},
                    {gt:190000, lt:197500, sl: 66}, {gt:190000, lt:197500, sl: 66}, {gt:197500, lt:210000, sl: 67}, {gt:210000, lt:240000, sl: 68},
                    {gt:240000, lt:300000, sl: 69}, {gt:300000, lt:350000, sl: 70}, {gt:350000, lt:400000, sl: 71}, {gt:400000, lt:500000, sl: 72},
                    {gt:500000, lt:600000, sl: 73}, {gt:600000, lt:650000, sl: 74}, {gt:650000, lt:750000, sl: 75}, {gt:750000, lt:820000, sl: 76},
                    {gt:820000, lt:890000, sl: 77}, {gt:890000, lt:950000, sl: 78}, {gt:950000, lt:1000000, sl: 79}, {gt:1000000, lt:1100000, sl: 80},
                    {gt:1100000, lt:1150000, sl: 81}, {gt:1150000, lt:1200000, sl: 82}, {gt:1200000, lt:1300000, sl: 83}, {gt:1300000, lt:15000000, sl: 84}
                  ];

      var sl = 10; // shipping level initial value

      for(var i = 10001; i < 90000 ; i++){
          i -= 1;
          sl += 1;
          arr_1 = [...arr_1, {gt: i, lt:i+2000, sl: sl }]
          i += 2000;
      };

      sl = 51; // update the value of shipping level after first loop

      for(var i = 100001; i < 130000 ; i++){
          i -= 1;
          sl += 1;
          arr_2 = [...arr_2, {gt: i, lt:i+5000, sl: sl }]
          i += 5000;
      };

      var final = [...arr_1, ...arr_2, ...arr_3];
      var shippingValue = 0;

      function cart_price_loop(cart_val, cart_items){
        for (var j=0 ; j<cart_items.length ; j++)  {
          if (cart_items[j].requires_shipping  == false) {
            //debugger;
            cart_val -= cart_items[j].final_line_price;
          }
        }
        for(var i=0 ; i<final.length ; i++){
            if(cart_val < 10000){
                shippingValue = 10;
                break;
            }
            else if(cart_val >= final[i].gt && cart_val <= final[i].lt){
                shippingValue = final[i].sl;
                break;
            }
            else{
                shippingValue = 85;
            }
        }
        return shippingValue;
      }
      shippingLevel = cart_price_loop(cart.total_price, cart.items);
      var variantId, variantPrice;

      $.each(window.OTCIns.variants, function(i, v){
        var insuranceLevel = v.sku.replace('OTCINS','');

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
    cartToggleTitle.forEach(function(items) {
      items.onclick = function() {
      items.parentNode.classList.toggle('acitve');
      }
    })
  }
}

$(function() {
  CartDawn.init();
})
