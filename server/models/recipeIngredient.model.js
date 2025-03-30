const mongoose = require("mongoose");

const RecipeIngredientSchema = new mongoose.Schema({
    recipeIngredientName: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    whole: {
        type: Boolean,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    family: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("RecipeIngredient", RecipeIngredientSchema);