import { ORIGIN_FOLDER, randomString, i18n, userCanUpload } from "../utils/Utils.js";
import { addClass, append, create, find, on, remove, removeClass } from "../utils/JqueryWrappers.js";
import imageCompression from "../browser-image-compression/browser-image-compression.mjs";
import { getUploadingStates } from "../components/Loader.js";
import { getSetting } from "../utils/Settings.js";

// export const SaveValueType = {
// 	type = "";
// 	name = "";
// 	file = new File;
// 	imageSrc | ArrayBuffer;
// 	id;
// };

const RESTRICTED_DOMAINS = ["static.wikia"];

const DOM_PARSER = new DOMParser();

let imageQueue = [];

const isFileImage = (file) => file.type && file.type.startsWith("image/");
const isFileVideo = (file) => file.type && file.type.startsWith("video/");

const createImagePreview = ({ imageSrc, id }) =>
    create(
        `<div id="${id}" class="chat-media-upload-area-image">
            <i class="chat-media-remove-image-icon fa-regular fa-circle-xmark"></i>
            <img class="chat-media-image-preview" data-src="${imageSrc}" src="${imageSrc}" alt="${i18n(
                "unableToLoadImage",
            )}"/>
        </div>`,
    );

const addEventToRemoveButton = (removeButton, saveValue, uploadArea) => {
    const removeEventHandler = () => {
        const image = find(`#${saveValue.id}`, uploadArea);

        remove(image);
        imageQueue = imageQueue.filter((imgData) => saveValue.id !== imgData.id);

        if (imageQueue.length) return;
        addClass(uploadArea, "hidden");
    };
    on(removeButton, "click", removeEventHandler);
};

const uploadImage = async (saveValue) => {
    const generateFileName = (saveValue) => {
        const { type, name, id } = saveValue;
        const fileExtension =
            name?.substring(name.lastIndexOf("."), name.length) || type?.replace("image/", ".") || ".jpeg";
        return `${id}${fileExtension}`;
    };

    try {
        const newName = generateFileName(saveValue);
        const compressedImage = await imageCompression(saveValue.file, {
            maxSizeMB: 1.5,
            useWebWorker: true,
            alwaysKeepResolution: true,
        });
        const newImage = new File([compressedImage], newName, { type: saveValue.type });

        const uploadLocation = getSetting("uploadLocation");

        const imageLocation = await FilePicker.upload(ORIGIN_FOLDER, uploadLocation, newImage, {}, { notify: false });

        if (!imageLocation || !imageLocationPicker.UploadResult?.path) return saveValue.imageSrc;
        return imageLocationPicker.UploadResult?.path;
    } catch (e) {
        return saveValue.imageSrc;
    }
};

const addImageToQueue = async (saveValue, sidebar) => {
    const uploadingStates = getUploadingStates(sidebar);

    uploadingStates.on();
    const uploadArea = find("#chat-media-chat-upload-area", sidebar);
    if (!uploadArea || !uploadArea[0]) return;

    if (saveValue.file) {
        if (!userCanUpload()) {
            uploadingStates.off();
            return;
        }
        saveValue.imageSrc = await uploadImage(saveValue);
    }

    const imagePreview = createImagePreview(saveValue);
    if (!imagePreview || !imagePreview[0]) return;

    removeClass(uploadArea, "hidden");
    append(uploadArea, imagePreview);
    imageQueue.push(saveValue);

    const removeButton = find(".chat-media-remove-image-icon", imagePreview);
    addEventToRemoveButton(removeButton, saveValue, uploadArea);
    uploadingStates.off();
};

const filesFileReaderHandler = (file, sidebar) => async (evt) => {
    const imageSrc = evt.target?.result;
    const saveValue = { type: file.type, name: file.name, imageSrc: imageSrc, id: randomString(), file: file };
    await addImageToQueue(saveValue, sidebar);
};

export const processFiles = (files, sidebar) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImage = isFileImage(file);
        const isVideo = isFileVideo(file);
        if (!isImage && !isVideo) {
            continue;
        }
        const reader = new FileReader();
        reader.addEventListener("load", filesFileReaderHandler(file, sidebar));
        reader.readAsDataURL(file);
    }
};

export const processDropAndPasteImages = (eventData, sidebar) => {
    const extractUrlFromEventData = (eventData) => {
        const html = eventData.getData("text/html");
        if (!html) return null;

        const images = DOM_PARSER.parseFromString(html, "text/html").querySelectorAll("img");
        if (!images || !images.length) return null;

        const imageUrls = [...images].map((img) => img.src);
        const imagesContainRestrictedDomains = imageUrls.some((iu) => RESTRICTED_DOMAINS.some((rd) => iu.includes(rd)));
        return imagesContainRestrictedDomains ? null : imageUrls;
    };
    const urlsFromEventDataHandler = async (urls) => {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const saveValue = { imageSrc: url, id: randomString() };
            await addImageToQueue(saveValue, sidebar);
        }
    };

    const urls = extractUrlFromEventData(eventData);
    if (urls && urls.length) {
        return urlsFromEventDataHandler(urls);
    }

    const extractFilesFromEventData = (eventData) => {
        const items = eventData.items;
        const files = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const isImage = isFileImage(item);
            const isVideo = isFileVideo(item);
            if (!isImage && !isVideo) {
                continue;
            }
            const file = item.getAsFile();
            if (!file) {
                continue;
            }
            files.push(file);
        }
        return files;
    };

    const filesExtracted = extractFilesFromEventData(eventData);
    if (filesExtracted && filesExtracted.length) {
        return processFiles(filesExtracted, sidebar);
    }
};

export const getImageQueue = () => imageQueue;

export const removeAllFromQueue = (sidebar) => {
    while (imageQueue.length) {
        const imageData = imageQueue.pop();
        if (!imageData) continue;

        const imageElement = find(`#${imageData.id}`, sidebar);
        remove(imageElement);
    }

    const uploadArea = find("#chat-media-chat-upload-area", sidebar);
    addClass(uploadArea, "hidden");
};
