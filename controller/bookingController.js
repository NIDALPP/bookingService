const category = require("../../ecom_DB/models/category.models");
const { findOne } = require("../utils/connectors");
const { find } = require("../utils/connectors")


module.exports={
    ShowAll:async(req,res)=>{
        try {
            const response=await find("Category")
            if (!response || !Array.isArray(response.data)) {
                console.error("Invalid response from find('Category'):", response);
                return res.status(500).json({ message: "Failed to fetch categories" });
            }
            const categoriesWithProducts = await Promise.all(response.data.map(async (category) => {
                const productsResponse = await find("Product", { category: category._id });
                const products = (productsResponse?.data || []).map(product => ({
                    name: product.name,
                    price: product.price,
                }));
                
                // return { ...category, products};
                return { categoryName:category.name, products};

            }));

            res.status(200).json({ categories: categoriesWithProducts });
        } catch (error) {
            console.error(error)
            res.status(500).json({message:"Error finding categories"})

        }

    },
    showAllProduct:async(req,res)=>{
        try {
            const categoryName =req.body.data.name
            
            const categoryResponse=await findOne("Category",{name:categoryName})
            if (!categoryResponse || !categoryResponse.data) {
                
                return res.status(404).json({ message: `category ${categoryName} not found`});
                
                }
                const category =categoryResponse.data
                const productsResponse = await find("Product", { category: category._id });

                if(!productsResponse || !Array.isArray(productsResponse.data)){
                    return res.status(500).json({message:"failed to fetch the products"})
                }
                const products = productsResponse.data.map(product => ({
                    name: product.name,
                    price: product.price,
                    availability:product.availability
                }))
                res.status(200).json({
                    categoryName:category.name,products
                })
        } catch (error) {
            console.error(error)
            res.status(500).json({message:"Error finding products"})
            
        }
        
}
}

