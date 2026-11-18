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

    if (DEBUG) console.group("AB Screenshot Indicator");

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
        const groupId = window.location.href.match(/\bid=(\d+)/)[1];
        const torrentId = torrentGroup.nextElementSibling.id.slice(8);
        const screenshotsNumber = await getScreenshots(groupId, torrentId);

        if (screenshotsNumber > 0) {
            const screenshotNode = document.createTextNode(` | 📷[${screenshotsNumber}]`);
            torrentGroup.querySelector("td > a").appendChild(screenshotNode);
        }
    }

    function addIndicatorAll() {
        document.querySelectorAll("tr.group_torrent").forEach(torrentGroup => addIndicator(torrentGroup));
    }

    function isSeriesAiring() {
        const title = document.querySelector("div:has(> div.linkbox) > h2");
        return title?.textContent.includes("[Airing]") || false
    }

    function addShortcut() {
        if (isSeriesAiring()) {
            if (DEBUG) console.debug("The anime is currently airing, there are no screenshots");
            return;
        }
        const shortcut = document.createElement("a");
        shortcut.href = "#";
        shortcut.textContent = "[Add screenshot indicators]";
        shortcut.addEventListener("click", addIndicatorAll);
        document.querySelector("div .linkbox").appendChild(shortcut);
    }

    addShortcut();

    if (DEBUG) console.groupEnd();
})();
