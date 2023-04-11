import { json } from "@sveltejs/kit"
import { CallbackManager } from "langchain/callbacks"
import { ZapierToolKit, LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } from "langchain/agents"
import { LLMChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models"
import { BasePromptTemplate, SerializedBasePromptTemplate, renderTemplate, BaseChatPromptTemplate } from "langchain/prompts"
import { SerpAPI, Calculator, Tool } from "langchain/tools"
import { initializeAgentExecutor } from "langchain/agents"
import { BufferMemory } from "langchain/memory"
import { RequestsGetTool, RequestsPostTool, AIPluginTool } from "langchain/tools"

export async function POST() {
	return new Response("Hello world")
}
