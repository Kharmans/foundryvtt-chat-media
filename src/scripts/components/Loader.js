import { append, attr, create, find, focus, remove, removeAttr } from "../utils/JqueryWrappers.js";

const toggleChat = (chat, toggle) => {
    if (!toggle) {
        attr(chat, "disabled", true);
        return;
    }
    removeAttr(chat, "disabled");
    focus(chat);
};

const toggleSpinner = (chatForm, toggle) => {
    const spinnerId = "chat-media-spinner";
    const spinner = find(`#${spinnerId}`, chatForm);

    if (!toggle && spinner[0]) {
        remove(spinner);
        return;
    }

    if (toggle && !spinner[0]) {
        const newSpinner = create(`<div id="${spinnerId}"></div>`);
        append(chatForm, newSpinner);
    }
};

export const getUploadingStates = (sidebar) => {
    // Try to find chat-form first (v12), fallback to sidebar (v13)
    let chatForm = find("#chat-form", sidebar);
    if (!chatForm[0]) {
        chatForm = sidebar;
    }
    const chat = find("#chat-message", sidebar);

    return {
        on() {
            toggleChat(chat, false);
            toggleSpinner(chatForm, true);
        },
        off() {
            toggleChat(chat, true);
            toggleSpinner(chatForm, false);
        },
    };
};
