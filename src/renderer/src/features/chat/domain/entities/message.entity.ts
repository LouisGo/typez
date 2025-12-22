import type { MessageTable, MessageType } from '@shared/types/database'

/**
 * Message Domain Entity
 */
export class Message {
  constructor(
    public readonly id: string,
    public chatId: string,
    public senderId: string,
    public content: string,
    public type: MessageType,
    public replyToId: string | null,
    public forwardedFromId: string | null,
    public edited: boolean,
    public read: boolean,
    public createdAt: number,
    public updatedAt: number
  ) {}

  static fromTable(row: MessageTable): Message {
    return new Message(
      row.id,
      row.chat_id,
      row.sender_id,
      row.content,
      row.type,
      row.reply_to_id,
      row.forwarded_from_id,
      row.edited,
      row.read,
      row.created_at,
      row.updated_at
    )
  }

  isTextMessage(): boolean {
    return this.type === 'text'
  }

  isMediaMessage(): boolean {
    return ['image', 'video', 'audio', 'file'].includes(this.type)
  }

  getFormattedTime(): string {
    const date = new Date(this.createdAt)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
}
