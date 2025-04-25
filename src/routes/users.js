
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
    console.log("Received body:", req.body); // 👈 Add this for debugging

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


router.post("/signup", async (req, res) => {
    console.log("Request Body:", req.body);

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, errors: "User already exists" });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const cart = {};
        for (let i = 0; i < 300; i++) cart[i] = 0;

        const user = new User({ name, email, password: hashedPassword, cartData: cart });
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
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ success: false, error: "Email and password are required." });

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ success: false, error: "Wrong Email Id" });

        // Compare the entered password with the hashed password
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
