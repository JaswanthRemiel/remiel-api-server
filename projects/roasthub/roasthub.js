import fetch from "node-fetch";

export const generateRoast = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username is required" });

    const gitUserINFO = await fetch(`https://api.github.com/users/${username}`);

    if (!gitUserINFO.ok) throw new Error("GitHub user not found");

    const profile = await gitUserINFO.json();
    const profileDetails = Object.entries(profile)
      .map(([key, value]) => `${key}: ${value ?? "N/A"}`)
      .join("\n");

    const prompt = `Roast this GitHub user. Only return the roast — no intros, no quotes, no disclaimers. ${profileDetails} Be direct, be mean. Just return the roast in plain text.`;

    const roastRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await roastRes.json();
    const roastText = data.choices?.[0]?.message?.content;

    res.status(200).json({ roast: roastText });
  } catch (err) {
    console.error("Error generating roast:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};
