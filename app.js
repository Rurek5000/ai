import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const readArticle = async (filePath) => fs.readFile(filePath, "utf-8");

const processArticleWithOpenAI = async (prompt, articleText) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful html generator assistant.",
        },
        { role: "user", content: `${prompt}\n\n${articleText}` },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    console.error("Error:", response.status, response.statusText);
    return;
  }

  const data = await response.json();
  console.log("API Response:", data);
  return data.choices[0].message.content.trim();
};

const saveHtmlToFile = async (htmlContent, filePath) =>
  fs.writeFile(filePath, htmlContent, "utf-8");

const main = async () => {
  const inputFile = "article.txt";
  const outputFile = "artykul.html";
  const prompt = `
    Prepare HTML code for the following article.
    - Use appropriate tags for structure (e.g., headers, paragraphs, lists).
    - Add <img> tags with src="image_placeholder.jpg" where images are relevant.
    - Each image should have an alt attribute with a description.
    - Add captions under images using <figcaption> tags.
    - Only return the content that goes inside the <body> tags.

    Remember to keep the content accessible and semantically correct.
    Please generate the HTML code without wrapping it in code blocks (e.g., no \`\`\`html at the beginning or \`\`\` at the end).
  `;
  const articleText = await readArticle(inputFile);
  const htmlContent = await processArticleWithOpenAI(prompt, articleText);
  await saveHtmlToFile(htmlContent, outputFile);
};

main().catch((error) => console.error(error));
