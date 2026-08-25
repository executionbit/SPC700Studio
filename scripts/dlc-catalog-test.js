"use strict";

const { DLC_CATALOG, FREE_DLC_IDS } = require("../shared/dlc-catalog");

const paidPacks = DLC_CATALOG.filter((pack) => !pack.freeForNewUsers);
const ids = DLC_CATALOG.map((pack) => pack.id);

if (new Set(ids).size !== ids.length) {
    throw new Error("DLC catalog contains duplicate pack IDs.");
}
if (FREE_DLC_IDS.length !== 2) {
    throw new Error(
        `Expected exactly two complimentary new-user grants, found ${FREE_DLC_IDS.length}.`,
    );
}
if (paidPacks.length !== 6) {
    throw new Error(`Expected six paid DLC packs, found ${paidPacks.length}.`);
}
if (paidPacks.some((pack) => !Number.isInteger(pack.priceCents) || pack.priceCents <= 0)) {
    throw new Error("Every paid DLC pack must have a positive integer price.");
}
if (DLC_CATALOG.some((pack) => pack.freeForNewUsers && pack.priceCents !== null)) {
    throw new Error("Complimentary DLC packs must not have a paid price.");
}

console.log(
    `DLC catalog test passed: ${paidPacks.length} paid packs, ` +
        `${FREE_DLC_IDS.length} complimentary new-user grants.`,
);