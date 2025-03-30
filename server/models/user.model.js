const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    family: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model("User", UserSchema);