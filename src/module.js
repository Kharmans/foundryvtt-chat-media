import { initUploadArea } from "./scripts/components/UploadArea.js";
import { initUploadButton } from "./scripts/components/UploadButton.js";
import { initChatSidebar } from "./scripts/components/ChatSidebar.js";
import { initChatMessage } from "./scripts/components/ChatMessage.js";
import { find } from "./scripts/utils/JqueryWrappers";
import { createUploadFolder, getSettings, registerSetting } from "./scripts/utils/Settings.js";
import { ChatResolver } from "./scripts/components/ChatResolver.js";

const registerSettings = () => {
  const settings = getSettings();
  settings.forEach((setting) => registerSetting(setting));
};

Hooks.once("init", async () => {
  registerSettings();
  await createUploadFolder();

  const ChatLogImpl = foundry.applications?.sidebar?.tabs?.ChatLog || ChatLog;
  ChatLogImpl.MESSAGE_PATTERNS["cimage"] = new RegExp(ChatResolver.PATTERNS.cimage);
  ChatLogImpl.MESSAGE_PATTERNS["cvideo"] = new RegExp(ChatResolver.PATTERNS.cvideo);
});

Hooks.once("ready", () => {
  console.log("Chat Media: Ready hook triggered, attempting to initialize");

  // Try multiple approaches to find and initialize the chat elements
  const initializeChat = () => {
    const chatMessage = document.querySelector("#chat-message");
    if (chatMessage) {
      console.log("Chat Media: Found chat-message directly, initializing");
      const parent = chatMessage.closest("#sidebar") || chatMessage.parentElement.parentElement;
      const jqueryParent = $(parent);
      initUploadArea(jqueryParent);
      initUploadButton(jqueryParent);
      initChatSidebar(jqueryParent);
      return true;
    }

    return false;
  };

  // Try immediately
  if (!initializeChat()) {
    console.log("Chat Media: Initial attempt failed, trying with delay");
    // Try again after a delay
    setTimeout(() => {
      if (!initializeChat()) {
        console.warn("Chat Media: Could not initialize - chat elements not found");
      }
    }, 500);
  }
});

Hooks.once("setup", () => {
  Hooks.on("chatMessage", (chatMessage, message, messageData) => {
    ChatResolver.onChatMessage(chatMessage, message, messageData);
  });

  Hooks.on("preCreateChatMessage", (chatMessage, message, messageData) => {
    const processedMessage = ChatResolver.onPreCreateChatMessage(chatMessage, message, messageData);
    if (processedMessage == null || chatMessage.content === processedMessage) {
      return;
    }
  });

  Hooks.on("renderChatMessageHTML", (chatMessage, html, messageData) => {
    ChatResolver.onRenderChatMessageHTML(chatMessage, html, messageData);
    const ciMessage = html.querySelector(".chat-media-image");
    if (!ciMessage) {
      return;
    }
    initChatMessage(html);
  });
});
