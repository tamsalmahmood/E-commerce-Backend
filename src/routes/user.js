const express = require("express");
const app = express(); 
const router = express.Router();
const {Product} = require("../models/customer"); 
const  {User} = require("../models/customer");
const fetchUser = require("../middleware/middleware")

const jwt = require("jsonwebtoken")



// app.post('/addproduct', async (req, res) => {
//     try {
//         const product = new Product({
//             id: req.body.id,
//             name: req.body.name,
//             image: req.body.image,
//             category: req.body.category,
//             new_price: req.body.new_price,
//             old_price: req.body.old_price,
//         });

//         console.log(product); // Debugging ke liye console pe output

//         await product.save(); // MongoDB me save karne ke liye

//         res.status(201).json({ message: "Product added successfully", product });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to add product", details: error.message });
//     }
// });

  

// Creating Product
router.post("/addproduct", async (req, res) => {
    let products = await Product.find({});
    let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });

    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: 1,
        name: req.body.name,
    });
});

// Removing Product
router.delete("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    });
});

// Get All Products Route
router.get("/allproducts", async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All Products Fetched");
        res.send(products);
    } catch (error) {
        res.status(500).send("Error fetching products");
    }
});
// Creating EndPoint for registering user
router.post("/signup", async (req, res) => {
    try {
        console.log(User); // Debugging line

        let check = await User.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, errors: "Existing user with email Id" });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new User({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart
        });

        await user.save();

        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom');

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errors: "Server Error" });
    }
});


router.post('/login', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, 'secret_ecom');

            // Fetch cartData after successful login
            const cartData = user.cartData;

            res.json({ success: true, token, cartData });
        }
        else {
            res.json({success: false, error: "Wrong Password"});
        }
    }
    else {
        res.json({success: false, error: "Wrong Email Id"});
    }
});

// creating endpoint for newcollection data
router.get('/newcollections', async (req, res) => {
    try {
      let products = await Product.find({});
      let newcollection = products.slice(1).slice(-8);
      console.log("NewCollection Fetched");
      res.send(newcollection);
    } catch (error) {
      console.error("Error fetching new collection:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  router.post('/addtocart', fetchUser, async (req, res) => {
    try {
        const userData = await User.findById(req.user.id);
        const product = await Product.findById(req.body.itemId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Make sure itemId is a valid string
        const itemId = req.body.itemId?.toString();

        if (!itemId) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (!userData.cartData) {
            userData.cartData = {};
        }

        if (userData.cartData[itemId]) {
            userData.cartData[itemId] += 1;
        } else {
            userData.cartData[itemId] = 1;
        }

        await userData.save();

        res.json({
            success: true,
            message: "Product added to cart successfully",
            cartData: userData.cartData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// Creating endpoint to remove product from cart
router.delete('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await User.findOne({_id: req.user.id});
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    }
    res.send("Removed");
});

   

  
module.exports = router;
