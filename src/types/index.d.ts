export type TCommands = "prompt" | "prompt-response" | 'thinking'

export interface IChatResponse {
  prompt: string
  answer: string
}

export interface IMessage {
  command: TCommands
  text: string
}
