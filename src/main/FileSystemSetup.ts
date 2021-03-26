const jetpack = require('fs-jetpack').cwd(process.env.HOME);
const path = require('path');

const BASE_APPDATA_DIR = process.env.APPDATA || (process.platform === 'darwin' ? `${process.env.HOME}/Library/Preferences` : `${process.env.HOME}/.local/share`);

const COMPANY_DIR = "Breadbrothers Games";
const ENGINE_DIR = "Crutstation Engine";
const BREADITOR_DIR = "Breaditor";

const MOST_RECENT_FILES_JSON = "$$$_BREDITOR_MOST_RECENT.json";

const APPDATA_DIR = jetpack.path(BASE_APPDATA_DIR, COMPANY_DIR, ENGINE_DIR, BREADITOR_DIR);
const MOST_RECENT_FILES_JSON_PATH = jetpack.path(APPDATA_DIR, MOST_RECENT_FILES_JSON);

const createDirectoriesIfNecessary = () => {
    if( jetpack.exists(APPDATA_DIR) ) {
        return;
    }

    jetpack.write(MOST_RECENT_FILES_JSON_PATH, "{}");
};

const getJetpack = () => {
    createDirectoriesIfNecessary();
    jetpack.cwd(APPDATA_DIR);
    return jetpack;
}

const getMostRecentFilesJSONPath = () => {
    return MOST_RECENT_FILES_JSON_PATH;
};

export const BREADPATH = {
    createDirectoriesIfNecessary,
    getMostRecentFilesJSONPath,
    getJetpack
};