const express = require("express");
const router = express.Router();
const { suggestTasks, insightHandler, autoScheduleHandler } = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/auto-schedule", authenticate, autoScheduleHandler);
router.post("/suggest-tasks", authenticate, suggestTasks);
router.post("/insight", authenticate, insightHandler);
module.exports = router;