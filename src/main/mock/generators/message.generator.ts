import { faker } from '@faker-js/faker'
import type { MessageTable } from '../../database/types'
import type { MessageType } from '@sdk/types/models'

/**
 * Message Mock Data Generator
 */
export class MessageGenerator {
  static generate(chatId: string, count: number = 50): MessageTable[] {
    return Array.from({ length: count }, (_, index) => this.generateOne(chatId, index))
  }

  static generateOne(chatId: string, index?: number): MessageTable {
    const now = Date.now()
    const messageType = faker.helpers.arrayElement<MessageType>([
      'text',
      'text',
      'text',
      'text', // 80% text
      'image',
      'video',
      'file',
      'audio'
    ])

    return {
      id: faker.string.uuid(),
      chat_id: chatId,
      sender_id: faker.string.uuid(),
      content:
        messageType === 'text'
          ? faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }))
          : `[${messageType}] ${faker.system.fileName()}`,
      type: messageType,
      reply_to_id: faker.datatype.boolean(0.1) ? faker.string.uuid() : null,
      forwarded_from_id: faker.datatype.boolean(0.05) ? faker.string.uuid() : null,
      edited: faker.datatype.boolean(0.05),
      read: faker.datatype.boolean(0.7),
      created_at: now - (index ? index * 60000 : faker.number.int({ min: 0, max: 86400000 })),
      updated_at: now
    }
  }
}
