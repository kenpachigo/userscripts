// ==UserScript==
// @name        AB - Screenshot Indicator
// @author      Perilune
// @version     0.1
// @namespace   https://github.com/soranosita
// @include     https://animebytes.tv/torrents.php?*id=*
// @icon        https://animebytes.tv/favicon.ico
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    const DEBUG = false; // set to `true` for debugging

    const logger = (() => {
        const prefix = "[AB Screenshot Indicator]";

        return {
            log: console.log.bind(console, prefix),
            debug: console.debug.bind(console, prefix),
            warn: console.warn.bind(console, prefix),
        }
    })();

    async function getScreenshots(groupId, torrentId) {
        const url = `https://animebytes.tv/torrents.php?id=${groupId}&torrentid=${torrentId}&screenshots=${torrentId}`;
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const collage = doc.querySelector(`#collage_${torrentId}`);
        return collage?.querySelectorAll("td:not([colspan])").length || 0;
    }

    async function addIndicator(torrentGroup) {
        // Prevent to duplicate indicator
        if (torrentGroup.querySelector(".screenshot-indicator")) {
            if (DEBUG) logger.warn("Indicator already added");
            return;
        }

        const groupId = window.location.href.match(/\bid=(\d+)/)[1];
        const torrentId = torrentGroup.nextElementSibling.id.slice(8);
        const screenshotsNumber = await getScreenshots(groupId, torrentId);

        if (screenshotsNumber > 0) {
            const span = document.createElement("span");
            span.textContent = `🖼️ (${screenshotsNumber})`;
            span.title = `${screenshotsNumber} screenshots`;
            span.classList.add("screenshot-indicator");

            const torrentItem = torrentGroup.querySelector("td > a");
            torrentItem.appendChild(document.createTextNode(" | "));
            torrentItem.appendChild(span);
        }
    }

    function addIndicatorAll() {
        document.querySelectorAll("tr.group_torrent").forEach(torrentGroup => addIndicator(torrentGroup));
    }

    function addShortcut() {
        const shortcut = document.createElement("a");
        shortcut.id = "showScreenIndicator";
        shortcut.href = "#";
        shortcut.textContent = "[Add screenshot indicators]";
        shortcut.addEventListener("click", addIndicatorAll);
        document.querySelector("div .linkbox").appendChild(shortcut);
    }

    function isSeriesAiring() {
        const title = document.querySelector("div:has(> div.linkbox) > h2");
        return title?.textContent.includes("[Airing]") || false
    }

    if (isSeriesAiring()) {
        if (DEBUG) logger.debug("The anime is currently airing, there are no screenshots");
        return;
    }

    addShortcut();
})();
