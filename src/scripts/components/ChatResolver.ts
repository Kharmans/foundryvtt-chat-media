/* eslint-disable indent */
/* eslint-disable require-jsdoc */
/* eslint-disable no-tabs */

import { getVideoType } from "../lib/lib";
import { i18n } from "../utils/Utils";

/*
 * Cautious Gamemasters Pack
 * https://github.com/cs96and/FoundryVTT-CGMP
 *
 * Copyright (c) 2020 Shoyu Vanilla - All Rights Reserved.
 * Copyright (c) 2021-2022 Alan Davies - All Rights Reserved.
 *
 * You may use, distribute and modify this code under the terms of the MIT license.
 *
 * You should have received a copy of the MIT license with this file. If not, please visit:
 * https://mit-license.org/
 */
export class ChatResolver {
	static PATTERNS = {
		// extended commands
		// "cimage": /^(\/cimage\s+)(\([^\)]+\)|\[[^\]]+\]|"[^"]+"|'[^']+'|[^\s]+)\s+([^]*)/i,
		// desc regex contains an empty group so that the match layout is the same as "as"
		// cimage: /^(\/cimage\s+)()([^]*)/i,
		cimage: /^(cimage\s+)()([^]*)/i,
		cvideo: /^(cvideo\s+)()([^]*)/i,
	};

	private static _REPLACE_PATTERNS = {
		cimage: /(cimage\s*)/gi,
		cvideo: /(cvideo\s*)/gi,
	};

