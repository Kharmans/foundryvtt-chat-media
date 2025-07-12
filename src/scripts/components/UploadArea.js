import { before, create, find } from "../utils/JqueryWrappers.js";

const createUploadArea = () => create(`<div id="chat-media-chat-upload-area" class="hidden"></div>`);

const setupHorizontalScrolling = (uploadArea) => {
  const uploadAreaElement = uploadArea[0] || uploadArea;

  if (!uploadAreaElement) return;

  const handleWheel = (e) => {
    // Check if sidebar is expanded
    const sidebarContent = document.querySelector("#sidebar-content");
    const isExpanded = sidebarContent && sidebarContent.classList.contains("expanded");

    // Only convert vertical scroll to horizontal when sidebar is not expanded
    if (!isExpanded) {
      e.preventDefault();
      uploadAreaElement.scrollLeft += e.deltaY;
    }
  };

  uploadAreaElement.addEventListener("wheel", handleWheel, { passive: false });
};

export const initUploadArea = (sidebar) => {
  const uploadArea = createUploadArea();
  const chatMessage = find("#chat-message", sidebar);

  if (chatMessage[0]) {
    before(chatMessage, uploadArea);
  }

  // Setup horizontal scrolling functionality
  setupHorizontalScrolling(uploadArea);
};
