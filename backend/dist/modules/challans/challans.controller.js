"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelChallan = exports.confirmChallan = exports.updateChallan = exports.getChallanById = exports.getChallans = exports.createChallan = void 0;
const challansService = __importStar(require("./challans.service"));
const createChallan = async (req, res, next) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { customerId, status, items } = req.body;
        const challan = await challansService.createChallan(customerId, status, items, userId);
        res.status(201).json({ data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.createChallan = createChallan;
const getChallans = async (req, res, next) => {
    try {
        const result = await challansService.getChallans(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getChallans = getChallans;
const getChallanById = async (req, res, next) => {
    try {
        const challan = await challansService.getChallanById(req.params.id);
        res.status(200).json({ data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallanById = getChallanById;
const updateChallan = async (req, res, next) => {
    try {
        const challan = await challansService.updateChallan(req.params.id, req.body);
        res.status(200).json({ data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.updateChallan = updateChallan;
const confirmChallan = async (req, res, next) => {
    try {
        const userId = req.user.userId || req.user.id;
        const challan = await challansService.confirmChallan(req.params.id, userId);
        res.status(200).json({ data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmChallan = confirmChallan;
const cancelChallan = async (req, res, next) => {
    try {
        const userId = req.user.userId || req.user.id;
        const challan = await challansService.cancelChallan(req.params.id, userId);
        res.status(200).json({ data: challan });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelChallan = cancelChallan;
