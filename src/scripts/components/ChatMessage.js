import MediaPopout from "../share-media/MediaPopout.js";
import { find, on } from "../utils/JqueryWrappers.js";

// Use namespaced ImagePopout for v13+ compatibility
const ImagePopoutImpl = foundry.applications?.apps?.ImagePopout || ImagePopout;

export const initChatMessage = (html) => {
    // Handle both jQuery objects (v12 and earlier) and HTMLElements (v13+)
    const isHTMLElement = html instanceof HTMLElement;

    let images;
    if (isHTMLElement) {
        images = html.querySelectorAll(".chat-media-image img");
    } else {
        images = find(".chat-media-image img", html);
    }

    if (images.length > 0 || (images[0] && !isHTMLElement)) {
        const clickImageHandle = (evt) => {
            const src = evt.target?.dataset?.src ? evt.target.dataset.src : evt.target.src;
            new ImagePopoutImpl(src, { editable: false, shareable: true }).render(true);
        };

        if (isHTMLElement) {
            images.forEach((img) => img.addEventListener("click", clickImageHandle));
        } else {
            on(images, "click", clickImageHandle);
        }
    }

    let videos;
    if (isHTMLElement) {
        videos = html.querySelectorAll(".chat-media-image video");
    } else {
        videos = find(".chat-media-image video", html);
    }

    if (videos.length > 0 || (videos[0] && !isHTMLElement)) {
        const clickVideoHandle = (evt) => {
            const src = evt.target?.dataset?.src ? evt.target.dataset.src : evt.target.src;
            new MediaPopout(src, { editable: false, shareable: true }).render(true);
        };

        if (isHTMLElement) {
            videos.forEach((video) => video.addEventListener("click", clickVideoHandle));
        } else {
            on(videos, "click", clickVideoHandle);
        }
    }
};
