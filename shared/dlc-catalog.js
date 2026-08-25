"use strict";

const DLC_CATALOG = [
    {
        id: "dlc_chrono",
        name: "Chrono Trigger: 1999 A.D. Pack",
        description:
            "Time portal ambient synths, 16-bit epoch drums, and futuristic Blade FX.",
        game: "SNES Classic",
        freeForNewUsers: true,
        priceCents: null,
    },
    {
        id: "dlc_megaman",
        name: "Mega Man X: Maverick Arsenal",
        description:
            "Charging buster blasts, metallic industrial drum loops, and dash sound FX.",
        game: "SNES Action",
        freeForNewUsers: true,
        priceCents: null,
    },
    {
        id: "dlc_zelda",
        name: "Zelda: Link to the Past Triforce Kit",
        description:
            "Secret discovery jingles, fairy sparkles, and subterranean dungeon drums.",
        game: "Adventure RPG",
        freeForNewUsers: false,
        priceCents: 499,
    },
];

const DLC_BY_ID = new Map(DLC_CATALOG.map((pack) => [pack.id, pack]));
const FREE_DLC_IDS = DLC_CATALOG.filter((pack) => pack.freeForNewUsers).map(
    (pack) => pack.id,
);

function getDlcPack(packId) {
    return DLC_BY_ID.get(packId) || null;
}

module.exports = { DLC_CATALOG, FREE_DLC_IDS, getDlcPack };