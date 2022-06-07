window.addEventListener('load', (event) => {
    addToBag();
    initDraggable();
});

function updateBagItem() {
    fetch(window.Shopify.routes.root + 'cart.js')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.js-cart-count').innerHTML = data.item_count;
        document.querySelector('.packabag-sidebar__count').innerHTML = data.item_count;
    });
}

function addToBag() {
    document.querySelectorAll('.card-product__pack-bag').forEach((el) => {
        el.addEventListener('click', async function (e) {
            e.preventDefault();
            let addToCartForm = this.parentElement;
            let formData = {
                'items': [{
                    'id': this.previousElementSibling.value,
                    'quantity': 1
                }]
            };
            await fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                updateBagItem();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        })
    })
}

function initDraggable() {
    let productItems = document.querySelectorAll('.card-product__picture');
    let bag = document.querySelector('#drop-zone');
    let dragItem = null;
    
    
    productItems.forEach(item => {
        var initialPosX, initialPosY;

        item.addEventListener('dragstart', dragStart)
        item.addEventListener('dragend', dragEnd)

        item.addEventListener('touchstart', function(e) {
            initialPosX = item.getBoundingClientRect().left;
            initialPosY = item.getBoundingClientRect().top;
            item.style.opacity = '0.2';
            item.style.zIndex = '3';
        });
        item.addEventListener('touchmove', function(e) {
            var touchLocation = e.targetTouches[0];
            var newPosX = touchLocation.clientX - item.offsetWidth/2 - initialPosX;
            var newPosY = touchLocation.clientY - item.offsetHeight/2 - initialPosY;
            // // assign box new coordinates based on the touch.
            
            item.style.transform = 'translate('+newPosX+'px,'+newPosY+'px)';
          })

          item.addEventListener('touchend', function(e) {
            var afterPosX = item.getBoundingClientRect().left;
            var afterPosY = item.getBoundingClientRect().top;
            var afterPosXEnd = afterPosX + item.offsetWidth;
            var afterPosYEnd = afterPosY + item.offsetHeight;
            var bagPos = document.querySelector('#drop-zone').getBoundingClientRect();
            var bagPosX = bagPos.left;
            var bagPosY = bagPos.top;
            if (afterPosX <= bagPosX && bagPosX <= afterPosXEnd && afterPosY <= bagPosY && bagPosY <= afterPosYEnd) {
              let formData = {
                'items': [{
                  'id': item.dataset.productId,
                  'quantity': 1
                }]
              };
              fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              })
              .then(response => {
                updateBagItem();
              })
              .catch((error) => {
                console.error('Error:', error);
              });
            }
            item.style.transform = 'translate(0,0)';
            item.style.opacity = 1;
            item.style.zIndex = 2;
          })
    });
    
    bag.addEventListener('dragover', dragOver);
    bag.addEventListener('dragenter', dragEnter);
    bag.addEventListener('dragleave', dragLeave);
    bag.addEventListener('drop', dragDrop);

    function dragStart() {
        dragItem = this;
    }

    function dragEnd() {
        dragItem = null;
    }

    function dragOver(e) {
        e.preventDefault()
    }

    function dragEnter() {}
    function dragLeave() {}

    async function dragDrop() {
        let formData = {
            'items': [{
                'id': dragItem.dataset.productId,
                'quantity': 1
            }]
        };
        await fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            updateBagItem();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}