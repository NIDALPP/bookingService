const { updateOne } = require("../utils/connectors");
const { create } = require("../utils/connectors");
const { findOne } = require("../utils/connectors");
const { find } = require("../utils/connectors")


module.exports = {
    ShowAll: async (req, res) => {
        try {
            const response = await find("Category")
            if (!response || !Array.isArray(response.data)) {
                console.error("Invalid response from find('Category'):", response);
                return res.status(500).json({ message: "Failed to fetch categories" });
            }
            const categoriesWithProducts = await Promise.all(response.data.map(async (category) => {
                const productsResponse = await find("Product", { category: category.categoryId });
                const products = (productsResponse?.data || []).map(product => ({
                    name: product.name,
                    price: product.price,
                }));

                return { categoryName: category.name, products };

            }));

            res.status(200).json({ categories: categoriesWithProducts });
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error finding categories" })

        }

    },
    showAllProduct: async (req, res) => {
        try {
            const categoryName = req.body.name

            const categoryResponse = await findOne("Category", { name: categoryName })
            if ( !categoryResponse.data) {

                return res.status(404).json({ message: `category ${categoryName} not found` });

            }
            const category = categoryResponse.data
            // console.log(category)
            const productsResponse = await find("Product", { category: category.categoryId });
            // console.log(productsResponse)
            if (!productsResponse || !Array.isArray(productsResponse.data)) {
                return res.status(500).json({ message: "failed to fetch the products" })
            }
            const products = productsResponse.data.map(product => ({
                name: product.name,
                price: product.price,
            }))
            res.status(200).json({
                categoryName: category.name, products
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error finding products" })

        }

    },

    addToCart: async (req, res) => {
        try {
            const { userId, productId, quantity } = req.body;

            if (!userId || !productId || !quantity) {
                return res.status(400).json({ message: "User ID, Product ID, and quantity are required." });
            }
            const [productResponse, userResponse] = await Promise.all([findOne("Product", { productId: productId }), findOne("User", { userId })]);
            const product = productResponse?.data;
            const user = userResponse?.data;
            // console.log(product);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!product) {
                return res.status(404).json({ message: "Product not found." });
            }
            if (product.stock < quantity) {
                return res.status(400).json({ message: "Not enough stock for the product." });
            }

            let cartResponse = await findOne("Cart", { userId });
            let cart = cartResponse?.data;

            if (!cart) {
                const newCartResponse = await create("Cart", { userId, items: [] });
                cart = newCartResponse?.data;
            }

            const existingItem = cart.items.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += parseInt(quantity, 10);
            } else {
                cart.items.push({ productId, quantity: quantity, price: product.price });
            }

            if (product) {
                product.stock -= quantity;
                await updateOne("Product", { productId: product.productId }, { stock: product.stock });
            }

            const updateResponse = await updateOne("Cart", { userId }, { items: cart.items });
            if (!updateResponse) {
                return res.status(500).json({ message: "Failed to update cart." });
            }
            const cartData = await findOne("Cart", { userId })
            const cartItems = { cartId: cartData.data.cartId, userId: cartData.data.userId, items: cartData.data.items }
            // res.status(200).json({ message: "Product added to cart successfully.", cart: updateResponse.data ,cartRes:cartRes.data});
            res.status(200).json({ message: "Product added to cart successfully.", cartItems });

        } catch (error) {
            console.error("Error in addToCart:", error.message || error);
            res.status(500).json({ message: "An error occurred while adding to cart." });
        }
    },
        placeOrder: async (req, res) => {
            try {
                const { userId } = req.body;

                if (!userId) {
                    return res.status(400).json({ message: "User ID is required." });
                }
                const userResponse = await findOne("User", { userId });
                const user = userResponse?.data;
                if (!user) {
                    return res.status(404).json({ message: "User not found." });
                }
                const cartResponse = await findOne("Cart", { userId });
                const cart = cartResponse?.data;
                if (!cart || cart.items.length === 0) {
                    return res.status(400).json({ message: "Cart is empty. Add items to your cart before placing an order." });
                }
                console.log(cart)
                let totalAmount = 0;
                for (const item of cart.items) {
                    const productResponse = await findOne("Product", { productId: item.productId });
                    const product = productResponse?.data;

                    totalAmount += item.quantity * product.price;
                }
                const orderResponse = await create("order", {
                    userId,
                    items: cart.items,
                    totalAmount,
                    status: "Placed",
                    // createdAt: new Date()
                });
                const order=orderResponse?.data
                console.log(order)
                if (!orderResponse) {
                    return res.status(500).json({ message: "Failed to create the order." });
                }

                await updateOne("Cart", { userId }, { items: [] });
                res.status(200).json({ message: "Order placed successfully.", order });
            } catch (error) {
                console.error("Error in placeOrder:", error.message || error);
                res.status(500).json({ message: "An error occurred while placing the order." });
            }
        }

    }



