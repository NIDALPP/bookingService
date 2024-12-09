const axios = require("axios");
require('dotenv').config();
const dbUrl = process.env.DB_URL;

module.exports = {
    find: async (model, filter = {}) => {
        try {
            const result = await axios.post(dbUrl + '/findAll', { model: model, filter: filter });
            return result?.data || null;
        } catch (error) {
            console.error("Error in find:", error.message || error);
            throw new Error("Unable to retrieve data");
        }
    },

    findOne: async (model, filter) => {
        try {
            const result = await axios.post(dbUrl + '/findOne', { model: model, filter: filter });
            return result?.data || null;
        } catch (error) {
            console.error("Error in findOne:", error.message || error);
            throw new Error("Unable to retrieve data");
        }
    },

    create: async (model, data) => {
        try {
            const result = await axios.post(dbUrl + '/create', { model: model, data: data });
            return result?.data || null;
        } catch (error) {
            console.error("Error while creating:", error.message || error);
            throw new Error("Unable to create record");
        }
    },

    deleteOne: async (model, filter) => {
        try {
            const result = await axios.post(dbUrl + '/deleteOne', { model: model, filter: filter })
            return result?.data || null;
        } catch (error) {
            console.error("Error in deleteOne:", error.message || error);
            throw new Error("Unable to delete record");

        }
    },
    updateOne: async (model, filter, data) => {
        try {
            const responseResult = await axios.post(dbUrl + '/updateOne', {
                model: model, filter: filter, data: data
            });
            return responseResult?.data || null;
        } catch (error) {
            console.error("Error in updateOne:", error.message || error);
            throw new Error("Unable to update record");
        }
    }
}