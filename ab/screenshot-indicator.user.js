// ==UserScript==
// @name        AB - Screenshot Indicator
// @author      Perilune
// @version     0.1
// @namespace   https://github.com/soranosita
// @include     https://animebytes.tv/torrents.php?*id=*
// @icon        https://animebytes.tv/favicon.ico
// @grant       none
// ==/UserScript==


async function getScreenshots(groupId, torrentId) {
    const url = `https://animebytes.tv/torrents.php?id=${groupId}&torrentid=${torrentId}&screenshots=${torrentId}`;
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const collage = doc.querySelector(`#collage_${torrentId}`);
    return (collage === "null") ? 0 : collage.querySelectorAll("td:not([colspan])").length;
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


function addShortcut() {
    const shortcut = document.createElement("a");
    shortcut.href = "#";
    shortcut.textContent = "[Add screenshot indicators]";
    shortcut.addEventListener("click", addIndicatorAll);
    document.querySelector("div .linkbox").appendChild(shortcut);
}


addShortcut();
