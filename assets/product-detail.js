var Product = Product || {};

Product = {
  Class: {
    swatchName: ".js-option-label",
    swatchInput: ".js-variant-input",
    swatchLabelID: ".js-variant-item",
    swatchLabel: ".product-swatch__label",
    swatchImage: ".js-swatch-image",
    swatchSoldOut: ".js-option-sold-out",
    swatchDropdown: '.product-form__swatch-dropdown[role="listbox"]',
  },

  init: function () {
    this.dropDownOption();
    this.readMoreDesc();
    this.sliderProductImages();
  },

  dropDownOption: () => {
    const variantTile = document.querySelectorAll(
      `${Product.Class.swatchInput}:checked`
    );
    const swacthInput = document.querySelectorAll(Product.Class.swatchInput);
    const swatchLabelID = document.querySelectorAll(
      Product.Class.swatchLabelID
    );
    const variantLabel = document.querySelectorAll(Product.Class.swatchName);
    const swatchSoldOut = document.querySelector(Product.Class.swatchSoldOut);
    let dropdownList = document.querySelectorAll(
      ".product-form__swatch-dropdown"
    );
    const swatchLabel = document.querySelectorAll(Product.Class.swatchLabel);

    const SPACEBAR_KEY_CODE = [0, 32];
    const ENTER_KEY_CODE = 13;
    const DOWN_ARROW_KEY_CODE = 40;
    const UP_ARROW_KEY_CODE = 38;
    const ESCAPE_KEY_CODE = 27;

    const listItemIds = [];

    variantTile.forEach(function (item, index) {
      variantLabel[index].textContent = item.value;
    });

    const variantImage = document.querySelectorAll(
      `${Product.Class.swatchInput}:checked`
    );
    if ($(Product.Class.swatchImage).length) {
      const varinatImg = $(`${Product.Class.swatchInput}:checked`)
        .next()
        .find(".product-form__swatch-image")
        .attr("src");
      $(Product.Class.swatchImage).attr("src", varinatImg).show();
    }

    if ($(Product.Class.swatchSoldOut).length) {
      const soldOut = $(`${Product.Class.swatchInput}:checked`)
        .next()
        .find(".product-form__swatch-soldout")
        .text();
      $(Product.Class.swatchSoldOut).text(soldOut);
    }

    swatchLabelID.forEach((item) => listItemIds.push(item.id));

    swatchLabel.forEach(function (itemLabel) {
      let positionDropdown =
        window.innerHeight - itemLabel.getBoundingClientRect().bottom;
      let heightDropdown;
      document.addEventListener("scroll", function () {
        positionDropdown =
          window.innerHeight - itemLabel.getBoundingClientRect().bottom;
        itemLabel.addEventListener("click", function () {
          heightDropdown = this.nextElementSibling.offsetHeight;
          if (positionDropdown <= heightDropdown) {
            this.nextElementSibling.style.cssText = `
              bottom: 50px;
              top: auto;
            `;
          } else {
            this.nextElementSibling.style.cssText = `
              bottom: auto;
              top: 100%;
            `;
          }
        });
      });

      itemLabel.addEventListener("click", (e) => {
        if (document.querySelector(".product-form__swatch-dropdown.active") && !e.currentTarget.nextElementSibling.classList.contains("active")) {
          document.querySelector(".product-form__swatch-dropdown.active").classList.remove("active");
        }
        toggleListVisibility(e);

        heightDropdown = e.currentTarget.nextElementSibling.offsetHeight;
        if (positionDropdown <= heightDropdown) {
          e.currentTarget.nextElementSibling.style.cssText = `
            bottom: 50px;
            top: auto;
          `;
        } else {
          e.currentTarget.nextElementSibling.style.cssText = `
            bottom: auto;
            top: 100%;
          `;
        }
      });

      itemLabel.addEventListener("keydown", (e) => {
        toggleListVisibility(e);
      });

      itemLabel.nextElementSibling.addEventListener("keydown", (e) => {
        toggleListVisibility(e);
      });
    });

    swacthInput.forEach(function (input) {
      input.addEventListener("change", function () {
        const name = input.value;
        this.parentNode.classList.remove("active");
        const elmTitle = this.parentNode.previousElementSibling;
        elmTitle.querySelector(".js-option-label").textContent = name;
        elmTitle.setAttribute("id", this.nextElementSibling.id);
        if (swatchSoldOut) {
          const textSoldOut = input.nextElementSibling.querySelector(
            ".product-form__swatch-soldout"
          ).textContent;
          swatchSoldOut.textContent = textSoldOut;
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.which === 13) {
          const name = input.value;
          this.parentNode.classList.remove("active");
          const elmTitle = this.parentNode.previousElementSibling;
          elmTitle.querySelector(".js-option-label").textContent = name;
          if (swatchSoldOut) {
            const textSoldOut = input.nextElementSibling.querySelector(
              ".product-form__swatch-soldout"
            ).textContent;
            swatchSoldOut.textContent = textSoldOut;
          }
        }
      });

      input.addEventListener("keydown", function (e) {
        if ((e.keyCode || e.which) === 27) {
          this.parentNode.classList.remove("active");
        }
      });
    });

    function setSelectedListItem(e) {
      let selectedTextToAppend = document.createTextNode(e.target.innerText);
      dropdownSelectedNode.innerHTML = null;
      dropdownSelectedNode.appendChild(selectedTextToAppend);
    }

    function closeList(e) {
      let dropdownArrow = e.currentTarget.children[1];
      dropdownArrow.classList.remove("expanded");
      e.currentTarget.nextElementSibling.classList.remove("active");
    }

    function toggleListVisibility(e) {
      let openDropDown =
        SPACEBAR_KEY_CODE.includes(e.keyCode) || e.keyCode === ENTER_KEY_CODE;

      if (e.keyCode === ESCAPE_KEY_CODE) {
        closeList(e);
      }

      if (e.type === "click" || openDropDown) {
        let dropdownArrow = e.currentTarget.children[1];
        dropdownArrow.classList.toggle("expanded");
        if (e.currentTarget.nextElementSibling) {
          e.currentTarget.nextElementSibling.classList.toggle("active");
        }
       
      }

      if (e.keyCode === DOWN_ARROW_KEY_CODE) {
        
        focusNextListItem(DOWN_ARROW_KEY_CODE);
      }

      if (e.keyCode === UP_ARROW_KEY_CODE && !e.currentTarget.classList.contains(Product.Class.swatchLabel.replace('.',''))) {
        
        focusNextListItem(UP_ARROW_KEY_CODE);
      }
    }

    function focusNextListItem(direction) {
      const activeElementId = document.activeElement.id;
      const currentActiveElementIndex = listItemIds.indexOf(activeElementId);
      if (direction === DOWN_ARROW_KEY_CODE) {
        
        const currentActiveElementIsNotLastItem =
          currentActiveElementIndex < listItemIds.length - 1;
        if (currentActiveElementIsNotLastItem) {
          let nextListItemId = listItemIds[currentActiveElementIndex + 1];
          document.querySelector(`.js-variant-item#${nextListItemId}`).focus();
        }
      } else if (direction === UP_ARROW_KEY_CODE) {
        
        const currentActiveElementIsNotFirstItem =
          currentActiveElementIndex > 0;
        if (currentActiveElementIsNotFirstItem) {
          let nextListItemId = listItemIds[currentActiveElementIndex - 1];
          document.querySelector(`.js-variant-item#${nextListItemId}`).focus();
        }
      }
    }
  },

  readMoreDesc: () => {
    $('.product__desc-text').readmore({
      speed: 75,
      collapsedHeight: 50,
      moreLink: '<a href="#" class="product__read-more roller">Read more</a>',
      lessLink: '<a href="#" class="product__read-more roller">Read less</a>'
    });
  },

  sliderProductImages: () => {
    let initialSlide = document.querySelector("[data-initial]");
    if (initialSlide != null) {
      let initialIndex = parseInt(initialSlide.dataset.index);
      let thumnail = new Swiper(".js-swiper-thumnail", {
        direction: "horizontal",
        slidesPerView: 'auto',
        freeMode: true,
        preloadImages: true,
        updateOnImagesReady: true,
        initialSlide: initialIndex - 1,
        navigation: {
          nextEl: ".swiper-btn-next",
          prevEl: ".swiper-btn-prev",
          clickable: true,
        },
        breakpoints: {
          900: {
            direction: "vertical",
          },
        },
      });
      let Swipes = new Swiper(".js-swiper-main", {
        spaceBetween: 10,
        thumbs: {
          swiper: thumnail,
        },
        initialSlide: initialIndex - 1,
        preloadImages: true,
        updateOnImagesReady: true,
      });
    } else {
      let thumnail = new Swiper(".js-swiper-thumnail", {
        direction: "horizontal",
        slidesPerView: 'auto',
        freeMode: true,
        preloadImages: true,
        updateOnImagesReady: true,
        navigation: {
          nextEl: ".swiper-btn-next",
          prevEl: ".swiper-btn-prev",
          clickable: true,
        },
        breakpoints: {
          900: {
            direction: "vertical",
          },
        },
      });
      let Swipes = new Swiper(".js-swiper-main", {
        spaceBetween: 10,
        thumbs: {
          swiper: thumnail,
        },
        preloadImages: true,
        updateOnImagesReady: true,
      });
    }
  },
};

$(function () {
  Product.init();
});
