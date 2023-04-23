var jwt = require('jsonwebtoken');
var { signUpModel } = require('../Models/dataSchema');



const auth = async function (req, res, next) {


    try {
        
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
        const user = await signUpModel.findById({ _id: verifyUser._id });
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        
       res.send({status:false});
    }

}

module.exports = auth;