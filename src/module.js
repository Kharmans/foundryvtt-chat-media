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

    // Use namespaced ChatLog for v13+ compatibility
    const ChatLogImpl = foundry.applications?.sidebar?.tabs?.ChatLog || ChatLog;
    ChatLogImpl.MESSAGE_PATTERNS["cimage"] = new RegExp(ChatResolver.PATTERNS.cimage);
    ChatLogImpl.MESSAGE_PATTERNS["cvideo"] = new RegExp(ChatResolver.PATTERNS.cvideo);
});

// Handle both v12 renderSidebarTab and v13+ renderChatLog hooks
Hooks.on("renderSidebarTab", (_0, sidebar) => {
    console.log("Chat Media: renderSidebarTab called", { _0, sidebar });

    const sidebarElement = sidebar[0];
    if (!sidebarElement) {
        console.log("Chat Media: No sidebar element found");
        return;
    }

    console.log("Chat Media: Sidebar element:", sidebarElement);

    // Use a small delay to ensure DOM is fully rendered in v13
    setTimeout(() => {
        const hasChatElement = sidebarElement.querySelector("#chat-message");
        console.log("Chat Media: Chat element search result:", hasChatElement);

        if (!hasChatElement) {
            console.log("Chat Media: No chat message element found in sidebar");
            return;
        }

        console.log("Chat Media: Initializing components");
        initUploadArea(sidebar);
        initUploadButton(sidebar);
        initChatSidebar(sidebar);
    }, 100);
});

// Add v13+ specific hook for chat log rendering
Hooks.on("renderChatLog", (app, html, data) => {
    console.log("Chat Media: renderChatLog called", { app, html, data });

    // Use a small delay to ensure DOM is fully rendered
    setTimeout(() => {
        const chatElement = html[0] || html;
        const hasChatMessage = chatElement.querySelector("#chat-message");
        console.log("Chat Media: Chat message element found:", hasChatMessage);

        if (!hasChatMessage) {
            console.log("Chat Media: No chat message element found in chat log");
            return;
        }

        console.log("Chat Media: Initializing components from renderChatLog");
        initUploadArea(html);
        initUploadButton(html);
        initChatSidebar(html);
    }, 100);
});

Hooks.once("ready", () => {
    console.log("Chat Media: Ready hook triggered, attempting to initialize");

    // Try multiple approaches to find and initialize the chat elements
    const initializeChat = () => {
        // Method 1: Try to find via #chat-log
        let chatLog = document.querySelector("#chat-log");
        if (chatLog) {
            const chatMessage = chatLog.querySelector("#chat-message");
            if (chatMessage) {
                console.log("Chat Media: Found chat elements via chat-log, initializing");
                const jqueryChatLog = $(chatLog);
                initUploadArea(jqueryChatLog);
                initUploadButton(jqueryChatLog);
                initChatSidebar(jqueryChatLog);
                return true;
            }
        }

        // Method 2: Try direct approach
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
        // const processedMessage = processMessage(chatMessage.content)
        if (processedMessage == null || chatMessage.content === processedMessage) {
            return;
        }
        // chatMessage.content = processedMessage
        // chatMessage._source.content = processedMessage
        // messageOptions.chatBubble = false
    });

    // Use the new renderChatMessageHTML hook for Foundry v13+ compatibility
    // Check for v13+ using version number since generation might not be reliable
    const foundryVersion = game.version || game.data.version;
    const isV13Plus =
        foundryVersion && (parseInt(foundryVersion.split(".")[0]) >= 13 || foundryVersion.startsWith("13"));

    if (isV13Plus) {
        Hooks.on("renderChatMessageHTML", (chatMessage, html, messageData) => {
            ChatResolver.onRenderChatMessageHTML(chatMessage, html, messageData);
            const ciMessage = html.querySelector(".chat-media-image");
            if (!ciMessage) {
                return;
            }
            initChatMessage(html);
        });
    } else {
        // Fallback for older versions
        Hooks.on("renderChatMessage", (chatMessage, html, messageData) => {
            ChatResolver.onRenderChatMessage(chatMessage, html, messageData);
            const ciMessage = find(".chat-media-image", html);
            if (!ciMessage[0]) {
                return;
            }
            initChatMessage(html);
        });
    }
});

// Hooks.on('chatMessage', ChatResolver.onChatMessage);
// Hooks.on('preCreateChatMessage', ChatResolver.onPreCreateChatMessage);
// Hooks.on('renderChatMessage', ChatResolver.onRenderChatMessage);
