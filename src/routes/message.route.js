import express from "express";
import { autentication } from "../middleware/auth.middleware.js";
import { getMessages, getUserForSideBar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",autentication,getUserForSideBar);
router.get("/:id",autentication,getMessages);
router.post("/send/:id",autentication,sendMessage)


export default router;