const mongoose = require("mongoose");
let bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true
        },

        password: {
            type: String,
            required: [true, "Password is required"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
        },

        fullName: {
            type: String,
            default: ""
        },

        avatarUrl: {
            type: String,
            default: "https://i.sstatic.net/l60Hf.png"
        },

        status: {
            type: Boolean,
            default: false
        },

        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "role",
            required: true
        },

        loginCount: {
            type: Number,
            default: 0,
            min: [0, "Login count cannot be negative"]
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        forgotpasswordToken: String,
        forgotpasswordTokenExp: Date
    },
    {
        timestamps: true
    }
);

userSchema.index({
    username: 1,
    email: 1
})

userSchema.pre('save', async function () {
    // Chỉ mã hóa mật khẩu nếu nó được thay đổi (hoặc là người dùng mới)
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(
        this.password, salt
    );
})

module.exports = mongoose.model("user", userSchema);