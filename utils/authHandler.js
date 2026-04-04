const jwt = require('jsonwebtoken');
const userController = require('../controllers/users');

const checkLogin = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send({ message: "Vui lòng đăng nhập." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).send({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};

const checkRole = (...roles) => {
    return async (req, res, next) => {
        try {
            // This middleware should run after checkLogin, so req.userId should exist
            if (!req.userId) {
                return res.status(401).send({ message: "Vui lòng đăng nhập." });
            }

            const user = await userController.FindUserById(req.userId);
            // If user or their role is not found (e.g., role was deleted), deny access.
            if (!user.role) {
                return res.status(403).send({ message: "Không tìm thấy thông tin người dùng hoặc vai trò." });
            }

            const userRole = user.role.name.toUpperCase();
            req.userRole = userRole; // Attach userRole to request for convenience

            if (roles.map(role => role.toUpperCase()).includes(userRole)) {
                next();
            } else {
                return res.status(403).send({ message: "Bạn không có quyền thực hiện hành động này." });
            }
        } catch (error) {
            return res.status(500).send({ message: "Lỗi khi kiểm tra vai trò người dùng." });
        }
    };
};

module.exports = { checkLogin, checkRole };