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
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const insight = completion.choices[0]?.message?.content;
    res.json({ insight });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ insight: "Keep pushing! Focus on your high-priority tasks first." });
  }
};

module.exports = { suggestTasks, insightHandler, autoScheduleHandler };