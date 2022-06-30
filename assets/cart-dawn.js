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
      $.get('/cart?view=dawn', function(data) {
        $('body').addClass('open-minicart');
        $('.js-mini-cart').html(data);
        CartDawn.shippingInsurance();
      });
    });
  },

  shippingInsurance: () => {
    window.OTCIns = {"id":4480997228596,"title":"Shipping Insurance","price":98,"price_min":98,"price_max":14038,"available":true,"variants":[{"id":31717577916468,"title":"$0.98","price":98,"sku":"OTCINS10"},{"id":31717577949236,"title":"$1.15","price":115,"sku":"OTCINS11"},{"id":31717577982004,"title":"$1.35","price":135,"sku":"OTCINS12"},{"id":31717578014772,"title":"$1.55","price":155,"sku":"OTCINS13"},{"id":31717578047540,"title":"$1.75","price":175,"sku":"OTCINS14"},{"id":31717578080308,"title":"$1.95","price":195,"sku":"OTCINS15"},{"id":31717578113076,"title":"$2.15","price":215,"sku":"OTCINS16"},{"id":31717578145844,"title":"$2.35","price":235,"sku":"OTCINS17"},{"id":31717578178612,"title":"$2.55","price":255,"sku":"OTCINS18"},{"id":31717578211380,"title":"$2.75","price":275,"sku":"OTCINS19"},{"id":31717578244148,"title":"$2.95","price":295,"sku":"OTCINS20"},{"id":31717578276916,"title":"$3.15","price":315,"sku":"OTCINS21"},{"id":31717578309684,"title":"$3.35","price":335,"sku":"OTCINS22"},{"id":31717578342452,"title":"$3.55","price":355,"sku":"OTCINS23"},{"id":31717578375220,"title":"$3.75","price":375,"sku":"OTCINS24"},{"id":31717578407988,"title":"$3.95","price":395,"sku":"OTCEINS25"},{"id":31717578440756,"title":"$4.15","price":415,"sku":"OTCINS26"},{"id":31717578473524,"title":"$4.35","price":435,"sku":"OTCINS27"},{"id":31717578506292,"title":"$4.55","price":455,"sku":"OTCINS28"},{"id":31717578539060,"title":"$4.75","price":475,"sku":"OTCINS29"},{"id":31717578571828,"title":"$4.95","price":495,"sku":"OTCINS30"},{"id":31717578604596,"title":"$5.15","price":515,"sku":"OTCINS31"},{"id":31717578637364,"title":"$5.35","price":535,"sku":"OTCINS32"},{"id":31717578670132,"title":"$5.55","price":555,"sku":"OTCINS33"},{"id":31717578702900,"title":"$5.75","price":575,"sku":"OTCINS34"},{"id":31717578735668,"title":"$5.95","price":595,"sku":"OTCINS35"},{"id":31717578768436,"title":"$6.15","price":615,"sku":"OTCINS36"},{"id":31717578801204,"title":"$6.35","price":635,"sku":"OTCINS37"},{"id":31717578833972,"title":"$6.55","price":655,"sku":"OTCINS38"},{"id":31717578866740,"title":"$6.75","price":675,"sku":"OTCINS39"},{"id":31717578899508,"title":"$6.95","price":695,"sku":"OTCINS40"},{"id":31717578932276,"title":"$7.15","price":715,"sku":"OTCINS41"},{"id":31717578965044,"title":"$7.35","price":735,"sku":"OTCINS42"},{"id":31717578997812,"title":"$7.55","price":755,"sku":"OTCINS43"},{"id":31717579030580,"title":"$7.75","price":775,"sku":"OTCINS44"},{"id":31717579063348,"title":"$7.95","price":795,"sku":"OTCINS45"},{"id":31717579096116,"title":"$8.15","price":815,"sku":"OTCINS46"},{"id":31717579128884,"title":"$8.35","price":835,"sku":"OTCINS47"},{"id":31717579161652,"title":"$8.55","price":855,"sku":"OTCINS48"},{"id":31717579194420,"title":"$8.75","price":875,"sku":"OTCINS49"},{"id":31717579227188,"title":"$8.95","price":895,"sku":"OTCINS50"},{"id":31717579259956,"title":"$9.38","price":938,"sku":"OTCINS51"},{"id":31717579292724,"title":"$10.03","price":1003,"sku":"OTCINS52"},{"id":31717579325492,"title":"$10.68","price":1068,"sku":"OTCINS53"},{"id":31717579358260,"title":"$11.33","price":1133,"sku":"OTCINS54"},{"id":31717579391028,"title":"$11.98","price":1198,"sku":"OTCINS55"},{"id":31717579423796,"title":"$12.63","price":1263,"sku":"OTCINS56"},{"id":31717579456564,"title":"$13.28","price":1328,"sku":"OTCINS57"},{"id":31717579489332,"title":"$13.93","price":1393,"sku":"OTCINS58"},{"id":31717579522100,"title":"$14.58","price":1458,"sku":"OTCINS59"},{"id":31717579554868,"title":"$15.23","price":1523,"sku":"OTCINS60"},{"id":31717579587636,"title":"$15.88","price":1588,"sku":"OTCINS61"},{"id":31717579620404,"title":"$16.53","price":1653,"sku":"OTCINS62"},{"id":31717579653172,"title":"$17.18","price":1718,"sku":"OTCINS63"},{"id":31717579685940,"title":"$17.83","price":1783,"sku":"OTCINS64"},{"id":31717579718708,"title":"$18.48","price":1848,"sku":"OTCINS65"},{"id":31717579751476,"title":"$19.13","price":1913,"sku":"OTCINS66"},{"id":31717579784244,"title":"$19.78","price":1978,"sku":"OTCINS67"},{"id":31717579817012,"title":"$20.43","price":2043,"sku":"OTCINS68"},{"id":31717579849780,"title":"$24.38","price":2438,"sku":"OTCINS69"},{"id":31717579882548,"title":"$31.63","price":3163,"sku":"OTCINS70"},{"id":31717579915316,"title":"$38.88","price":3888,"sku":"OTCINS71"},{"id":31717579948084,"title":"$46.13","price":4613,"sku":"OTCINS72"},{"id":31717579980852,"title":"$53.38","price":5338,"sku":"OTCINS73"},{"id":31717580013620,"title":"$60.63","price":6063,"sku":"OTCINS74"},{"id":31717580046388,"title":"$67.88","price":6788,"sku":"OTCINS75"},{"id":31717580079156,"title":"$75.13","price":7513,"sku":"OTCINS76"},{"id":31717580111924,"title":"$82.38","price":8238,"sku":"OTCINS77"},{"id":31717580144692,"title":"$89.63","price":8963,"sku":"OTCINS78"},{"id":31717580177460,"title":"$96.88","price":9688,"sku":"OTCINS79"},{"id":31717580210228,"title":"$104.13","price":10413,"sku":"OTCINS80"},{"id":31717580242996,"title":"$111.38","price":11138,"sku":"OTCINS81"},{"id":31717580275764,"title":"$118.63","price":11863,"sku":"OTCINS82"},{"id":31717580308532,"title":"$125.88","price":12588,"sku":"OTCINS83"},{"id":31717580341300,"title":"$133.13","price":13313,"sku":"OTCINS84"},{"id":31717580374068,"title":"$140.38","price":14038,"sku":"OTCINS85"}]};
    
    //window.OTCIns = {"id":4480997228596,"title":"Shipping Insurance","price":98,"price_min":98,"price_max":14038,"available":true,"variants":[{"id":31717577916468,"title":"$0.98","price":98,"sku":"OTCINS10"},{"id":31717577949236,"title":"$1.15","price":115,"sku":"OTCINS11"},{"id":31717577982004,"title":"$1.35","price":135,"sku":"OTCINS12"},{"id":31717578014772,"title":"$1.55","price":155,"sku":"OTCINS13"},{"id":31717578047540,"title":"$1.75","price":175,"sku":"OTCINS14"},{"id":31717578080308,"title":"$1.95","price":195,"sku":"OTCINS15"},{"id":31717578113076,"title":"$2.15","price":215,"sku":"OTCINS16"},{"id":31717578145844,"title":"$2.35","price":235,"sku":"OTCINS17"},{"id":31717578178612,"title":"$2.55","price":255,"sku":"OTCINS18"},{"id":31717578211380,"title":"$2.75","price":275,"sku":"OTCINS19"},{"id":31717578244148,"title":"$2.95","price":295,"sku":"OTCINS20"},{"id":31717578276916,"title":"$3.15","price":315,"sku":"OTCINS21"},{"id":31717578309684,"title":"$3.35","price":335,"sku":"OTCINS22"},{"id":31717578342452,"title":"$3.55","price":355,"sku":"OTCINS23"},{"id":31717578375220,"title":"$3.75","price":375,"sku":"OTCINS24"},{"id":31717578407988,"title":"$3.95","price":395,"sku":"OTCEINS25"},{"id":31717578440756,"title":"$4.15","price":415,"sku":"OTCINS26"},{"id":31717578473524,"title":"$4.35","price":435,"sku":"OTCINS27"},{"id":31717578506292,"title":"$4.55","price":455,"sku":"OTCINS28"},{"id":31717578539060,"title":"$4.75","price":475,"sku":"OTCINS29"},{"id":31717578571828,"title":"$4.95","price":495,"sku":"OTCINS30"},{"id":31717578604596,"title":"$5.15","price":515,"sku":"OTCINS31"},{"id":31717578637364,"title":"$5.35","price":535,"sku":"OTCINS32"},{"id":31717578670132,"title":"$5.55","price":555,"sku":"OTCINS33"},{"id":31717578702900,"title":"$5.75","price":575,"sku":"OTCINS34"},{"id":31717578735668,"title":"$5.95","price":595,"sku":"OTCINS35"},{"id":31717578768436,"title":"$6.15","price":615,"sku":"OTCINS36"},{"id":31717578801204,"title":"$6.35","price":635,"sku":"OTCINS37"},{"id":31717578833972,"title":"$6.55","price":655,"sku":"OTCINS38"},{"id":31717578866740,"title":"$6.75","price":675,"sku":"OTCINS39"},{"id":31717578899508,"title":"$6.95","price":695,"sku":"OTCINS40"},{"id":31717578932276,"title":"$7.15","price":715,"sku":"OTCINS41"},{"id":31717578965044,"title":"$7.35","price":735,"sku":"OTCINS42"},{"id":31717578997812,"title":"$7.55","price":755,"sku":"OTCINS43"},{"id":31717579030580,"title":"$7.75","price":775,"sku":"OTCINS44"},{"id":31717579063348,"title":"$7.95","price":795,"sku":"OTCINS45"},{"id":31717579096116,"title":"$8.15","price":815,"sku":"OTCINS46"},{"id":31717579128884,"title":"$8.35","price":835,"sku":"OTCINS47"},{"id":31717579161652,"title":"$8.55","price":855,"sku":"OTCINS48"},{"id":31717579194420,"title":"$8.75","price":875,"sku":"OTCINS49"},{"id":31717579227188,"title":"$8.95","price":895,"sku":"OTCINS50"},{"id":31717579259956,"title":"$9.38","price":938,"sku":"OTCINS51"},{"id":31717579292724,"title":"$10.03","price":1003,"sku":"OTCINS52"},{"id":31717579325492,"title":"$10.68","price":1068,"sku":"OTCINS53"},{"id":31717579358260,"title":"$11.33","price":1133,"sku":"OTCINS54"},{"id":31717579391028,"title":"$11.98","price":1198,"sku":"OTCINS55"},{"id":31717579423796,"title":"$12.63","price":1263,"sku":"OTCINS56"},{"id":31717579456564,"title":"$13.28","price":1328,"sku":"OTCINS57"},{"id":31717579489332,"title":"$13.93","price":1393,"sku":"OTCINS58"},{"id":31717579522100,"title":"$14.58","price":1458,"sku":"OTCINS59"},{"id":31717579554868,"title":"$15.23","price":1523,"sku":"OTCINS60"},{"id":31717579587636,"title":"$15.88","price":1588,"sku":"OTCINS61"},{"id":31717579620404,"title":"$16.53","price":1653,"sku":"OTCINS62"},{"id":31717579653172,"title":"$17.18","price":1718,"sku":"OTCINS63"},{"id":31717579685940,"title":"$17.83","price":1783,"sku":"OTCINS64"},{"id":31717579718708,"title":"$18.48","price":1848,"sku":"OTCINS65"},{"id":31717579751476,"title":"$19.13","price":1913,"sku":"OTCINS66"},{"id":31717579784244,"title":"$19.78","price":1978,"sku":"OTCINS67"},{"id":31717579817012,"title":"$20.43","price":2043,"sku":"OTCINS68"},{"id":31717579849780,"title":"$24.38","price":2438,"sku":"OTCINS69"},{"id":31717579882548,"title":"$31.63","price":3163,"sku":"OTCINS70"},{"id":31717579915316,"title":"$38.88","price":3888,"sku":"OTCINS71"},{"id":31717579948084,"title":"$46.13","price":4613,"sku":"OTCINS72"},{"id":31717579980852,"title":"$53.38","price":5338,"sku":"OTCINS73"},{"id":31717580013620,"title":"$60.63","price":6063,"sku":"OTCINS74"},{"id":31717580046388,"title":"$67.88","price":6788,"sku":"OTCINS75"},{"id":31717580079156,"title":"$75.13","price":7513,"sku":"OTCINS76"},{"id":31717580111924,"title":"$82.38","price":8238,"sku":"OTCINS77"},{"id":31717580144692,"title":"$89.63","price":8963,"sku":"OTCINS78"},{"id":31717580177460,"title":"$96.88","price":9688,"sku":"OTCINS79"},{"id":31717580210228,"title":"$104.13","price":10413,"sku":"OTCINS80"},{"id":31717580242996,"title":"$111.38","price":11138,"sku":"OTCINS81"},{"id":31717580275764,"title":"$118.63","price":11863,"sku":"OTCINS82"},{"id":31717580308532,"title":"$125.88","price":12588,"sku":"OTCINS83"},{"id":31717580341300,"title":"$133.13","price":13313,"sku":"OTCINS84"},{"id":31717580374068,"title":"$140.38","price":14038,"sku":"OTCINS85"}]};
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
