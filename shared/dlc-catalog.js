"use strict";

const DLC_CATALOG = [
    {
        id: "dlc_aurora",
        name: "Aurora Passage Pack",
        description:
            "Original glass chimes, rolling toms, and slowly opening northern synth textures.",
        game: "Cinematic Color",
        freeForNewUsers: true,
        priceCents: null,
    },
    {
        id: "dlc_ironwave",
        name: "Ironwave Pulse Pack",
        description:
            "Original driven basses, clipped kicks, and resonant metal percussion for night motion.",
        game: "Mechanical Pulse",
        freeForNewUsers: true,
        priceCents: null,
    },
    {
        id: "dlc_moonwell",
        name: "Moonwell Glass Pack",
        description:
            "Original watery toms, suspended bells, and breathable pad tones for quiet scenes.",
        game: "Dream Texture",
        freeForNewUsers: false,
        priceCents: 499,
    },
    {
        id: "dlc_sunforge",
        name: "Sunforge Ensemble Pack",
        description:
            "Original hand percussion, warm plucks, and bright melodic accents for energetic cues.",
        game: "Sunlit Ensemble",
        freeForNewUsers: false,
        priceCents: 499,
    },
    {
        id: "dlc_grandhall",
        name: "Grand Hall Brass Pack",
        description:
            "Original timpani, bold brass-style leads, and deep ceremonial low-end design.",
        game: "Dramatic Orchestra",
        freeForNewUsers: false,
        priceCents: 499,
    },
    {
        id: "dlc_fogline",
        name: "Fogline Atmosphere Pack",
        description:
            "Original muted snares, windlike pads, and descending effects for shadowed spaces.",
        game: "Haunted Ambience",
        freeForNewUsers: false,
        priceCents: 499,
    },
    {
        id: "dlc_mirrorbay",
        name: "Mirror Bay Sparkle Pack",
        description:
            "Original delicate hats, luminous bells, and compact plucks for reflective phrases.",
        game: "Crystal Coast",
        freeForNewUsers: false,
        priceCents: 499,
    },
    {
        id: "dlc_rushlight",
        name: "Rushlight Arcade Pack",
        description:
            "Original rapid kicks, sharp hats, and kinetic effects for high-energy pattern work.",
        game: "Neon Sprint",
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