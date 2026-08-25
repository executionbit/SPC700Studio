"use strict";

const {
    getUncachableStripeClient,
} = require("../server/stripe-client");
const { DLC_CATALOG } = require("../shared/dlc-catalog");

async function seedDlcProducts() {
    const stripe = await getUncachableStripeClient();
    for (const pack of DLC_CATALOG.filter((item) => !item.freeForNewUsers)) {
        const products = await stripe.products.search({
            query: `metadata['dlc_pack_id']:'${pack.id}'`,
        });
        const product =
            products.data[0] ||
            (await stripe.products.create({
                name: pack.name,
                description: pack.description,
                metadata: { dlc_pack_id: pack.id },
            }));
        const prices = await stripe.prices.list({
            product: product.id,
            active: true,
            type: "one_time",
            limit: 100,
        });
        const price =
            prices.data.find(
                (candidate) => candidate.metadata?.dlc_pack_id === pack.id,
            ) ||
            (await stripe.prices.create({
                product: product.id,
                unit_amount: pack.priceCents,
                currency: "usd",
                metadata: { dlc_pack_id: pack.id },
            }));
        if (
            product.metadata?.dlc_pack_id !== pack.id ||
            price.metadata?.dlc_pack_id !== pack.id ||
            price.unit_amount !== pack.priceCents ||
            price.currency !== "usd" ||
            price.type !== "one_time"
        ) {
            throw new Error(
                `${pack.id}: Stripe product or price metadata/amount is invalid.`,
            );
        }
        console.log(`${pack.id}: ${product.id} / ${price.id}`);
    }
}

seedDlcProducts().catch((error) => {
    console.error("DLC Stripe seed failed:", error.message);
    process.exit(1);
});