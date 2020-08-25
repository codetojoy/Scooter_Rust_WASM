
export function mySleep(time_in_ms) {
  return new Promise((resolve) => setTimeout(resolve, time_in_ms));
}

export function getRandomInt(n) {
    let min = Math.ceil(1);
    let max = Math.floor(n);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function computePath(x1, y1, x2, y2, engine) {
    let passableCallback = function (x, y) {
        return engine.free_cell(x, y);
    }
    const astar = new ROT.Path.AStar(x1, y1, passableCallback, { topology: 4 });

    let path = [];
    let pathCallback = function (x, y) {
        path.push([x, y]);
    }
    astar.compute(x2, y2, pathCallback);

    return path;
}
