const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const suggestTasks = async (req, res) => {
  try {
    const { projectName, projectDescription } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a project management expert. Given this project:
Name: ${projectName}
Description: ${projectDescription || "No description"}

Suggest exactly 6 practical tasks for this project. Return ONLY a JSON array like this:
[
  {"title": "Task name", "priority": "HIGH", "description": "Brief description"},
  ...
]
Only return the JSON array, nothing else.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });
    const content = completion.choices[0]?.message?.content;
    const tasks = JSON.parse(content);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ success: false, message: "AI suggestion failed" });
  }
};

const insightHandler = async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    const insight = completion.choices[0]?.message?.content;
    res.json({ insight });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ insight: "Keep pushing! Focus on your high-priority tasks first." });
  }
};

const autoScheduleHandler = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ message: "No tasks provided" });
    }
    const taskList = tasks.map((t, i) =>
      `${i + 1}. "${t.title}" — Priority: ${t.priority} — Due: ${t.dueDate ? new Date(t.dueDate).toDateString() : 'No deadline'}`
    ).join('\n')

    const today = new Date().toDateString()
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a productivity scheduler. Today is ${today}.

Here are the pending tasks:
${taskList}

Create a daily schedule for the next 5 days. Distribute tasks smartly based on priority and deadlines.
Return ONLY a JSON array like this:
[
  {
    "day": "Monday, May 4",
    "tasks": [
      {"title": "Task name", "priority": "HIGH", "time": "Morning"},
      {"title": "Task name", "priority": "MEDIUM", "time": "Afternoon"}
    ]
  }
]
Only return the JSON array, nothing else.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });
    const content = completion.choices[0]?.message?.content;
    const clean = content.replace(/```json|```/g, '').trim()
    const schedule = JSON.parse(clean);
    res.json({ schedule });
  } catch (error) {
    console.error("Auto schedule error:", error);
    res.status(500).json({ message: "Schedule generation failed" });
  }
};

module.exports = { suggestTasks, insightHandler, autoScheduleHandler };