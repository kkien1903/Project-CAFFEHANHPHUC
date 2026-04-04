let roleModel = require("../schemas/roles");

module.exports = {
    GetAllRoles: async function () {
        return await roleModel.find({ isDeleted: false });
    },

    GetRoleById: async function (id) {
        return await roleModel.findOne({ _id: id, isDeleted: false });
    },

    CreateRole: async function (roleData) {
        let newRole = new roleModel({
            name: roleData.name,
            description: roleData.description
        });
        return await newRole.save();
    },

    UpdateRole: async function (id, roleData) {
        return await roleModel.findByIdAndUpdate(id, roleData, { new: true });
    },

    DeleteRole: async function (id) {
        return await roleModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
    }
};