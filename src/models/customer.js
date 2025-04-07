const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
   image: {
        type: String,
        required: true,
    },
    category : {
        type: String,
        required: true,
    },
    new_price : {
        type: Number,
        required: true,
    },
    old_price : {
        type: Number,
        required: true,
      
    },
    date: {
        type: Date ,
        default: Date.now

    },
    available:{
        type: Boolean ,
        default: true,
    }
});

//Schema Creating for User Model
const userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    cartData: {
        type: Map,
        of: Number,
        default: {}
    }
    

})


const User = mongoose.model("User",userSchema)
const Product = mongoose.model("Product", productSchema); // Ensure model is registered

module.exports = {Product,User}; 
