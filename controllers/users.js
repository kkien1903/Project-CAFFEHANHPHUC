let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')
module.exports = {
    CreateAnUser: async function (userData) {
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
        await newUser.save();
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        // Also check if the user is soft-deleted
        let getUser = await userModel.findOne({ username: username, isDeleted: false });
        if (!getUser) {
            return false;
        }
        // Use async compare to avoid blocking the event loop
        const isMatch = await bcrypt.compare(password, getUser.password);
        if (isMatch) {
            return getUser;
        }
        return false;

    },
    FindUserById: async function (id) {
        // Use populate to automatically fetch the role details.
        // This is more efficient than doing it manually.
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role');
    },
    FindUserByEmail: async function (email) {
        return await userModel.findOne({
            email: email,
            isDeleted: false
        })
    },
    FindUserByToken: async function (token) {
        let user = await userModel.findOne({
            forgotPasswordToken: token,
            isDeleted: false
        })
        if (!user || user.forgotPasswordTokenExp < Date.now()) {
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