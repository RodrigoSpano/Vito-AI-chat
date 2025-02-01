export type TCommands = "prompt" | "prompt-response"

export interface IMessage {
  command: TCommands
  text: string
}