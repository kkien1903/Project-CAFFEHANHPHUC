let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')
module.exports = {
    CreateAnUser: async function (userData, session) {
        const { username, password, email, role, avatarUrl, fullName, status, loginCount } = userData;
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl,
            fullName,
            status,
            loginCount
        })
        await newUser.save({session});
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
    },
    GetAllUsers: async function () {
        return await userModel
            .find({ isDeleted: false })
            .populate({
                'path': 'role',
                'select': "name"
            });
    },
    UpdateUser: async function (id, updateData) {
        const user = await userModel.findById(id);
        if (!user || user.isDeleted) {
            return null;
        }
        Object.assign(user, updateData);
        await user.save();
        return user;
    },
    DeleteUser: async function (id) {
        return await userModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
}