
function initQuickAdd() {
    const itemQuickAdd = document.querySelectorAll('[data-quick-add]');
    itemQuickAdd.forEach(function(btn) {
      btn.onclick = function(e) {
        e.preventDefault();
        const baseUrl = this.getAttribute('data-url');
        const quickAdd = document.querySelectorAll('.quick-add');
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (this.readyState === 4 && this.status === 200) {
            quickAdd.forEach((item) => {
              item.innerHTML = '';
              item.classList.remove('active');
            })
            const html = btn.closest('.card-product__form').nextElementSibling;
            html.innerHTML += this.responseText;
            html.classList.add('active');
            let swatchName = document.querySelectorAll('.js-swacth-label');
            let swatchActive = document.querySelectorAll('.js-swatch-active');
            if (swatchActive != null) {
              swatchActive.forEach(function(item, i) {
                swatchName[i].innerHTML = item.textContent;
              })
            }
  
            const btnClose = document.querySelector('.js-close-quick-add');
            const itemSwacth = document.querySelectorAll('.js-swatch-item');
            itemSwacth.forEach(function(item, i) {
              item.onclick = () => {
                const elmTitle = item.parentNode.previousElementSibling;
                elmTitle.querySelector('.js-swacth-label').textContent = item.textContent.trim();
                item.parentNode.classList.remove('active');
              }
  
              item.addEventListener('keydown', function (e) {
                if (e.which === 13) {
                  const elmTitle = item.parentNode.previousElementSibling;
                  elmTitle.querySelector('.js-swacth-label').textContent = item.textContent.trim();
                  item.parentNode.classList.remove('active');
                }
              });
            })
  
            btnClose.onclick = () => {
              html.classList.remove('active');
            }
  
            const swatchLabel = document.querySelectorAll('.product-swatch__label');
            swatchLabel.forEach(function(itemLabel) {
              itemLabel.onclick = (e) => {
                itemLabel.nextElementSibling.classList.toggle('active');
                if (itemLabel.nextElementSibling.classList.contains('active')) {
                  e.currentTarget.setAttribute("aria-expanded","true");
                }else{
                  e.currentTarget.setAttribute("aria-expanded","false");
                }
              }
  
              itemLabel.addEventListener('keypress', function (e) {
                if (e.which === 13) {
                  itemLabel.nextElementSibling.classList.toggle('active');
                  if (itemLabel.nextElementSibling.classList.contains('active')) {
                    e.currentTarget.setAttribute("aria-expanded","true");
                  }else{
                    e.currentTarget.setAttribute("aria-expanded","false");
                  }
                }
              });
            });
  
            document.querySelectorAll('.product-form__swatch-size label').forEach((labelItem) => {
              labelItem.addEventListener('click', function(event){
                document.querySelectorAll('label').forEach((e) => e.setAttribute('aria-pressed', 'false'));
                event.currentTarget.setAttribute('aria-pressed', 'true');
              })
            })
          }
        }
        xmlhttp.open('GET', baseUrl+'?view=quick-add');
        xmlhttp.send();
      }
    });
  }
  
  window.onload = function() {
    initQuickAdd();
  }