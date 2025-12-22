import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Database operations
  db: {
    query: (params: unknown) => ipcRenderer.invoke('db:query', params),
    insert: (params: unknown) => ipcRenderer.invoke('db:insert', params),
    update: (params: unknown) => ipcRenderer.invoke('db:update', params),
    delete: (params: unknown) => ipcRenderer.invoke('db:delete', params),
  },
  // Auth operations
  auth: {
    login: (params: unknown) => ipcRenderer.invoke('auth:login', params),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
