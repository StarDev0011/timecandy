window.addEventListener('load', (event) => {
    addToBag();
});


const productItems = document.querySelectorAll('.card-product__item');
const bag = document.querySelector('#drop-zone');

// ajax add to cart without open the cart drawer
function updateBagItem() {
    fetch(window.Shopify.routes.root + 'cart.js')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.querySelector('.js-cart-count').innerHTML = data.item_count;
            document.querySelector('.packabag-sidebar__count').innerHTML = data.item_count;
        });
}

function addToBag() {
    document.querySelectorAll('[data-pack-a-bag]').forEach((el) => {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            let addToCartForm = this.parentElement;
            let formData = {
                'items': [{
                    'id': this.previousElementSibling.value,
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
                    updateCartCount();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        })
    })
}

productItems.forEach(item => {
    item.addEventListener('dragstart', dragStart)
    item.addEventListener('dragend', dragEnd)
});

bag.addEventListener('dragover', dragOver);
bag.addEventListener('dragenter', dragEnter);
bag.addEventListener('dragleave', dragLeave);
bag.addEventListener('drop', dragDrop);

