const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        count: {
            type: Number,
            default: 5,
        },
        searchs: [{ type: String, default: [] }],
        task: { type: String },
    },
    { timestamps: true }
);

module.exports = {
    UserModel: mongoose.model("User", userSchema),
};
