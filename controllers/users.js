let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')
module.exports = {
    CreateAnUser: async function (userData, session) {
        // userData is an object with all user properties
        let newUser = new userModel({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            role: userData.role,
            avatarUrl: userData.avatarUrl,
            fullName: userData.fullName,
            status: userData.status,
            loginCount: userData.loginCount
        });
        // Use session if it's provided for transactions
        await newUser.save(session ? { session } : {});
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username: username });
        if (!getUser) {
            return false;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            return getUser;
        }
        return false;

    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role')
    },
    FindUserByEmail: async function (email) {
        return await userModel.findOne({
            email: email,
            isDeleted: false
        })
    },
    FindUserByToken: async function (token) {
        let user = await userModel.findOne({
            forgotpasswordToken: token,
            isDeleted: false
        })
        if (!user || user.forgotpasswordTokenExp < Date.now()) {
            return false
        }
        return user
    }
}