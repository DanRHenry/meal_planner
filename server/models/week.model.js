const mongoose = require("mongoose");

const WeeklyPlanningSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    breakfast: {
        type: Object,
        required: false
    },
    lunch: {
        type: Object,
        required: false
    },
    dinner: {
        type: Object,
        required: false
    },
    snacks: {
        type: Object,
        required: false
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

module.exports = mongoose.model("WeeklyPlanning", WeeklyPlanningSchema);