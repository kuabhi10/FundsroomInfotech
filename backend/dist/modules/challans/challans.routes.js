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
const express_1 = require("express");
const challansController = __importStar(require("./challans.controller"));
const challans_schema_1 = require("./challans.schema");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)('ADMIN', 'SALES', 'WAREHOUSE'), (0, validate_1.validateRequest)(challans_schema_1.createChallanSchema), challansController.createChallan);
router.get('/', (0, auth_1.authorize)('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), challansController.getChallans);
router.get('/:id', (0, auth_1.authorize)('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), challansController.getChallanById);
router.put('/:id', (0, auth_1.authorize)('ADMIN', 'SALES', 'WAREHOUSE'), (0, validate_1.validateRequest)(challans_schema_1.updateChallanSchema), challansController.updateChallan);
router.patch('/:id/confirm', (0, auth_1.authorize)('ADMIN', 'SALES', 'WAREHOUSE'), challansController.confirmChallan);
router.patch('/:id/cancel', (0, auth_1.authorize)('ADMIN', 'SALES', 'WAREHOUSE'), challansController.cancelChallan);
exports.default = router;
