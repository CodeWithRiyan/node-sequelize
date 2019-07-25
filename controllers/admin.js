const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {pageTitle:'Add Product', path:'/admin/add-product', editing:false});
}

exports.getEditProducts = (req, res, next) => {
    editMode = req.query.edit
    if(!editMode){
        return res.redirect('/');
    }
    const productId = req.params.productId;
    req.user.getProducts({where: {id: productId}})
    .then(products => {
        const product = products[0];
        if(!product){
            return res.redirect('/');
        }
        res.render('admin/edit-product', {pageTitle:'Edit Product', path:'/admin/edit-product', editing: editMode, product:product});
    })
}

exports.postAddProducts = (req, res, next) => {
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description
    req.user.createProduct({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
    })
    .then(result => {
        console.log(result);
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err)
    })
}

exports.postEditProducts = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImage = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description
    Product.findByPk(prodId).then(product => {
        product.title = updatedTitle;
        product.imageUrl = updatedImage;
        product.price = updatedPrice;
        product.description = updatedDesc;
        return product.save();
    }).then(result => {
        console.log('UPDATED PRODUCT');
        res.redirect('/admin/products');
    }).catch(err => console.log(err));
}

exports.postDeleteProducts = (req, res, next) => {
    const productId = req.body.productId
    Product.findByPk(productId).then(product => {
        return product.destroy();
    }).then(result => {
        console.log('DELETED PRODUCT');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    })
}

exports.listProducts = (req, res, next) => {
    req.user.getProducts().then(products => {
        res.render('admin/products', {prods:products, pageTitle:'List Product', path:'/admin/products'});
    }).catch(err => console.log(err))
}
