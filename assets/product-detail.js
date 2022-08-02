var Product = Product || {};

Product = {
  Class: {
    swatchName: '.js-option-label',
    swatchInput: '.js-variant-input',
    swatchLabel: '.product-swatch__label',
    swatchImage: '.js-swatch-image',
    swatchSoldOut: '.js-option-sold-out',
    btnReadMore: '.js-read-more',
    swatchDropdown: '.product-form__swatch-dropdown[role="listbox"]'
  },

  init: function() {
    this.dropDownOption();
    this.readMoreDesc();
    this.sliderProductImages();
    // let giangvip = document.querySelector('variant-radios')
    // giangvip.getVariantData()
    // giangvip.updateOptions()
    // giangvip.updateMasterId()
    // console.dir(giangvip)
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
      let positionDropdown = window.innerHeight - itemLabel.getBoundingClientRect().bottom;
      let heightDropdown;
      document.addEventListener('scroll', function () {
        positionDropdown = window.innerHeight - itemLabel.getBoundingClientRect().bottom;
        itemLabel.addEventListener('click', function () {
          heightDropdown = this.nextElementSibling.offsetHeight;
          if (positionDropdown <= heightDropdown) {
            this.nextElementSibling.style.cssText=`
              bottom: 50px;
              top: auto;
            `
          }else{
            this.nextElementSibling.style.cssText=`
              bottom: auto;
              top: 100%;
            `
          }
        })
      });

      itemLabel.addEventListener('click', function () {
        this.nextElementSibling.classList.toggle('active');
        this.setAttribute('aria-expanded','true');
        if(this.nextElementSibling.classList.contains('active')) this.setAttribute('aria-expanded','true')
        else this.setAttribute('aria-expanded','false');
        heightDropdown = this.nextElementSibling.offsetHeight;
        if (positionDropdown <= heightDropdown) {
          this.nextElementSibling.style.cssText=`
            bottom: 50px;
            top: auto;
          `
        }else{
          this.nextElementSibling.style.cssText=`
            bottom: auto;
            top: 100%;
          `
        }
      });

      itemLabel.addEventListener('keypress', function (e) {
        if ((e.keyCode || e.which) === 13) {
          this.nextElementSibling.classList.toggle('active');
          this.setAttribute('aria-expanded','true');
          if(this.nextElementSibling.classList.contains('active')) this.setAttribute('aria-expanded','true')
          else this.setAttribute('aria-expanded','false');
        }
      });

      itemLabel.addEventListener('keydown', function(e){
        if ((e.keyCode || e.which) === 27) {
          this.nextElementSibling.classList.remove('active');
          this.setAttribute('aria-expanded','false');
        }
      })
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

      input.addEventListener('keypress', function(e) {
        if (e.which === 13) {
          const name = input.value;
          this.parentNode.classList.remove('active');
          const elmTitle = this.parentNode.previousElementSibling;
          elmTitle.querySelector('.js-option-label').textContent = name;
          if(swatchSoldOut){
            const textSoldOut = input.nextElementSibling.querySelector('.product-form__swatch-soldout').textContent;
            swatchSoldOut.textContent = textSoldOut;
          }
        }
      })

      input.addEventListener('keydown', function(e){
        if ((e.keyCode || e.which) === 27) {
          this.parentNode.classList.remove('active');
        }
      })
    })


  },

  readMoreDesc: () => {
    const btnReadmore = document.querySelector(Product.Class.btnReadMore);
    const desc = document.querySelector('.product__desc-text');
    btnReadmore.addEventListener('click', function(e) {
      e.preventDefault();

      if (desc.classList.contains('product__height-desc')) {
        btnReadmore.innerHTML = 'Read Less';
      } else {
        btnReadmore.innerHTML = 'Read More';
      }

      desc.classList.toggle('product__height-desc');

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
