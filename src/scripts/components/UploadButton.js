import { addClass, append, before, create, find, on, trigger } from "../utils/JqueryWrappers.js";
import { i18n, userCanUpload } from "../utils/Utils.js";
import { processFiles } from "../processors/FileProcessor.js";
import { getSetting } from "../utils/Settings.js";

const createUploadButton = () =>
    create(`<a id="chat-media-upload-image" title="${i18n("uploadButtonTitle")}"><i class="fas fa-images"></i></a>`);

const createHiddenUploadInput = () =>
    create(`<input type="file" multiple accept="image/*" id="chat-media-upload-image-hidden-input">`);
//SUPPORT FOR VIDEO
//create(`<input type="file" multiple accept="image/*,video/*" id="chat-media-upload-image-hidden-input">`);

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

    const controlButtons = find(".control-buttons", sidebar);
    const uploadButton = createUploadButton();
    const hiddenUploadInput = createHiddenUploadInput();

    if (!userCanUpload(true)) return;

    if (controlButtons[0]) {
        addClass(controlButtons, "chat-media-control-buttons-gm");
        append(controlButtons, uploadButton);
        append(controlButtons, hiddenUploadInput);
    } else {
        // Try to find chat-controls (v12), fallback to creating controls near chat message (v13)
        let chatControls = find("#chat-controls", sidebar);

        if (chatControls[0]) {
            const newControlButtons = create('<div class="chat-media-control-buttons-p"></div>');
            append(newControlButtons, uploadButton);
            append(newControlButtons, hiddenUploadInput);
            append(chatControls, newControlButtons);
        } else {
            // v13: create controls container and place it near the chat message
            const chatMessage = find("#chat-message", sidebar);
            if (chatMessage[0]) {
                const newControlButtons = create('<div class="chat-media-control-buttons-p"></div>');
                append(newControlButtons, uploadButton);
                append(newControlButtons, hiddenUploadInput);
                before(chatMessage, newControlButtons);
            }
        }
    }

    setupEvents(uploadButton, hiddenUploadInput, sidebar);
};
