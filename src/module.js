import { initUploadArea } from "./scripts/components/UploadArea";
import { initUploadButton } from "./scripts/components/UploadButton";
import { initChatSidebar } from "./scripts/components/ChatSidebar";
import { initChatMessage } from "./scripts/components/ChatMessage";
import { find } from "./scripts/utils/JqueryWrappers";
import { createUploadFolder, getSettings, registerSetting } from "./scripts/utils/Settings";
import { ChatResolver } from "./scripts/components/ChatResolver";

const registerSettings = () => {
	const settings = getSettings();
	settings.forEach((setting) => registerSetting(setting));
};

Hooks.once("init", async () => {
	registerSettings();
	await createUploadFolder();
	
	ChatLog.MESSAGE_PATTERNS["cimage"] = new RegExp(ChatResolver.PATTERNS.cimage);
	
	ChatLog.MESSAGE_PATTERNS["cvideo"] = new RegExp(ChatResolver.PATTERNS.cvideo);
});

Hooks.on("renderSidebarTab", (_0: never, sidebar: JQuery) => {
	const sidebarElement: HTMLElement | null | undefined = sidebar[0];
	if (!sidebarElement) {
		return;
	}
	const hasChatElement = sidebarElement.querySelector("#chat-message");
	if (!hasChatElement) {
		return;
	}
	initUploadArea(sidebar);
	initUploadButton(sidebar);
	initChatSidebar(sidebar);
});

Hooks.once("setup", () => {
	Hooks.on("chatMessage", (chatMessage: any, message: string, messageData: any) => {
		ChatResolver.onChatMessage(chatMessage, message, messageData);
	});

	Hooks.on("preCreateChatMessage", (chatMessage: any, message: never, messageData: any) => {
		const processedMessage: string | null = ChatResolver.onPreCreateChatMessage(chatMessage, message, messageData);
		// const processedMessage: string = processMessage(chatMessage.content)
		if (processedMessage == null || chatMessage.content === processedMessage) {
			return;
		}
		// chatMessage.content = processedMessage
		// chatMessage._source.content = processedMessage
		// messageOptions.chatBubble = false
	});

	Hooks.on("renderChatMessage", (chatMessage: any, html: JQuery, messageData: any) => {
		ChatResolver.onRenderChatMessage(chatMessage, html, messageData);
		const ciMessage = find(".chat-media-image", html);
		if (!ciMessage[0]) {
			return;
		}
		initChatMessage(html);
	});
});

// Hooks.on('chatMessage', ChatResolver.onChatMessage);
// Hooks.on('preCreateChatMessage', ChatResolver.onPreCreateChatMessage);
// Hooks.on('renderChatMessage', ChatResolver.onRenderChatMessage);
