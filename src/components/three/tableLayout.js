/** Shared layout values updated when the GLB table is fitted to the scene. */
export const tableLayout = {
    topY: 0.72,
    playerZ: 2.35,
    dealerZ: 0.55,
    deckPosition: [4.1, 0.8, 0.45],
    radius: 5,
};

export function updateTableLayout(partial) {
    Object.assign(tableLayout, partial);
}
