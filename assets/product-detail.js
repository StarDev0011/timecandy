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
    this.sliderProductImages();
  },

  dropDownOption: () => {
    const variantTile = document.querySelectorAll(`${ Product.Class.swatchInput }:checked`);
    const swatchLabel = document.querySelectorAll(Product.Class.swatchLabel);
    const swacthIuput = document.querySelectorAll(Product.Class.swatchInput);
    const variantLabel = document.querySelectorAll(Product.Class.swatchName);
    const swatchSoldOut = document.querySelector(Product.Class.swatchSoldOut);
    const dropdown = document.querySelectorAll('.product-form__swatch-dropdown');

    variantTile.forEach(function (item, index) {
      variantLabel[index].textContent = item.value;
    });

    const variantImage =  document.querySelectorAll(`${ Product.Class.swatchInput }:checked`)
    if($(Product.Class.swatchImage).length) {
      const varinatImg = $(`${ Product.Class.swatchInput }:checked`).next().find('.product-form__swatch-image').attr('src');
      $(Product.Class.swatchImage).attr('src', varinatImg).show();
    }

    if($(Product.Class.swatchSoldOut).length) {
      const soldOut = $(`${ Product.Class.swatchInput }:checked`).next().find('.product-form__swatch-soldout').text();
      $(Product.Class.swatchSoldOut).text(soldOut);
    }

    swatchLabel.forEach(function(itemLabel) {
      itemLabel.addEventListener('click', function () {
        this.nextElementSibling.classList.toggle('active');
      });
    })

    swacthIuput.forEach(function(input) {
      input.addEventListener('change', function() {
        const name = input.value;
        this.parentNode.classList.remove('active');
        const elmTitle = this.parentNode.previousElementSibling;
        elmTitle.querySelector('.js-option-label').textContent = name;
        if(swatchSoldOut){
          const textSoldOut = input.nextElementSibling.querySelector('.product-form__swatch-soldout').textContent;
          swatchSoldOut.textContent = textSoldOut;
        }
      })
    })

    // document.addEventListener('click', (e) => {
    //   if (!e.target.matches('.product-swatch__label')) {
    //     for (let i = 0; i < dropdown.length; i++) {
    //       var openDropdown = dropdown[i];
    //       if (openDropdown.classList.contains('active')) {
    //         openDropdown.classList.toggle('active');
    //       }
    //     }
    //   }
    // });
    // $('body').on('change', Product.Class.swatchInput, function() {
    //   const name = $(this).val();
    //   $(Product.Class.swatchName).text(name);
    //   $('.product-form__swatch-dropdown').slideToggle(200);

    //   if($(Product.Class.swatchImage).length) {
    //     const image = $(this).next().find('.product-form__swatch-image').attr('src');
    //     const textSoldOut =  $(this).next().find('.product-form__swatch-soldout').text();
    //     $(Product.Class.swatchImage).attr('src', image).show();
    //     $(Product.Class.swatchSoldOut).text(textSoldOut);
    //   }
    // })
  },

  readMoreDesc: () => {
    const btnReadmore = document.querySelector(Product.Class.btnReadMore);
    const desc = document.querySelector('.product__desc-text');
    btnReadmore.addEventListener('click', function(e) {
      e.preventDefault();
      desc.classList.remove('product__height-desc');
      btnReadmore.style.display = 'none';
    });
  },

  sliderProductImages: () => {
    var thumnail = new Swiper('.js-swiper-thumnail', {
      direction: 'horizontal',
      slidesPerView: 4,
      spaceBetween: 4,
      slidesPerGroup: 1,
      freeMode: true,
      preloadImages: true,
      updateOnImagesReady: true,
      navigation: {
        nextEl: ".swiper-btn-next",
        prevEl: ".swiper-btn-prev",
        clickable: true
      },
      breakpoints: {
        900: {
          direction: 'vertical',
        }
      }
    });
    var Swipes = new Swiper('.js-swiper-main', {
      spaceBetween: 10,
      thumbs: {
        swiper: thumnail,
      },
      preloadImages: true,
      updateOnImagesReady: true
    });
  }
};

$(function() {
  Product.init();
})
