"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// All user management routes require ADMIN role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('ADMIN'));
router.get('/', users_controller_1.getUsers);
router.post('/', users_controller_1.createUser);
router.put('/:id', users_controller_1.updateUser);
router.patch('/:id/status', users_controller_1.updateUserStatus);
exports.default = router;
