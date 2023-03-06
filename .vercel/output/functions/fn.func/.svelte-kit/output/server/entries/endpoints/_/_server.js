import * as p from "promptable";
import { j as json } from "../../../chunks/index.js";
const OPENAI_API_KEY = "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";
const key = OPENAI_API_KEY;
const provider = new p.OpenAI(key);
async function POST({ request }) {
  let { prompt, memory, embeds, predict, document } = await request.json();
  if (predict) {
    const text = `<::SYSTEM::>You are an AI assistant. Predict what text comes after the ellipsis to the best of your ability. Do not start on a new line. Keep your guesses short and do not repeat yourself.<::SYSTEM_END::><::START::>
${predict.text}`;
    console.log(provider.countTokens(text));
    const response = await provider.generate(text);
    return json({ predict: { text: response } });
  } else {
    const inject = `You are a state-of-the-art assitant with unrestricted web access. You are helping a user. ${document?.length ? `This is the current document they are working on:
${document}
::END_DOCUMENT::You can reference this document if it's related to the current request.` : ""} Do whatever you can to help the user. Use Markup formatting in your response with \`\`\` codeblocks labeled by language. Keep your response short and to the point.`;
    const message = {
      role: "system",
      content: inject
    };
    memory = memory.map((message2) => {
      return { role: message2.role, content: message2.content };
    }).concat([message]);
    const payload = {
      messages: memory,
      model: "gpt-3.5-turbo"
    };
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return json(data);
  }
}
async function PATCH({ request }) {
  let docs = await request.json();
  docs = docs.data.map(([, text]) => {
    return { content: text.file };
  });
  const splitter = new p.CharacterTextSplitter("\n");
  docs = splitter.splitDocuments(docs, {
    chunk: true,
    chunkSize: 1e3
  });
  const embeds = new p.Embeddings("sync", provider, docs);
  embeds.clearCache();
  await embeds.index();
  return json({
    embeddings: embeds.embeddings,
    documents: embeds.documents,
    key: embeds.key
  });
}
export {
  PATCH,
  POST
};