	private static imageReg = /((.*)\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif|GIF|PNG|JPG|JPEG|WEBP|SVG|PSD|BMP|TIF))/gi;
	private static imageMarkdownReg = /^(cimage\s+)\s*(.+?)\s*/gi;

	private static videoReg = /((.*)\.(i:webm|mp4|WEBM|MP$))/gi;
	private static videoMarkdownReg = /^(cvideo\s+)\s*(.+?)\s*/gi;

	private static CHAT_MESSAGE_SUB_TYPES = {
		CIMAGE: 0,
		CVIDEO: 1,
	};

	static onChatMessage(chatLog: any, message: string, chatData: any) {
		// Parse the message to determine the matching handler
		const [command, match] = ChatResolver._parseChatMessage(message);

		// Process message data based on the identified command type
		switch (command) {
			case "cimage": {
				if (!game.user?.isGM) {
					// TODO add game setting for allow player or only the gm
					return true;
				}

				// Remove quotes or brackets around the speaker's name.
				const alias = match[2].replace(/^["'\(\[](.*?)["'\)\]]$/, "$1");

				chatData.flags ??= {};
				chatData.flags["chat-images"] = { subType: ChatResolver.CHAT_MESSAGE_SUB_TYPES.CIMAGE };

				chatData.type = CONST.CHAT_MESSAGE_TYPES.IC;
				chatData.speaker = { alias: alias, scene: game.user.viewedScene };
				chatData.content = match[3].replace(/\n/g, "<br>");
				// Fall through...

				return true;
			}
			case "cvideo": {
				if (!game.user?.isGM) {
					// TODO add game setting for allow player or only the gm
					return true;
				}

				// Remove quotes or brackets around the speaker's name.
				const alias = match[2].replace(/^["'\(\[](.*?)["'\)\]]$/, "$1");

				chatData.flags ??= {};
				chatData.flags["chat-images"] = { subType: ChatResolver.CHAT_MESSAGE_SUB_TYPES.CVIDEO };

				chatData.type = CONST.CHAT_MESSAGE_TYPES.IC;
				chatData.speaker = { alias: alias, scene: game.user.viewedScene };
				chatData.content = match[3].replace(/\n/g, "<br>");
				// Fall through...

				return true;
			}
			default: {
				return true;
			}
		}
	}

	static onPreCreateChatMessage(chatMessage, messageB, messageOptions): string | null {
		const messageData = messageB;
		const message = messageB.content ? messageB.content : messageB;

		if (!messageData.flags) {
			if ($(chatMessage.content).find(".chat-images-image")) {
				messageData.flags ??= {};
				messageData.flags["chat-images"] = { subType: ChatResolver.CHAT_MESSAGE_SUB_TYPES.CIMAGE };

				messageData.type = CONST.CHAT_MESSAGE_TYPES.IC;
			}
		}

		switch (messageData.flags["chat-images"]?.subType) {
			case ChatResolver.CHAT_MESSAGE_SUB_TYPES.CIMAGE: {
				if (!message.match(ChatResolver.PATTERNS.cimage)) {
					return message;
				}
				const processedMessage = ChatResolver._processMessageImage(message);
				chatMessage.content = processedMessage;
				chatMessage._source.content = processedMessage;
				messageOptions.chatBubble = false;
				return processedMessage;
			}
			case ChatResolver.CHAT_MESSAGE_SUB_TYPES.CVIDEO: {
				if (!message.match(ChatResolver.PATTERNS.cvideo)) {
					return message;
				}
				const processedMessage = ChatResolver._processMessageVideo(message);
				chatMessage.content = processedMessage;
				chatMessage._source.content = processedMessage;
				messageOptions.chatBubble = false;
				return processedMessage;
			}
			default: {
				break;
			}
		}
		return message;
	}

	private static _processMessageImage(message: string): string {
		if (!message.match(ChatResolver.imageMarkdownReg)) {
			return message;
		}
		const newMessage = message.replaceAll(ChatResolver._REPLACE_PATTERNS.cimage, "");
		// split by one or more whitespace characters regex - \s+
		const imagesToCheck = newMessage.split(/\s+/);
		const images = <string[]>[];
		for (const src of imagesToCheck) {
			// Remove quotes or brackets around the src url
			const srcCleaned = src.replace(/^["'\(\[](.*?)["'\)\]]$/, "$1");
			if (srcCleaned.match(ChatResolver.imageReg)) {
				images.push(srcCleaned);
			}
		}
		if (images?.length <= 0) {
			return message;
		}
		let imageTemplate = ``;
		for (const src of images) {
			imageTemplate =
				imageTemplate +
				`<div class="chat-images-image">
					<img data-src="${src}" src="${src}" alt="${i18n("unableToLoadImage")}" >
			</div>`;
		}
		return imageTemplate;
	}

	private static _processMessageVideo(message: string): string {
		if (!message.match(ChatResolver.videoMarkdownReg)) {
			return message;
		}
		const bgLoop = true;
		const bgMuted = true;
		const newMessage = message.replaceAll(ChatResolver._REPLACE_PATTERNS.cvideo, "");
		// split by one or more whitespace characters regex - \s+
		const videosToCheck = newMessage.split(/\s+/);
		const videos = <string[]>[];
		for (const src of videosToCheck) {
			// Remove quotes or brackets around the src url
			const srcCleaned = src.replace(/^["'\(\[](.*?)["'\)\]]$/, "$1");
			if (srcCleaned.match(ChatResolver.videoReg)) {
				videos.push(srcCleaned);
			}
		}
		if (videos?.length <= 0) {
			return message;
		}
		let videoTemplate = ``;
		for (const src of videos) {
			videoTemplate =
				videoTemplate +
				`<div class="chat-images-image">
				<video class="chat-images-video"
				autoplay
				${bgLoop ? "loop" : ""}
				${bgMuted ? "muted" : ""}
				data-src="${src}">
				<source src="${src}" type="${getVideoType(src)}">
			</video>
			</div>`;
		}
		return videoTemplate;
	}

	static onRenderChatMessage(chatMessage, html, messageData) {
		if (!messageData.message.flags) {
			if ($(chatMessage.content).find(".chat-images-image")) {
				messageData.message.flags ??= {};
				messageData.message.flags["chat-images"] = { subType: ChatResolver.CHAT_MESSAGE_SUB_TYPES.CIMAGE };

				messageData.message.type = CONST.CHAT_MESSAGE_TYPES.IC;
			}
		}

		// @ts-ignore
		switch (messageData.message.flags["chat-images"]?.subType) {
			case ChatResolver.CHAT_MESSAGE_SUB_TYPES.CIMAGE: {
				html.addClass("chat-images-image");
				return;
			}
			case ChatResolver.CHAT_MESSAGE_SUB_TYPES.CVIDEO: {
				html.addClass("chat-images-image");
				return;
			}
			default: {
				break;
			}
		}
	}

	/**
	 * The set of commands that can be processed over multiple lines.
	 * @type {Set<string>}
	 */
	private static MULTILINE_COMMANDS = new Set(["roll", "gmroll", "blindroll", "selfroll", "publicroll"]);

	private static _parseChatMessage(message: any) {
		// Iterate over patterns, finding the first match
		// for ( const [command, rgx] of Object.entries(ChatResolver.PATTERNS) ) {
		//   const match = message.match(rgx)
		//   if (match) {
		//     return [command, match]
		//   }
		// }
		// return [undefined, undefined]
		for (const [rule, rgx] of Object.entries(ChatResolver.PATTERNS)) {
			// For multi-line matches, the first line must match
			if (this.MULTILINE_COMMANDS.has(rule)) {
				const lines = message.split("\n");
				if (rgx.test(lines[0])) {
					return [rule, lines.map((l) => l.match(rgx))];
				}
			}
			// For single-line matches, match directly
			else {
				const match = message.match(rgx);
				if (match) return [rule, match];
			}
		}
		return ["none", [message, "", message]];
	}
}
