import { faker } from '@faker-js/faker'
import type { ChatTable } from '../../database/types'
import type { ChatType } from '@sdk/contract/models'

/**
 * Chat Mock Data Generator
 */
export class ChatGenerator {
  static generate(count: number = 20): ChatTable[] {
    return Array.from({ length: count }, () => this.generateOne())
  }

  static generateOne(type?: ChatType): ChatTable {
    const now = Date.now()
    const chatType = type || faker.helpers.arrayElement<ChatType>(['private', 'group', 'channel'])

    return {
      id: faker.string.uuid(),
      type: chatType,
      title: chatType === 'private' ? null : faker.lorem.words(2),
      avatar_url: chatType === 'private' ? null : faker.image.avatar(),
      description: chatType === 'channel' ? faker.lorem.sentence() : null,
      member_count: chatType === 'private' ? 2 : faker.number.int({ min: 3, max: 100 }),
      last_message_id: faker.string.uuid(),
      last_message_at: now - faker.number.int({ min: 0, max: 86400000 }),
      pinned: faker.datatype.boolean(0.1), // 10% pinned
      muted: faker.datatype.boolean(0.05), // 5% muted
      created_at: now - faker.number.int({ min: 86400000, max: 31536000000 }),
      updated_at: now
    }
  }
}
