import { ipcMain } from 'electron'
import type { IPCChannel, IPCParams, IPCResult } from '@shared/types/ipc'

/**
 * 类型安全的 IPC Handler 创建函数
 * 确保 handler 的参数和返回值类型与 IPCChannels 定义一致
 *
 * @template C - IPC Channel 名称
 * @param channel - IPC Channel 名称
 * @param handler - 处理函数，接收 params 并返回 Promise<result>
 */
export function createHandler<C extends IPCChannel>(
  channel: C,
  handler: (params: IPCParams<C>) => Promise<IPCResult<C>>
): void {
  ipcMain.handle(channel, async (_, params: IPCParams<C>) => {
    try {
      console.log(`[IPC] ${channel}`, params)
      return await handler(params)
    } catch (error) {
      console.error(`[IPC] ${channel} error:`, error)
      throw error
    }
  })
}
