var Collection = Collection || {};

Collection = {
  init: function() {
    this.collectionSlider();
  },

  collectionSlider: () => {
    const breakpoint = window.matchMedia( '(min-width: 768px)' );
    let productSlider;
    const breakpointCheck = function() {
      if ( breakpoint.matches === true ) {
        if ( productSlider !== undefined ) productSlider.destroy( true, true );
          return;
      } else if ( breakpoint.matches === false ) {
        return enableSwiper();
      }
    };

    const enableSwiper = function() {
      productSlider = new Swiper ('.js-product-slider', {
        loop: false,
        slidesPerView: 1,
        spaceBetween: 16,
        centeredSlides: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        }
      });
    };
    breakpoint.addListener(breakpointCheck);
    breakpointCheck();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  Collection.init();
});
