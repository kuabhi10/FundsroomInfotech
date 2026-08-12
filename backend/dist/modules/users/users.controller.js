"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_schema_1 = require("./users.schema");
const prisma = new client_1.PrismaClient();
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count(),
        ]);
        res.status(200).json({
            data: users,
            total,
            page,
            limit,
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const parsed = users_schema_1.createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const { name, email, password, role } = parsed.data;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        res.status(201).json({ data: newUser });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const parsed = users_schema_1.updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const { name, email, role } = parsed.data;
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({ where: { email } });
            if (emailTaken) {
                res.status(409).json({ error: 'User with this email already exists' });
                return;
            }
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.status(200).json({ data: updatedUser });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUser = updateUser;
const updateUserStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const parsed = users_schema_1.updateUserStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const { isActive } = parsed.data;
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        res.status(200).json({ data: updatedUser });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUserStatus = updateUserStatus;
