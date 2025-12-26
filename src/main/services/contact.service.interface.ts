import type { Contact, ContactRequest, ContactRequestId, UserId } from '@sdk/contract/models'

export interface IContactService {
  list(): Promise<Contact[]>
  request(toUserId: UserId, message?: string): Promise<ContactRequest>
  respondRequest(
    requestId: ContactRequestId,
    action: 'accept' | 'reject' | 'cancel'
  ): Promise<Contact>
  blockUser(userId: UserId, blocked: boolean): Promise<void>
}
