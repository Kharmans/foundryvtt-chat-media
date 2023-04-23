import { addClass, append, create, find, on, trigger } from "../utils/JqueryWrappers";
import { i18n, userCanUpload } from "../utils/Utils";
import { processFiles } from "../processors/FileProcessor";
import { getSetting } from "../utils/Settings";

const createUploadButton = (): JQuery =>
	create(`<a id="chat-media-upload-image" title="${i18n("uploadButtonTitle")}"><i class="fas fa-images"></i></a>`);

const createHiddenUploadInput = (): JQuery =>
	create(`<input type="file" multiple accept="image/*" id="chat-media-upload-image-hidden-input">`);
//SUPPORT FOR VIDEO
//create(`<input type="file" multiple accept="image/*,video/*" id="chat-media-upload-image-hidden-input">`);

const setupEvents = (uploadButton: JQuery, hiddenUploadInput: JQuery, sidebar: JQuery) => {
	const hiddenUploadInputChangeEventHandler = (evt: Event) => {
		const currentTarget: HTMLInputElement = evt.currentTarget as HTMLInputElement;
		const files: FileList | null = currentTarget.files;
		if (!files) return;

		processFiles(files, sidebar);
		currentTarget.value = "";
	};
	const uploadButtonClickEventHandler = (evt: Event) => {
		evt.preventDefault();
		trigger(hiddenUploadInput, "click");
	};

	on(hiddenUploadInput, "change", hiddenUploadInputChangeEventHandler);
	on(uploadButton, "click", uploadButtonClickEventHandler);
};

export const initUploadButton = (sidebar: JQuery) => {
	if (!getSetting("uploadButton")) return;

	const controlButtons: JQuery = find(".control-buttons", sidebar);
	const uploadButton: JQuery = createUploadButton();
	const hiddenUploadInput: JQuery = createHiddenUploadInput();

	if (!userCanUpload(true)) return;

	if (controlButtons[0]) {
		addClass(controlButtons, "chat-media-control-buttons-gm");
		append(controlButtons, uploadButton);
		append(controlButtons, hiddenUploadInput);
	} else {
		// Players don't have buttons
		const chatControls: JQuery = find("#chat-controls", sidebar);
		const newControlButtons = create('<div class="chat-media-control-buttons-p"></div>');

		append(newControlButtons, uploadButton);
		append(newControlButtons, hiddenUploadInput);
		append(chatControls, newControlButtons);
	}

	setupEvents(uploadButton, hiddenUploadInput, sidebar);
};
