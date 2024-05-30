import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({ msg: "Hello there 🔮" });
})

export default router;