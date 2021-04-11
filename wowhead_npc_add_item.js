// ==UserScript==
// @name         Wowhead npc add item
// @namespace    https://github.com/vgresak/
// @version      0.3.0
// @description  Creates button to copy wowhead item into ".npc add item [id]". Command can also be changed via [Set cmd] button.
// @author       Viktor Grešák
// @match        https://www.wowhead.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @run-at       document-end
// ==/UserScript==

GM_addStyle(`
    #wowheadExtSetCmd, .copyBtn{
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
    if (!isPageReady()) {
        return;
    }
    addButtons();
};

function isPageReady() {
    const hasItemLinks = $("a").filter(hasItemHref).filter(hasText).length;
    return hasItemLinks || isItemPage();
};

function addButtons() {
    if (hasNoSetCmdButton()) {
        console.log("Adding [Set cmd] button");
        addSetCmdButton();
    }
    if (isItemPage() && hasNoItemPageButton()) {
        console.log("Concrete item page - adding single button");
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

function hasNoSetCmdButton() {
    return $("#wowheadExtSetCmd").length === 0;
}

function addSetCmdButton() {
    let setCmdBtn = $("<a id=\"wowheadExtSetCmd\">Set cmd</a>");
    setCmdBtn.click(async function () {
        const existingVal = await GM_getValue("wowheadExtCmd", ".npc add item");
        let newVal = prompt("Set new command", existingVal);
        if (newVal !== null) {
            await GM_setValue("wowheadExtCmd", newVal);
        }
    });
    $("#main-contents").prepend(setCmdBtn);
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

function hasNoItemPageButton() {
    return $("#itemPageCopyBtn").length === 0;
}

function addItemPageButton() {
    const btn = $("<a class=\"copyBtn\" id=\"itemPageCopyBtn\">Copy</a>");
    btn.prependTo($("#main-contents"));
    btn.click(async () => {
        await copyCmdToClipboard(getItemIdFromPageUrl());
    });
}

async function copyCmdToClipboard(id) {
    let cmd = await GM_getValue("wowheadExtCmd", ".npc add item");
    const copyInput = $(`<input type="text" id="wowheadCopyInput"/>`);
    copyInput.val(`${cmd} ${id}`);
    const body = $("body");
    copyInput.appendTo(body);
    copyInput.select();
    copyInput.focus();
    document.execCommand("copy");
    copyInput.remove();
}

function hasItemHref() {
    return hrefItemRegex.test($($(this)).attr("href"));
}

function hasText() {
    return $(this).text() !== "";
}

function notInHeader() {
    return $(this).closest(".header-right").length === 0;
}

function addCopyBtn() {
    let match = hrefItemRegex.exec($(this).attr("href"));
    const btn = $("<a class=\"copyBtn\">Copy</a>");
    btn.click(async (e) => {
        e.preventDefault();
        await copyCmdToClipboard(match[1]);
    });
    return btn;
}