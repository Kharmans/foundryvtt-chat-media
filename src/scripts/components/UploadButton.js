import { addClass, append, before, create, find, on, trigger } from "../utils/JqueryWrappers.js";
import { i18n, userCanUpload } from "../utils/Utils.js";
import { processFiles } from "../processors/FileProcessor.js";
import { getSetting } from "../utils/Settings.js";

const createUploadButton = () =>
  create(
    `<button class="ui-control" id="chat-media-upload-image" data-tooltip aria-label="${i18n("uploadButtonTitle")}"><i class="fas fa-images"></i></button>`,
  );

const createHiddenUploadInput = () =>
  create(
    `<input type="file" multiple accept=".apng,.avif,.bmp,.gif,.jpeg,.jpg,.png,.svg,.tiff,.webp,.webm,.m4v,.mp4,.ogv" id="chat-media-upload-image-hidden-input">`,
  );
// Ideas for the future?
// create(`<input type="file" multiple accept=".apng,.avif,.bmp,.gif,.jpeg,.jpg,.png,.svg,.tiff,.webp,.aac,.flac,.m4a,.mid,.mp3,.ogg,.opus,.wav,.webm,.m4v,.mp4,.ogv,.csv,.json,.md,.pdf,.tsv,.txt,.xml,.yml,.yaml,.otf,.ttf,.woff,.woff2,.fbx,.glb,.gltf,.mtl,.obj,.stl,.usdz" id="chat-media-upload-image-hidden-input">`);

const setupEvents = (uploadButton, hiddenUploadInput, sidebar) => {
  const hiddenUploadInputChangeEventHandler = (evt) => {
    const currentTarget = evt.currentTarget;
    const files = currentTarget.files;
    if (!files) return;

    processFiles(files, sidebar);
    currentTarget.value = "";
  };
  const uploadButtonClickEventHandler = (evt) => {
    evt.preventDefault();
    trigger(hiddenUploadInput, "click");
  };

  on(hiddenUploadInput, "change", hiddenUploadInputChangeEventHandler);
  on(uploadButton, "click", uploadButtonClickEventHandler);
};

export const initUploadButton = (sidebar) => {
  if (!getSetting("uploadButton")) return;

  const uploadButton = createUploadButton();
  const hiddenUploadInput = createHiddenUploadInput();

  if (!userCanUpload(true)) return;

  const rollPrivacy = find("#roll-privacy", sidebar);
  if (rollPrivacy[0]) {
    append(rollPrivacy, hiddenUploadInput);
    append(rollPrivacy, uploadButton);
  }

  setupEvents(uploadButton, hiddenUploadInput, sidebar);
};
