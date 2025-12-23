import { session } from 'electron'

const isDevelopment = process.env.NODE_ENV === 'development'

export async function installDevTools(): Promise<void> {
  if (!isDevelopment) return

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const devtools = require('electron-devtools-installer')

    // Handle different export formats (CJS vs ESM interop)
    const install = devtools.default || devtools
    const REACT_DEVELOPER_TOOLS =
      devtools.REACT_DEVELOPER_TOOLS ||
      (devtools.default && devtools.default.REACT_DEVELOPER_TOOLS) ||
      'fmkadmapgofadopljbjfkapdkoienihi' // Fallback to explicitly known ID

    if (typeof install !== 'function') {
      console.error(
        '❌ Install function not found in electron-devtools-installer. Exports:',
        devtools
      )
      return
    }

    const name = await install(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true
      },
      forceDownload: false // Use cache
    })

    console.log(`✅ Added Extension: ${name}`)

    // Loop through extensions to find the path, as install() returns a string name
    const extension = session.defaultSession.extensions
      .getAllExtensions()
      .find((e) => e.name === name)

    if (extension) {
      // Reload extension to ensure it loads correctly
      // Equivalent to: await setTimeout(1000) -> session.extensions.loadExtension(extension.path)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await session.defaultSession.extensions.loadExtension(extension.path)
      console.log(`✅ Reloaded Extension: ${name}`)
    }
  } catch (err) {
    console.error('❌ DevTools Error:', err)
  }
}
