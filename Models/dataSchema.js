var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");



const signUpSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,

    },
    cart: {
        type: [Object], default: []
    },
    addresses: {
        type: [Object], default: []
    },
    orders: [{
        type: [Object], default: []
    }],
    password: {
        type: String,
        required: true,

    },
    confirmPassword: {
        type: String,
        required: true,

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true })


const productSchema = mongoose.Schema({
    imgUrl: {
        type: String
    },
    title: {
        type: String
    },
    price: {
        type: Number
    }
}, { timestamps: true })

signUpSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_TOKEN_KEY);

        this.tokens = this.tokens.concat({ token: token });
        await this.save();

        return token;

    } catch (error) {
        console.log(error);
    }
}

signUpSchema.pre('save', async function (next) {

    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
            this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);


            next();
        }

    } catch (error) {
        console.log(error);
    }

})

const signUpModel = mongoose.model('signUpData', signUpSchema)
const productModel = mongoose.model('product', productSchema);

module.exports = { signUpModel, productModel };


