/** High-contrast count/EV colors for dark casino UI. */

export function countValueClass(value) {
    if (value > 0) {
        return 'text-green-400';
    }
    if (value < 0) {
        return 'text-red-400';
    }
    return 'text-white';
}

export function countBadgeClass(delta) {
    if (delta > 0) {
        return 'border-green-500/70 bg-green-500/25 text-green-300';
    }
    if (delta < 0) {
        return 'border-red-500/70 bg-red-500/25 text-red-300';
    }
    return 'border-white/25 bg-white/10 text-white/85';
}

export function countStatCellClass(value) {
    if (value > 0) {
        return 'border-green-500/40 bg-green-950/50';
    }
    if (value < 0) {
        return 'border-red-500/40 bg-red-950/50';
    }
    return 'border-white/10 bg-black/35';
}

export function evValueClass(value) {
    return countValueClass(value);
}
