import { ORIGIN_FOLDER, randomString, i18n, userCanUpload } from "../utils/Utils";
import { addClass, append, create, find, on, remove, removeClass } from "../utils/JqueryWrappers";
import imageCompression from "../browser-image-compression/browser-image-compression.mjs";
import { getUploadingStates } from "../components/Loader";
import { getSetting } from "../utils/Settings";

export type SaveValueType = {
	type?: string;
	name?: string;
	file?: File;
	imageSrc: string | ArrayBuffer | null;
	id: string;
};

const RESTRICTED_DOMAINS = ["static.wikia"];

const DOM_PARSER = new DOMParser();

let imageQueue: SaveValueType[] = [];

const isFileImage = (file: File | DataTransferItem) => file.type && file.type.startsWith("image/");
const isFileVideo = (file: File | DataTransferItem) => file.type && file.type.startsWith("video/");

const createImagePreview = ({ imageSrc, id }: SaveValueType): JQuery =>
	create(
		`<div id="${id}" class="chat-images-upload-area-image">
            <i class="chat-images-remove-image-icon fa-regular fa-circle-xmark"></i>
            <img class="chat-images-image-preview" data-src="${imageSrc}" src="${imageSrc}" alt="${i18n(
			"unableToLoadImage"
		)}"/>
        </div>`
	);

const addEventToRemoveButton = (removeButton: JQuery, saveValue: SaveValueType, uploadArea: JQuery) => {
	const removeEventHandler = () => {
		const image = find(`#${saveValue.id}`, uploadArea);

		remove(image);
		imageQueue = imageQueue.filter((imgData: SaveValueType) => saveValue.id !== imgData.id);

		if (imageQueue.length) return;
		addClass(uploadArea, "hidden");
	};
	on(removeButton, "click", removeEventHandler);
};

const uploadImage = async (saveValue: SaveValueType): Promise<string> => {
	const generateFileName = (saveValue: SaveValueType) => {
		const { type, name, id } = saveValue;
		const fileExtension: string =
			name?.substring(name.lastIndexOf("."), name.length) || type?.replace("image/", ".") || ".jpeg";
		return `${id}${fileExtension}`;
	};

	try {
		const newName = generateFileName(saveValue);
		const compressedImage = await imageCompression(saveValue.file as File, {
			maxSizeMB: 1.5,
			useWebWorker: true,
			alwaysKeepResolution: true,
		});
		const newImage = new File([compressedImage as File], newName, { type: saveValue.type });

		const uploadLocation = getSetting("uploadLocation");
		// @ts-ignore
		const imageLocation = await FilePicker.upload(ORIGIN_FOLDER, uploadLocation, newImage, {}, { notify: false });

		if (!imageLocation || !(imageLocation as FilePicker.UploadResult)?.path) return saveValue.imageSrc as string;
		return (imageLocation as FilePicker.UploadResult)?.path;
	} catch (e) {
		return saveValue.imageSrc as string;
	}
};

const addImageToQueue = async (saveValue: SaveValueType, sidebar: JQuery) => {
	const uploadingStates = getUploadingStates(sidebar);

	uploadingStates.on();
	const uploadArea: JQuery = find("#chat-images-chat-upload-area", sidebar);
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

	const removeButton = find(".chat-images-remove-image-icon", imagePreview);
	addEventToRemoveButton(removeButton, saveValue, uploadArea);
	uploadingStates.off();
};

const filesFileReaderHandler = (file: File, sidebar: JQuery) => async (evt: Event) => {
	const imageSrc = (evt.target as FileReader)?.result;
	const saveValue = { type: file.type, name: file.name, imageSrc, id: randomString(), file };
	await addImageToQueue(saveValue, sidebar);
};

export const processFiles = (files: FileList | File[], sidebar: JQuery) => {
	for (let i = 0; i < files.length; i++) {
		const file: File = <File>files[i];
		const isImage = isFileImage(file);
		const isVideo = isFileVideo(file);
		if (!isImage && !isVideo) {
			continue;
		}
		const reader: FileReader = new FileReader();
		reader.addEventListener("load", filesFileReaderHandler(file, sidebar));
		reader.readAsDataURL(file);
	}
};

export const processDropAndPasteImages = (eventData: DataTransfer, sidebar: JQuery) => {
	const extractUrlFromEventData = (eventData: DataTransfer): string[] | null => {
		const html = eventData.getData("text/html");
		if (!html) return null;

		const images = DOM_PARSER.parseFromString(html, "text/html").querySelectorAll("img");
		if (!images || !images.length) return null;

		// @ts-ignore
		const imageUrls = [...images].map((img) => img.src as string);
		const imagesContainRestrictedDomains = imageUrls.some((iu) => RESTRICTED_DOMAINS.some((rd) => iu.includes(rd)));
		return imagesContainRestrictedDomains ? null : imageUrls;
	};
	const urlsFromEventDataHandler = async (urls: string[]) => {
		for (let i = 0; i < urls.length; i++) {
			const url = urls[i];
			const saveValue = <SaveValueType>{ imageSrc: url, id: randomString() };
			await addImageToQueue(saveValue, sidebar);
		}
	};

	const urls: string[] | null = extractUrlFromEventData(eventData);
	if (urls && urls.length) {
		return urlsFromEventDataHandler(urls);
	}

	const extractFilesFromEventData = (eventData: DataTransfer): File[] => {
		const items: DataTransferItemList = eventData.items;
		const files = <any[]>[];
		for (let i = 0; i < items.length; i++) {
			const item: DataTransferItem = <DataTransferItem>items[i];
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

	const filesExtracted: File[] = extractFilesFromEventData(eventData);
	if (filesExtracted && filesExtracted.length) {
		return processFiles(filesExtracted, sidebar);
	}
};

export const getImageQueue = (): SaveValueType[] => imageQueue;

export const removeAllFromQueue = (sidebar: JQuery) => {
	while (imageQueue.length) {
		const imageData: SaveValueType | undefined = imageQueue.pop();
		if (!imageData) continue;

		const imageElement = find(`#${imageData.id}`, sidebar);
		remove(imageElement);
	}

	const uploadArea: JQuery = find("#chat-images-chat-upload-area", sidebar);
	addClass(uploadArea, "hidden");
};
