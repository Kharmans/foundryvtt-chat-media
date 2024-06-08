import CONSTANTS from "../constants.js";

export const ORIGIN_FOLDER = "data";
export const i18n = (text) => game.i18n.localize(`${CONSTANTS.MODULE_NAME}.${text}`);
export const randomString = () =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
export const userCanUpload = (silent = false) => {
    const userRole = game?.user?.role;
    const fileUploadPermissions = game?.permissions?.FILES_UPLOAD;

    if (!userRole || !fileUploadPermissions) {
        if (!silent) ui.notifications?.warn(i18n("uploadPermissions"));
        return false;
    }

    const uploadPermission = fileUploadPermissions.includes(userRole);
    if (!uploadPermission && !silent) ui.notifications?.warn(i18n("uploadPermissions"));

    return uploadPermission;
};
