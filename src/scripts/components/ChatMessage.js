import MediaPopout from "../share-media/MediaPopout.js";
import { find, on } from "../utils/JqueryWrappers.js";

const ImagePopoutImpl = foundry.applications?.apps?.ImagePopout;

export const initChatMessage = (html) => {
  let images;
  images = html.querySelectorAll(".chat-media-image img");

  if (images.length > 0) {
    /** @param {MouseEvent} evt */
    const clickImageHandle = (evt) => {
      const target = /** @type {HTMLImageElement} */ (evt.currentTarget);
      const src = target.dataset.src ?? target.src;

      const options = { src: src, editable: false, shareable: true };
      new ImagePopoutImpl(options).render(true);
    };

    images.forEach((img) => img.addEventListener("click", clickImageHandle));
  }

  let videos;
  videos = html.querySelectorAll(".chat-media-image video");

  if (videos.length > 0) {
    /** @param {MouseEvent} evt */
    const clickVideoHandle = (evt) => {
      const target = /** @type {HTMLVideoElement} */ (evt.currentTarget);

      // Check if video is in fullscreen mode
      if (
        document.fullscreenElement === target ||
        document.webkitFullscreenElement === target ||
        document.mozFullScreenElement === target ||
        document.msFullscreenElement === target
      ) {
        console.log("Chat Media: Video is in fullscreen, not opening popout");
        return;
      }

      // Always prevent default to stop video play/pause
      evt.preventDefault();
      evt.stopPropagation();

      // More robust detection of clicks on video controls
      const rect = target.getBoundingClientRect();
      const clickX = evt.clientX - rect.left;
      const clickY = evt.clientY - rect.top;

      // Check if video has controls visible
      const hasControls = target.hasAttribute("controls");

      if (hasControls) {
        // Controls are typically at the bottom of the video
        // Use a more conservative approach - check bottom 15% of video height
        const controlsHeight = Math.max(30, rect.height * 0.15);
        const isClickOnControls = clickY > rect.height - controlsHeight;

        if (isClickOnControls) {
          console.log("Chat Media: Click detected on video controls area, not opening popout");

          // Manually trigger control behavior since we prevented default
          // For clicks on controls, we simulate the click behavior
          setTimeout(() => {
            // Check what control was likely clicked based on position
            const controlAreaCenter = rect.width / 2;
            const isNearPlayButton = Math.abs(clickX - controlAreaCenter) < 50;

            if (isNearPlayButton) {
              // Toggle play/pause
              if (target.paused) {
                target.play().catch((err) => console.log("Play failed:", err));
              } else {
                target.pause();
              }
            }
          }, 10);

          return;
        }
      }

      // Clear any existing timeout
      if (target.dataset.clickTimeout) {
        clearTimeout(parseInt(target.dataset.clickTimeout));
        delete target.dataset.clickTimeout;
      }

      // Use a timeout to allow for double-click detection
      const clickTimeout = setTimeout(() => {
        // Check if we're not in a double-click scenario
        if (!target.dataset.doubleClickFlag) {
          // Open the media popout
          const src = target.dataset.src ?? target.src;
          const mediaPopout = new MediaPopout(src, { editable: false, shareable: true });
          mediaPopout.render(true);
        }

        delete target.dataset.clickTimeout;
        delete target.dataset.doubleClickFlag;
      }, 300); // 300ms delay to allow for double-click

      // Store timeout ID for potential clearing
      target.dataset.clickTimeout = clickTimeout.toString();
    };

    /** @param {MouseEvent} evt */
    const dblClickVideoHandle = (evt) => {
      const target = /** @type {HTMLVideoElement} */ (evt.currentTarget);

      console.log("Chat Media: Double-click detected, allowing fullscreen");

      // Set flag to indicate we're in a double-click scenario
      target.dataset.doubleClickFlag = "true";

      // Clear the single-click timeout to prevent popout
      if (target.dataset.clickTimeout) {
        clearTimeout(parseInt(target.dataset.clickTimeout));
        delete target.dataset.clickTimeout;
      }

      // Request fullscreen manually since we prevented default on single clicks
      if (target.requestFullscreen) {
        target.requestFullscreen().catch((err) => {
          console.log("Chat Media: Fullscreen request failed:", err);
        });
      } else {
        // Try vendor-prefixed methods
        const targetAny = /** @type {any} */ (target);
        if (targetAny.webkitRequestFullscreen) {
          targetAny.webkitRequestFullscreen();
        } else if (targetAny.mozRequestFullScreen) {
          targetAny.mozRequestFullScreen();
        } else if (targetAny.msRequestFullscreen) {
          targetAny.msRequestFullscreen();
        }
      }

      // Clean up the flag after a delay
      setTimeout(() => {
        delete target.dataset.doubleClickFlag;
      }, 500);
    };

    videos.forEach((video) => {
      video.addEventListener("click", clickVideoHandle);
      video.addEventListener("dblclick", dblClickVideoHandle);
    });
  }
};
