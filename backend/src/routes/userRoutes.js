import { Router } from "express";
import { addUser, editUser, getUsers, removeUser } from "../controllers/userController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();
router.use(requireAdmin);
router.get("/", getUsers);
router.post("/", addUser);
router.patch("/:id", editUser);
router.delete("/:id", removeUser);

export default router;
