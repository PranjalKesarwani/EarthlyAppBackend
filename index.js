var path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
const port = process.env.PORT || 8000;
var cors = require('cors');
require('./db/dbConnection');
var { signUpModel, productModel } = require('./Models/dataSchema');
var cookieParser = require('cookie-parser');
const auth = require('./Middleware/auth')
var bodyParser = require('body-parser');
const { set } = require('mongoose');

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/signup', async (req, res) => {
    try {
        const pass = req.body.password;
        const cnfmPass = req.body.confirmPassword;
        if (pass === cnfmPass) {
            const userSignup = new signUpModel({
                username: req.body.username,
                email: req.body.email,
                cart: [],
                orders: [],
                addresses: [],
                password: pass,
                confirmPassword: cnfmPass
            });

            const token = await userSignup.generateAuthToken();

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true

            })
            await userSignup.save();
            const obj = userSignup.toObject();
            res.status(201).send({ user: { _id: obj._id, email: obj.email, username: obj.username, cart: [], addresses: [], orders: [] }, status: true });


        } else {
            alert('Your password and confirm password is not matching')
        }

    } catch (error) {
        res.send({ status: false });
    }

})
app.post('/login', async (req, res) => {


    const userMail = req.body.email;

    const userDoc = await signUpModel.findOne({ email: userMail });
    const isCorrect = await bcrypt.compare(req.body.password, userDoc.password);
    if (isCorrect) {

        const token = await userDoc.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true

        })

        res.send({ user: { _id: userDoc._id, email: userDoc.email, username: userDoc.username, cart: userDoc.cart, addresses: userDoc.addresses, orders: userDoc.orders }, status: true });

    }
    else {
        res.send({
            status: false
        })
    }

})
app.get('/createproducts', async (req, res) => {
    const products = new productModel(
        {
            imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz1OmtXa03-Poq8Bej3mP7UQLIL91ObqdKlw&usqp=CAU",
            title: "Sustainable Dishes",
            price: 900
        }
    )

    await products.save();
    res.send('hello');
})
app.get('/products', (req, res) => {
    productModel.find({}).then((response) => {
        res.send(response);
    }).catch((err) => {
        console.log(err);
    })
})
app.post('/addtocart', auth, async (req, res) => {
    const item = req.body;

    req.user.cart.push(item);
    await req.user.save();

    res.send({ item: item, status: true });
})
app.post('/changecart', auth, async (req, res) => {
    const product = req.body;

    const cart = req.user.cart;
    const newArray = cart.map((item) => {
        if (item.imgUrl === product.imgUrl && item.title === product.title && item.price === product.price) {
            return { ...product };
        }
        return item;
    })
    req.user.cart = newArray;
    await req.user.save();
    res.send({ item: product, status: true });
})
app.get('/cart', auth, async (req, res) => {
    try {
        res.send({ status: true, user: { _id: req.user._id, username: req.user.username, email: req.user.email, cart: req.user.cart, addresses: req.user.addresses, orders: req.user.orders } });
    } catch (error) {
        res.send(error);
    }


})
app.post('/removeitem', auth, async (req, res) => {
    try {
        let data = req.body;
        const userCart = req.user.cart;

        let newCart = userCart.filter((item) => {
            return (item._id != data._id);
        });
        req.user.cart = newCart;
        await req.user.save()
        res.send({ itemData: data, user: req.user });
    } catch (error) {
        res.send(error);
    }

})
app.get('/user', auth, (req, res) => {

    res.send({ status: true, user: { _id: req.user._id, username: req.user.username, email: req.user.email, cart: req.user.cart, addresses: req.user.addresses, orders: req.user.orders } });
})
app.post('/addaddress', auth, async (req, res) => {

    try {
        const addressDetails = req.body;
        req.user.addresses.push(addressDetails);

        await req.user.save();

        res.send({ address: addressDetails, status: true })
    } catch (error) {
        res.send({ status: false });
    }

})
app.post('/placeorder', auth, async (req, res) => {
    try {

        let order = req.body;
        req.user.orders.push(order);
        req.user.cart = [];
        await req.user.save();
        res.send({ order: order, status: true });
    } catch (error) {
        res.send(error);
    }

})
app.get('/emptycart', auth, async (req, res) => {
    req.user.cart = [];
    await req.user.save();


})
app.get('/logout', auth, async (req, res) => {

    req.user.tokens = [];
    res.clearCookie("jwt");
    await req.user.save();
    res.send({ status: true });
})


app.listen(port, () => {
    console.log('Server established!');
})