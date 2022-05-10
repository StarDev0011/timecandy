var Product = Product || {};

Product = {
  Class: {
    swatchName: '.js-option-label',
    swatchInput: '.js-variant-input',
    swatchLabel: '.product-swatch__label',
    swatchImage: '.js-swatch-image',
    swatchSoldOut: '.js-option-sold-out',
    btnReadMore: '.js-read-more'
  },

  init: function() {
    this.dropDownOption();
    this.readMoreDesc();
  },

  dropDownOption: () => {
    // const variantTile = $(`${ Product.Class.swatchInput }:checked`).val();
    // $(Product.Class.swatchName).text(variantTile);
    const variantTile = document.querySelectorAll(`${ Product.Class.swatchInput }:checked`);
    variantTile.forEach(function (item, index) {
      const variantLabel = document.querySelectorAll(`${ Product.Class.swatchName }`)[index];
      variantLabel.textContent = item.value;
    });

    if($(Product.Class.swatchImage).length) {
      const varinatImg = $(`${ Product.Class.swatchInput }:checked`).next().find('.product-form__swatch-image').attr('src');
      $(Product.Class.swatchImage).attr('src', varinatImg).show();
    }

    if($(Product.Class.swatchSoldOut).length) {
      const soldOut = $(`${ Product.Class.swatchInput }:checked`).next().find('.product-form__swatch-soldout').text();
      $(Product.Class.swatchSoldOut).text(soldOut);
    }

    // $('body').on('click', Product.Class.swatchLabel, function() {
    //   $(this).next().slideToggle(200);
    // });

    const swatchLabel = document.querySelectorAll(Product.Class.swatchLabel);
    swatchLabel.forEach(function(itemLabel) {
      itemLabel.addEventListener('click', function () {
        this.nextElementSibling.style.display = 'block';
      });
    })

    $('body').on('change', Product.Class.swatchInput, function() {
      const name = $(this).val();
      $(Product.Class.swatchName).text(name);
      $('.product-form__swatch-dropdown').slideToggle(200);

      if($(Product.Class.swatchImage).length) {
        const image = $(this).next().find('.product-form__swatch-image').attr('src');
        const textSoldOut =  $(this).next().find('.product-form__swatch-soldout').text();
        $(Product.Class.swatchImage).attr('src', image).show();
        $(Product.Class.swatchSoldOut).text(textSoldOut);
      }
    })
  },

  readMoreDesc: () => {
    $('body').on('click', Product.Class.btnReadMore, function() {
      $('.product__desc-text').removeClass('product__height-desc');
      $(this).hide();
    });
  }
};

$(function() {
  Product.init();
})
