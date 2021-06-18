<script>
    var pixelID = '1264687297239092';
    var OGPageTitle = 'meta[property="og:title"]';

    // variables for prodListAddToCart() function
    var thumbnailAddToCartButtons = 'li.product.type-product a.button.add_to_cart_button.ajax_add_to_cart'; // querySelectorAll
    var thumbnailAddToCartProductId = 'data-product_id'; // getAtribute
    var thumbnailAddToCartDetailsParent = 'li.product.type-product'; // parent of Name and Price
    var thumbnailProductName = 'span.entry-title'; // get inner text
    var thumbnailProductPrice = 'ins .woocommerce-Price-amount'; // parse inner text as float


    // variables for trackProductViewAndProductCart() function
    var breadcrumbsContainer = 'ul.breadcrumb' // textContent split by breadcrumbCharacter
    var breadcrumbCharacter = '\n';
    var productPagePrice = 'meta[property="product:sale_price:amount"]' // parse content as int

    var productPageAddToCartButtons = '.single_add_to_cart_button' //query selector all
    var productPageQantity = 'div.quantity input[type=number]' // parse value as int

    var ajaxThumbnailPrice = 'li.product.post-POSTID .product-title-price-wrap ins' //postid will be replaced
    var ajaxProductPrice = '#product-POSTID div.summary form button.single_add_to_cart_button' //postid will be replaced

    // variables for main procedure
    var homepageUrl = 'https://kidstoys.gr';
    var categoryPageUrl = '/product-category/';
    var categoryPageName = OGPageTitle; //get content
    var categoryPageNameRemove = ['–', 'kidstoys.gr'];

    var productPageUrl = '/product/';

    var searchPageUrl = '/?s=';
    var searchTerm = OGPageTitle; //get content
    var searchPageTermRemove = ['–', 'kidstoys.gr', 'Αποτελέσματα για', '“', '”', '  '];

    var cartPageUrl = '/cart/';
    var checkoutPageUrl = '/checkout/';
    var orderReceivedUrl = '/order-received/';
    var checkoutPageValue = '#order_review tr.order-total span' // parse innerText as float
    var checkoutPageProducts = '#order_review tbody td.product-name > strong';
    var checkoutQuantityMultiplier = '×';


    function getCurrentUrl() {
        return window.location.href.toString()
    }


    function getParentBySelector(element, selector) {
        let el = element;
        while (el) {
            let temp = el.parentNode.classList;
            let flag = temp.contains(selector);
            if (flag) {
                return el.parentNode;
            }
            el = el.parentNode;
        }
    }


    function removeSubstrings(string, substrings) {
        let newString = string;
        for (i = 0; i < substrings.length; i++) {
            newString = newString.replace(substrings[i], '');
        }
        return newString.trim();
    }


    function docReady(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 1);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function extractTrackingParametersFromSkroutz() {
        let skroutzScripts = Array.from(document.querySelectorAll('script[data-cfasync="false"]'));
        skroutzScripts = skroutzScripts.map(script => script.innerText);
        let selectedSkroutz = skroutzScripts.filter(script => script.includes('revenue'))[0];

        let order = selectedSkroutz.split(';')[0]
        let totalValue = parseFloat(order.split('revenue":')[1].split(',')[0]);
        let items = selectedSkroutz.split(';');
        items.pop();
        items.shift();

        let sItmes = [];
        items.forEach(item => {
            temp = item.replace("skroutz_analytics('ecommerce', 'addItem', ", '')
            temp = temp.slice(0, -1);;
            temp = JSON.parse(temp)
            sItmes.push(temp);
        });
        let contentIds = [];
        let contents = []
        let numItems = 0;
        sItmes.forEach(item => {
            contentIds.push(item.product_id.toString())
            contents.push({
                id: item.product_id.toString(),
                content_type: 'product',
                quantity: item.quantity,
                price: item.price
            })
            numItems += item.quantity;
        })
        let params = {
            content_type: 'product',
            content_ids: contentIds,
            contents: contents,
            num_items: numItems,
            value: totalValue,
            currency: "EUR"
        };
        return params;
    }


    function trackProductViewAndProductCart() {
        // track viewcontent
        let id = Array.from(document.querySelector('body').classList).filter(className => className.includes('postid'))[0];
        id = id.replace('postid-', '');

        let data = document.querySelector(breadcrumbsContainer).innerText.split(breadcrumbCharacter);
        let category = data[data.length - 2];
        let prodName = data[data.length - 1];

        let price = parseFloat(document.querySelector(productPagePrice).content);

        let content = {
            content_name: prodName,
            content_category: category,
            content_ids: [id],
            content_type: 'product',
            value: price,
            currency: 'EUR'
        };
        // fbq('track', 'ViewContent', content);

        Array.from(document.querySelectorAll('.single_add_to_cart_button')).forEach(button => {
            button.addEventListener('click', function() {
                let quantity = document.querySelector('div.quantity input[type=number]').value;
                quantity = parseInt(quantity);
                let params = {
                    content_name: prodName,
                    content_type: 'product',
                    content_ids: [id],
                    contents: [{
                        id: id,
                        quantity: quantity,
                        price: price
                    }],
                    quantity: quantity,
                    value: price * quantity,
                    currency: "EUR"
                };
                // fbq('track', 'AddToCart', params);
            })
        });

    }

    function mainProcedure() {
        let currentUrl = getCurrentUrl()
        if (currentUrl === homepageUrl) {
            // fbq('track', 'ViewContent', {
            //     content_name: 'Homepage'
            // });
            setCookie('fromCheckout', 'no', 1);
        } else if (currentUrl.includes(categoryPageUrl)) {
            let category = document.querySelector(categoryPageName).content;
            category = removeSubstrings(category, categoryPageNameRemove);
            // fbq('track', 'ViewContent', {
            //     content_name: category
            // });
            setCookie('fromCheckout', 'no', 1);
        } else if (currentUrl.includes(productPageUrl)) {
            trackProductViewAndProductCart();
            setCookie('fromCheckout', 'no', 1);
        } else if (currentUrl.includes(searchPageUrl)) {
            let searchString = document.querySelector(searchTerm).content;
            searchString = removeSubstrings(searchString, searchPageTermRemove);
            // fbq('track', 'Search', {
            //     search_string: searchString
            // });
            setCookie('fromCheckout', 'no', 1);
        } else if (currentUrl.includes(cartPageUrl)) {
            // fbq('track', 'ViewContent', {
            //     content_name: 'Cart'
            // });
            setCookie('fromCheckout', 'no', 1);
        } else if (currentUrl.includes(checkoutPageUrl) && !currentUrl.includes(orderReceivedUrl)) {
            setCookie('fromCheckout', 'yes', 1);
            let totalValue = parseFloat(document.querySelector(checkoutPageValue).innerText);
            let products = Array.from(document.querySelectorAll(checkoutPageProducts));
            let numItems = 0;
            products.forEach(product => {
                let temp = parseInt(product.innerText.replace(checkoutQuantityMultiplier, ''));
                numItems += temp;
            })
            // fbq('track', 'InitiateCheckout', {
            //     value: totalValue,
            //     num_items: numItems,
            //     currency: 'EUR'
            // });
        } else if (currentUrl.includes(orderReceivedUrl) && getCookie('fromCheckout') == 'yes') {
            let params = extractTrackingParametersFromSkroutz();
            let my_url = window.location.href.toString();
            let store_pref = my_url.split('//')[1].split('.')[0].substring(0, 2);
            let order_id_g = my_url.split('order-received/')[1].split('/')[0];
            if (order_id_g) {
                let transaction_id = store_pref + order_id_g;
            } else {
                let transaction_id = '';
            }
            let totalValue = params.totalValue;
            gtag('event', 'conversion', {
            'send_to': 'AW-617519608/TCN3CNKtj-QBEPizuqYC',
            'value': totalValue,
            'currency': 'EUR',
            'transaction_id': transaction_id
            });
            // fbq('track', 'Purchase', params);
            setCookie('fromCheckout', 'no', 1);

        } else if (currentUrl.includes(orderReceivedUrl)) {
            // fbq('track', 'ViewContent', {
            //     content_name: 'Order Received Page'
            // });
            setCookie('fromCheckout', 'no', 1);
        } else {
            let pageName = document.querySelector(OGPageTitle).content;
            // fbq('track', 'ViewContent', {
            //     content_name: pageName
            // });
            setCookie('fromCheckout', 'no', 1);
        }
    }

    var debounce = function(fn) {

        // Setup a timer
        var timeout;

        // Return a function to run debounced
        return function() {

            // Setup the arguments
            var context = this;
            var args = arguments;

            // If there's a timer, cancel it
            if (timeout) {
                window.cancelAnimationFrame(timeout);
            }

            // Setup the new requestAnimationFrame()
            timeout = window.requestAnimationFrame(function() {
                fn.apply(this, args);
            });

        }

    };

    function trackAddTocart(event, request, settings) {
        if (settings.url.toString().includes('add_to_cart')) {
            let params = {}
            let quantity = settings.data.split('quantity=')[1];
            let prodName = settings.data.split('product_sku=')[1].split('&')[0];

            let id = settings.data.split('product_id=')[1].split('&')[0];
            let price = '';
            console.log(id);
            let f = ajaxProductPrice.replace('POSTID', id);
            console.log(f)
            f = document.querySelector(f);
            console.log(f)
            if (f) {
                price = parseInt(document.querySelector(productPagePrice).content);
            } else {
                let select = ajaxThumbnailPrice.replace('POSTID', id);
                price = parseFloat(document.querySelector(select).innerText);
            }
            params = {
                content_name: prodName,
                content_type: 'product',
                content_ids: [id],
                contents: [{
                    id: id,
                    quantity: quantity,
                    price: price
                }],
                quantity: quantity,
                value: price * quantity,
                currency: "EUR"
            };
            // fbq('track', 'AddToCart', params);
        }
    }

    var trackAddToCartDebounced = debounce(trackAddTocart);

    function ajaxAddToCartListener() {
        jQuery(document).ajaxComplete(function(event, request, settings) {
            trackAddToCartDebounced(event, request, settings);
        });
    }
    ajaxAddToCartListener()

    ! function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
            n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    }(window, document, 'script',
        'https://connect.facebook.net/en_US/fbevents.js');
    // fbq('init', pixelID);
    // fbq('track', 'PageView');
    ajaxAddToCartListener()
    docReady(mainProcedure);
</script>
