var Product = Product || {};

Product = {
  Class: {
    swatchName: '.js-option-label',
    swatchInput: '.js-variant-input',
    swatchLabel: '.product-swatch__label'
  },

  init: function() {
    this.dropDownOption();
  },

  dropDownOption: () => {
    const variantTile = $(`${ Product.Class.swatchInput }:checked`).val();
    $(Product.Class.swatchName).text(variantTile);

    $('body').on('click', Product.Class.swatchLabel, function() {
      $(this).next().slideToggle(200);
    });

    $('body').on('change', Product.Class.swatchInput, function() {
      const name = $(this).val();
      $(Product.Class.swatchName).text(name);
      $('.product-form__swatch-dropdown').slideToggle(200);
    })
  }
};

$(function() {
  Product.init();
})
