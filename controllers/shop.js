const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/index', {prods:products, pageTitle:'Index', path:'/'});
    }).catch(err => {
        console.log(err);
    })
}

exports.getProductById = (req, res, next) => {
    productId = req.params.productId;
    //Product.findAll({where: {id: productId}}).then(products => {
    //    res.render('shop/product-detail', {product:products[0],pageTitle: products[0].title, path:'/products' });
    //}).catch(err => console.log(err));
    Product.findByPk(productId).then(product => {
        res.render('shop/product-detail', {product:product,pageTitle: product.title, path:'/products' });
    }).catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.getCart().then(cart => {
        return cart.getProducts().then(products => {
            res.render('shop/cart', {pageTitle:'Cart Shopping', path:'/cart', products: products});
        })
    }).catch(err => console.log(err));
    //Cart.getCart(cart => {
    //    Product.fetchAll(products => {
    //        const cartProducts = [];
    //        for(product of products){
    //            const cartProductData = cart.products.find(
    //                prod => prod.id === product.id
    //            );
    //            if(cartProductData){
    //                cartProducts.push({productData:product, qty: cartProductData.qty});
    //            }
    //        }
    //        res.render('shop/cart', {pageTitle:'Cart Shopping', path:'/cart', products: cartProducts});
    //    })
    //})
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart().then(cart => {
        console.log(cart);
        fetchedCart = cart;
        return cart.getProducts({where: {id: productId}});
    }).then(products => {
        let product;
        if(products.length > 0){
            product = products[0];
        }
        if(product){
            const oldQty = product.cartItem.quantity;
            newQuantity = oldQty + 1;
            return product
        }
        return Product.findByPk(productId)
    }).then(product => {
        return fetchedCart.addProduct(product, {
            through: {quantity: newQuantity}
        })
    }).then(() => {
        res.redirect('/cart')
    }).catch(err => console.log(err));
}

exports.postCartDelete = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart().then(cart => {
        return cart.getProducts({where: {id: prodId}});
    }).then(products => {
        const product = products[0];
        return product.cartItem.destroy();
    }).then(result => {
        res.redirect('/cart');
    }).catch(err => console.log(err));
}

exports.ordersProduct = (req, res, next) => {
    req.user.getOrders({include: ['products']}).then(orders => {
        console.log(orders);
        res.render('shop/orders', {pageTitle:'Orders Page', path:'/orders',orders:orders})
    }).catch(err => console.log(err))
}

exports.listProduct = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', {prods:products, pageTitle:'Index', path:'/products'});
    }).catch(err => {
        console.log(err);
    })
}

exports.checkoutProduct = (req, res, next) => {
    res.render('shop/checkout', {pageTitle:'Checkout Page', path:'/checkout'})
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart().then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    }).then(products => {
        return req.user.createOrder().then(order => {
            return order.addProducts(products.map( product => {
                product.orderItem = {quantity: product.cartItem.quantity};
                return product;
            }))
        }).catch(err => console.log(err));
    }).then(result => {
        return fetchedCart.setProducts(null);
    }).then(result => {
        res.redirect('/orders');
    }).catch(err => console.log(err))
}