import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { autentication } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/sign-up',signup);

router.post('/login',login);

router.post('/logout',logout);

router.put('/update-profile',autentication,updateProfile);

router.get('/check',autentication,checkAuth);

export default router;