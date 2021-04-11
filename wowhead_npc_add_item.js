// ==UserScript==
// @name         Wowhead npc add item
// @namespace    https://github.com/vgresak/
// @version      0.1.0
// @description  Creates button to copy wowhead item into ".npc add item [id]"
// @author       Viktor Grešák
// @match        https://www.wowhead.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @run-at       document-end
// ==/UserScript==

const hrefItemRegex = /\/item=(\d+).*/;
(async function () {
    'use strict';


    let initPage = async function () {
        console.info("Initializing extension.");

        if (!isPageReady()) {
            setTimeout(initPage, 1000);
            return;
        }

        console.info("Adding buttons.");
        await addButtons();
    };

    let isPageReady = function () {
        let tabItems = $("#tab-items");
        let transmog = $("#transmog");
        return tabItems.length || transmog.length || isItemPage();
    };

    let addButtons = async function () {
        if (isItemPage()) {
            console.log("Concrete item page - adding single button")
            addItemPageButton();
        }


        $("#tab-items a.listview-cleartext").filter(hasItemHref).after(addCopyBtn);

        $("#tab-items .copyBtn").each(function () {
            let td = $(this).closest("tr").find("td:first");
            $(this).detach().prependTo(td);
        });

        $("#transmog a").filter(hasItemHref).filter(function () { return $(this).text() !== "" }).before(addCopyBtn);


    };

    await initPage();
})();

function addCopyBtn() {
    let match = hrefItemRegex.exec($(this).attr("href"));
    const btn = $("<button class=\"copyBtn\">Copy</button>");
    btn.click((e) => {
        e.preventDefault();
        copyCmdToClipboard(match[1]);
    });
    return btn;
}

function hasItemHref() {
    return hrefItemRegex.test($($(this)).attr("href"));
}

function addItemPageButton() {
    const btn = $("<button>Copy</button>");
    btn.prependTo($("#main-contents"));
    btn.click(() => {
        copyCmdToClipboard(getItemIdFromPageUrl());
    });
}

function isItemPage() {
    return getItemIdFromPageUrl() !== -1;
}

function getItemIdFromPageUrl() {
    const wowheadItemUrlRegex = /.*wowhead\.com\/item=(\d+)/;
    let regexRes = wowheadItemUrlRegex.exec(window.location.href);
    if (regexRes === null) {
        return -1;
    }
    return regexRes[1];
}

function copyCmdToClipboard(id) {
    const copyInput = $(`<input type="text" id="wowheadCopyInput"/>`);
    copyInput.val(".npc add item " + id)
    const body = $("body");
    copyInput.appendTo(body);
    copyInput.select();
    copyInput.focus();
    document.execCommand("copy");
    copyInput.remove();
}
