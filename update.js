
export function stats_updated(stats) {
    document.getElementById("hitpoints").textContent = stats.hitpoints;
    document.getElementById("max_hitpoints").textContent = stats.max_hitpoints;
    document.getElementById("moves").textContent = stats.moves;
    document.getElementById("x").textContent = stats.x;
    document.getElementById("y").textContent = stats.y;
}
