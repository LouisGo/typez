import { faker } from '@faker-js/faker'
import type { UserTable, UserStatus } from '@shared/types/database'

/**
 * User Mock Data Generator
 */
export class UserGenerator {
  static generate(count: number = 10): UserTable[] {
    return Array.from({ length: count }, (_, index) => this.generateOne(index))
  }

  static generateOne(index?: number): UserTable {
    const now = Date.now()
    return {
      id: faker.string.uuid(),
      username: `user${index !== undefined ? index : faker.number.int({ min: 1000, max: 9999 })}`,
      display_name: faker.person.fullName(),
      avatar_url: faker.image.avatar(),
      phone: faker.phone.number(),
      bio: faker.lorem.sentence(),
      status: faker.helpers.arrayElement<UserStatus>(['online', 'offline', 'away', 'busy']),
      last_seen: now - faker.number.int({ min: 0, max: 86400000 }), // Last 24h
      created_at: now - faker.number.int({ min: 86400000, max: 31536000000 }), // Last year
      updated_at: now
    }
  }
}
