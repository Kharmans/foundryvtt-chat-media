import {ORIGIN_FOLDER, i18n} from './Utils'


export const createUploadFolder = async (uploadLocation?: string) => {
  const location = uploadLocation || getSetting('uploadLocation')
  try {
    const folderLocation = await FilePicker.browse(ORIGIN_FOLDER, location)
    if (folderLocation.target === '.') await FilePicker.createDirectory(ORIGIN_FOLDER, location, {})
  } catch (e) {
    await FilePicker.createDirectory(ORIGIN_FOLDER, location, {})
  }
}

export const setSetting = (key: string, value: any) => {
  return (game as Game).settings.set('chat-images', key, value)
}

export const getSettings = () => [
  {
    key: 'uploadButton',
    options: {
      name: i18n('uploadButton'),
      hint: i18n('uploadButtonHint'),
      type: Boolean,
      default: true,
      config: true,
      requiresReload: true,
    },
  },
  {
    key: 'uploadLocation',
    options: {
      name: i18n('uploadLocation'),
      hint: i18n('uploadLocationHint'),
      type: String,
      default: 'uploaded-chat-images',
      scope: 'world',
      config: true,
      restricted: true,
      onChange: async (newUploadLocation: string) => {
        const defaultLocation = 'uploaded-chat-images'
        let location = newUploadLocation.trim()
        let shouldChangeLocation = false

        if (!location) {
          location = defaultLocation
          shouldChangeLocation = true
        }

        location = location.replace(/\s+/g, '-')
        if (newUploadLocation !== location) shouldChangeLocation = true

        await createUploadFolder(location)
        if (shouldChangeLocation) await setSetting('uploadLocation', location)
      },
    },
  },
]

export const registerSetting = (setting: {key: string, options: any}) => {
  return (game as Game).settings.register('chat-images', setting.key, setting.options)
}

export const getSetting = (key: string): any => {
  return (game as Game).settings.get('chat-images', key)
}
