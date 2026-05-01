const express = require("express");
const router = express.Router();
const { suggestTasks } = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/suggest-tasks", authenticate, suggestTasks);

module.exports = router;