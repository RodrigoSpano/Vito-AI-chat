import * as vscode from 'vscode';
import * as fs from 'fs'
import ollama from 'ollama'
import { IChatResponse, type IMessage } from './types';


export function activate(context: vscode.ExtensionContext) {
	const ollamaModel: string = "gemma:2b"

	// customizing personallity of the chatbot
	ollama.chat({model: ollamaModel, messages: [{role: "system", content: "You are software engineer and will be helping me as a copilot, making suggestions and helping me to improve my code and implementation of best practices in it."}]}).catch((err) => console.log(`err => ${err}`))
	

	const chatHTML = (): string => fs.readFileSync(__dirname + '/views/chat.html', 'utf-8');

  const disposable = vscode.commands.registerCommand("vito-ai.open", () => {
		const panel = vscode.window.createWebviewPanel("vito-ai", "local runned AI Chat", vscode.ViewColumn.Two, { enableScripts: true})
		panel.webview.html = chatHTML();
	
		// receive message from webview
		panel.webview.onDidReceiveMessage(async (message: IMessage) => {
			if (message.command === 'prompt') {
				handleThinking(true) // send to ui that AI is thinking
				const response = await ollama.chat({
					model: ollamaModel,
					messages: [{role: "user", content: message.text }],
					stream: true,
				})

				// send streamed response to webview
				let returnMessageBody: IChatResponse = {prompt: message.text, answer: ''};
				let streamedResponse = ''

				for await (const part of response) {
					streamedResponse += part.message.content
					// panel.webview.postMessage({command: 'prompt-response', text: streamedResponse})
				}
				returnMessageBody.answer = streamedResponse;
				panel.webview.postMessage({command: 'prompt-response', body: returnMessageBody}).then(() => handleThinking(false))
			}
			
		})
		// ends on did receive message

		function handleThinking(state: boolean) {
			panel.webview.postMessage({command: 'thinking', state})
		}

	})

	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
