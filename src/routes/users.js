// const express = require("express");
// const app = express(); 
// const router = express.Router();
// const {Product} = require("../models/customer"); 
// const  {User} = require("../models/customer");
// const fetchUser = require("../middleware/middleware")
// const bcrypt = require('bcrypt');
// const jwt = require("jsonwebtoken")
//  // This ensures /api/login maps to /api/login
  
// // Creating Product
// router.post("/addproduct", async (req, res) => {
//     let products = await Product.find({});
//     let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

//     const product = new Product({
//         id: id,
//         name: req.body.name,
//         image: req.body.image,
//         category: req.body.category,
//         new_price: req.body.new_price,
//         old_price: req.body.old_price,
//     });

//     console.log(product);
//     await product.save();
//     console.log("Saved");
//     res.json({
//         success: 1,
//         name: req.body.name,
//     });
// });

// // Removing Product
// router.delete("/removeproduct", async (req, res) => {
//     await Product.findOneAndDelete({ id: req.body.id });
//     console.log("Removed");
//     res.json({
//         success: true,
//         name: req.body.name,
//     });
// });

// // Get All Products Route
// router.get("/allproducts", async (req, res) => {
//     try {
//         let products = await Product.find({});
//         console.log("All Products Fetched");
//         res.send(products);
//     } catch (error) {
//         res.status(500).send("Error fetching products");
//     }
// });
// // Creating EndPoint for registering user
// router.post("/signup", async (req, res) => {
//     try {
//         console.log(User); // Debugging line

//         let check = await User.findOne({ email: req.body.email });
//         if (check) {
//             return res.status(400).json({ success: false, errors: "Existing user with email Id" });
//         }

//         let cart = {};
//         for (let i = 0; i < 300; i++) {
//             cart[i] = 0;
//         }

//         const user = new User({
//             name: req.body.username,
//             email: req.body.email,
//             password: req.body.password,
//             cartData: cart
//         });

//         await user.save();

//         const data = { user: { id: user.id } };
//         const token = jwt.sign(data, 'secret_ecom');

//         res.json({ success: true, token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, errors: "Server Error" });
//     }
// });


// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
    
//     // Validate if email and password are provided
//     if (!email || !password) {
//         return res.status(400).json({ success: false, error: "Email and password are required." });
//     }

//     try {
//         // Find the user by email
//         let user = await User.findOne({ email: email });
//         console.log("Request URL:", req.url);

//         if (user) {
//             // Compare the hashed password
//             const passCompare = await bcrypt.compare(password, user.password);

//             if (passCompare) {
//                 // User authenticated successfully, generate JWT token
//                 const data = {
//                     user: {
//                         id: user.id
//                     }
//                 };
//                 const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' });  // Added expiration

//                 // Fetch cartData after successful login
//                 const cartData = user.cartData;

//                 return res.json({ success: true, token, cartData });
//             } else {
//                 return res.status(400).json({ success: false, error: "Wrong Password" });
//             }
//         } else {
//             return res.status(400).json({ success: false, error: "Wrong Email Id" });
//         }
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ success: false, error: "Server Error" });
//     }
// });

// // creating endpoint for newcollection data
// router.get('/newcollections', async (req, res) => {
//     try {
//       let products = await Product.find({});
//       let newcollection = products.slice(1).slice(-8);
//       console.log("NewCollection Fetched");
//       res.send(newcollection);
//     } catch (error) {
//       console.error("Error fetching new collection:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });
//   router.post('/addtocart', fetchUser, async (req, res) => {
//     try {
//         const userData = await User.findById(req.user.id);
//         const product = await Product.findById(req.body.itemId);

//         if (!product) {
//             return res.status(404).json({ success: false, message: "Product not found" });
//         }

//         // Make sure itemId is a valid string
//         const itemId = req.body.itemId?.toString();

//         if (!itemId) {
//             return res.status(400).json({ success: false, message: "Invalid product ID" });
//         }

//         if (!userData.cartData) {
//             userData.cartData = {};
//         }

//         if (userData.cartData[itemId]) {
//             userData.cartData[itemId] += 1;
//         } else {
//             userData.cartData[itemId] = 1;
//         }

//         await userData.save();

//         res.json({
//             success: true,
//             message: "Product added to cart successfully",
//             cartData: userData.cartData
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });


// // Creating endpoint to remove product from cart
// router.delete('/removefromcart', fetchUser, async (req, res) => {
//     console.log("removed", req.body.itemId);
//     let userData = await User.findOne({_id: req.user.id});
//     if (userData.cartData[req.body.itemId] > 0) {
//         userData.cartData[req.body.itemId] -= 1;
//         await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
//     }
//     res.send("Removed");
// });

   

  
// module.exports = router;



// Import dependencies
const express = require("express");
const router = express.Router();
const { Product, User } = require("../models/customer");
const fetchUser = require("../middleware/middleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ======================== PRODUCTS ======================== //

// Add a new product
router.post("/addproduct", async (req, res) => {
    try {
        const products = await Product.find({});
        const id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

        const product = new Product({
            id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        console.log("Product saved:", product);

        res.json({ success: true, name: req.body.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Delete a product by ID
router.delete("/removeproduct", async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        console.log("Product removed with ID:", req.body.id);

        res.json({ success: true, name: req.body.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get all products
router.get("/allproducts", async (req, res) => {
    try {
        const products = await Product.find({});
        console.log("Fetched all products");
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get latest 8 products for new collection
router.get("/newcollections", async (req, res) => {
    try {
        const products = await Product.find({});
        const newCollection = products.slice(1).slice(-8);

        console.log("Fetched new collection");
        res.json(newCollection);
    } catch (error) {
        console.error("Error fetching new collection:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ======================== USER AUTH ======================== //

// Register new user
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, errors: "User already exists" });
        }

        const cart = {};
        for (let i = 0; i < 300; i++) cart[i] = 0;

        const user = new User({ name: username, email, password, cartData: cart });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, "secret_ecom");

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errors: "Server Error" });
    }
});

// Login user
router.post("/login", async (req, res) => {
    console.log("BODY:", req.body); // See what you're getting in deployed
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ success: false, error: "Email and password are required." });

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ success: false, error: "Wrong Email Id" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            return res.status(400).json({ success: false, error: "Wrong Password" });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, "secret_ecom", { expiresIn: "1h" });

        res.json({ success: true, token, cartData: user.cartData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// ======================== CART ======================== //
router.post("/addtocart", fetchUser, async (req, res) => {
    try {
        const userData = await User.findById(req.user.id);
        const itemId = req.body.itemId?.toString();

        if (!itemId)
            return res.status(400).json({ success: false, message: "Invalid product ID" });

        // Fixed line: use your custom product ID
        const product = await Product.findOne({ id: Number(itemId) });
        if (!product)
            return res.status(404).json({ success: false, message: "Product not found" });

        if (!userData.cartData) userData.cartData = {};

        userData.cartData[itemId] = (userData.cartData[itemId] || 0) + 1;

        await userData.save();

        res.json({
            success: true,
            message: "Product added to cart successfully",
            cartData: userData.cartData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// Remove from cart
router.delete("/removefromcart", fetchUser, async (req, res) => {
    try {
        const itemId = req.body.itemId?.toString();
        const userData = await User.findById(req.user.id);

        if (userData.cartData[itemId] > 0) {
            userData.cartData[itemId] -= 1;
            await User.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
        }

        res.send("Removed");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
