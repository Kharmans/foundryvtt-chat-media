import { ORIGIN_FOLDER, i18n } from "./Utils.js";

export const createUploadFolder = async (uploadLocation = "") => {
  const location = uploadLocation || getSetting("uploadLocation");
  const FilePickerImpl = foundry.applications?.apps?.FilePicker?.implementation || FilePicker;
  try {
    const folderLocation = await FilePickerImpl.browse(ORIGIN_FOLDER, location);
    if (folderLocation.target === ".") await FilePickerImpl.createDirectory(ORIGIN_FOLDER, location, {});
  } catch (e) {
    await FilePickerImpl.createDirectory(ORIGIN_FOLDER, location, {});
  }
};

export const setSetting = (key, value) => {
  return game.settings.set("chat-media", key, value);
};

export const getSettings = () => [
  {
    key: "uploadButton",
    options: {
      name: i18n("uploadButton"),
      hint: i18n("uploadButtonHint"),
      type: Boolean,
      default: true,
      config: true,
      requiresReload: true,
    },
  },
  {
    key: "uploadLocation",
    options: {
      name: i18n("uploadLocation"),
      hint: i18n("uploadLocationHint"),
      type: String,
      default: "uploaded-chat-media",
      scope: "world",
      config: true,
      restricted: true,
      onChange: async (newUploadLocation) => {
        const defaultLocation = "uploaded-chat-media";
        let location = newUploadLocation.trim();
        let shouldChangeLocation = false;

        if (!location) {
          location = defaultLocation;
          shouldChangeLocation = true;
        }

        location = location.replace(/\s+/g, "-");
        if (newUploadLocation !== location) shouldChangeLocation = true;

        await createUploadFolder(location);
        if (shouldChangeLocation) await setSetting("uploadLocation", location);
      },
    },
  },
  {
    key: "videoAutoplay",
    options: {
      name: i18n("videoAutoplay"),
      hint: i18n("videoAutoplayHint"),
      type: Boolean,
      default: true,
      config: true,
    },
  },
  {
    key: "videoLoop",
    options: {
      name: i18n("videoLoop"),
      hint: i18n("videoLoopHint"),
      type: Boolean,
      default: true,
      config: true,
    },
  },
  {
    key: "videoMuted",
    options: {
      name: i18n("videoMuted"),
      hint: i18n("videoMutedHint"),
      type: Boolean,
      default: true,
      config: true,
    },
  },
  {
    key: "videoControls",
    options: {
      name: i18n("videoControls"),
      hint: i18n("videoControlsHint"),
      type: Boolean,
      default: false,
      config: true,
    },
  },
];

export const registerSetting = (setting) => {
  return game.settings.register("chat-media", setting.key, setting.options);
};

export const getSetting = (key) => {
  return game.settings.get("chat-media", key);
};
