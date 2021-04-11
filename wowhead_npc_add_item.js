// ==UserScript==
// @name         Wowhead npc add item
// @namespace    https://github.com/vgresak/
// @version      0.2.0
// @description  Creates button to copy wowhead item into ".npc add item [id]"
// @author       Viktor Grešák
// @match        https://www.wowhead.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @run-at       document-end
// ==/UserScript==

GM_addStyle(`
    .copyBtn{
        margin: 2px; 
        padding: 2px; 
        border: 1px solid #ffd100;
    }
`);

const hrefItemRegex = /\/item=(\d+).*/;
(async function () {
    'use strict';
    setInterval(initPage, 1000);
})();

function initPage() {
    console.info("Initializing extension.");
    if (!isPageReady()) {
        return;
    }
    console.info("Adding buttons.");
    addButtons();
};

function isPageReady() {
    const hasItemLinks = $("a").filter(hasItemHref).filter(hasText).length;
    return hasItemLinks || isItemPage();
};

function addButtons() {
    if (isItemPage() && hasNoItemPageButton()) {
        console.log("Concrete item page - adding single button")
        addItemPageButton();
    }
    const itemLinks = $("a")
        .filter(hasItemHref)
        .filter(hasText)
        .filter(":not(.copyBtnAdded)")
        .filter(notInHeader);
    itemLinks.each(function () {
        $(this).addClass("copyBtnAdded");
    });
    itemLinks.before(addCopyBtn);
};

function hasText() {
    return $(this).text() !== "";
}

function addCopyBtn() {
    let match = hrefItemRegex.exec($(this).attr("href"));
    const btn = $("<a class=\"copyBtn\">Copy</a>");
    btn.click((e) => {
        e.preventDefault();
        copyCmdToClipboard(match[1]);
    });
    return btn;
}

function hasItemHref() {
    return hrefItemRegex.test($($(this)).attr("href"));
}

function hasNoItemPageButton() {
    return $("#itemPageCopyBtn").length === 0;
}

function addItemPageButton() {
    const btn = $("<a class=\"copyBtn\" id=\"itemPageCopyBtn\">Copy</a>");
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

function notInHeader () {
    return $(this).closest(".header-right").length === 0;
}