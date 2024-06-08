import MediaPopout from "../share-media/MediaPopout.js";
import { find, on } from "../utils/JqueryWrappers.js";

export const initChatMessage = (html) => {
    const images = find(".chat-media-image img", html);
    if (images[0]) {
        const clickImageHandle = (evt) => {
            const src = evt.target?.dataset?.src ? evt.target.dataset.src : evt.target.src;
            new ImagePopout(src, { editable: false, shareable: true }).render(true);
        };
        on(images, "click", clickImageHandle);
    }
    const videos = find(".chat-media-image video", html);
    if (videos[0]) {
        const clickImageHandle = (evt) => {
            const src = evt.target?.dataset?.src ? evt.target.dataset.src : evt.target.src;
            new MediaPopout(src, { editable: false, shareable: true }).render(true);
        };
        on(videos, "click", clickImageHandle);
    }
};
