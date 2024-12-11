const { updateOne } = require("../utils/connectors.js");
const { create } = require("../utils/connectors.js");
const { findOne } = require("../utils/connectors.js");
const { find } = require("../utils/connectors.js")
const xlsx = require('xlsx')
const fs = require('fs');

module.exports = {
    addToCart: async (req, res) => {
        try {
            const { productId, quantity } = req.body;

            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ message: "User not authenticated." });
            }

            if (!productId || !quantity) {
                return res.status(400).json({ message: "Product ID and quantity are required." });
            }

            const [productResponse, userResponse] = await Promise.all([
                findOne("Product", { productId }),
                findOne("User", { userId }),
            ]);

            const product = productResponse?.data;
            const user = userResponse?.data;

            if (!user) {
                return res.status(404).json({ message: "User not found." });
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

            product.stock -= quantity;
            await updateOne("Product", { productId }, { stock: product.stock });

            const updateResponse = await updateOne("Cart", { userId }, { items: cart.items });
            if (!updateResponse) {
                return res.status(500).json({ message: "Failed to update cart." });
            }

            const cartData = await findOne("Cart", { userId });
            const cartItems = {
                cartId: cartData.data.cartId,
                userId: cartData.data.userId,
                items: cartData.data.items,
            };

            res.status(200).json({ message: "Product added to cart successfully.", cartItems });
        } catch (error) {
            console.error("Error in addToCart:", error.message || error);
            res.status(500).json({ message: "An error occurred while adding to cart." });
        }
    },
    placeOrder: async (req, res) => {
        try {
            const { address } = req.body
            const userId = req.userId;
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
            // console.log(cart.items)
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
                address: address
            });
            const order = orderResponse?.data
            console.log(order);
            try {
                var orderDetails = cart.items.map(item => ({
                    ProductID: item.productId,
                    Quantity: item.quantity,
                }));
                orderDetails.unshift({ userId: userId, orderId: order.orderId, })
                orderDetails.push({ TotalAmount: totalAmount });
            } catch (error) {
                console.error("error creating file", error);
            }
            console.log(orderDetails)
            fs.appendFile(`orderLOg/${userId}order.txt`, JSON.stringify(orderResponse), function (err) {
                if (err) throw err;
                console.log('Saved')
            })
            const sheet = xlsx.utils.json_to_sheet(orderDetails)
            const workbook = xlsx.utils.book_new()
            xlsx.utils.book_append_sheet(workbook, sheet)

            xlsx.writeFile(workbook, `orderLog/${userId}orders.xlsx`)

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



