import { Router } from "express";
import UserController from "../controllers/users.controller.js";

const router = Router();

router.post('/users/signup',  UserController.signUp);
router.post('users/login', UserController.logIn);
router.post('/users/logout', UserController.logOut);
router.get('/users/me', UserController.currentUser);

export default router;