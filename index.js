import { Engine, PlayerCore } from './pkg/scooter';

const Game = {
    display: null,
    engine: null,
    players: [],
    enemy: null,
    scheduler: null,

    init: function () {
        console.log("TRACER v 08.19 08:40 init ...");
        this.display = new ROT.Display({ width: 125, height: 50 })
        document.getElementById("scooterCanvas").appendChild(this.display.getContainer());

        this.engine = new Engine(this.display);
        this.generateMap();

        this.scheduler = new ROT.Scheduler.Simple();

        this.players.forEach(player => this.scheduler.add(player, true));
        this.scheduler.add(this.enemy, true);

        this.rotengine = new ROT.Engine(this.scheduler);
        this.rotengine.start();
    },

    generateMap: function () {
        const digger = new ROT.Map.Digger();
        const freeCells = [];

        let digCallback = function (x, y, value) {
            if (!value) {
                const key = x + "," + y;
                freeCells.push(key);
            }
            this.engine.on_dig(x, y, value);
        }
        digger.create(digCallback.bind(this));

        this.engine.draw_map();

        const p1 = this._createPlayer("B", "#FF00FF", "Beethoven", freeCells);
        this.players.push(p1);
        const p2 = this._createPlayer("C", "#FFFF00", "Chopin", freeCells);
        this.players.push(p2);
        const p3 = this._createPlayer("L", "#66FFFF", "Liszt", freeCells);
        this.players.push(p3);
        const p4 = this._createPlayer("M", "#FF8000", "Mozart", freeCells);
        this.players.push(p4);
        const p5 = this._createPlayer("P", "#8000FF", "Paganini", freeCells);
        this.players.push(p5);

        this.enemy = this._createBeing(BruttoBug, freeCells);
    },
};

Game._getPositionXYArray = function (freeCells) {
    const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    const key = freeCells.splice(index, 1)[0];
    const posArray = key.split(",");
    return posArray;
}

Game._createPlayer = function (id, hexColor, name, freeCells) {
    const parts = this._getPositionXYArray(freeCells);
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);
    return new Player(x, y, id, hexColor, name);
}

Game._createBeing = function (what, freeCells) {
    const parts = this._getPositionXYArray(freeCells);
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);
    return new what(x, y);
}

function computePath(x1, y1, x2, y2) {
    let passableCallback = function (x, y) {
        return Game.engine.free_cell(x, y);
    }
    const astar = new ROT.Path.AStar(x1, y1, passableCallback, { topology: 4 });

    let path = [];
    let pathCallback = function (x, y) {
        path.push([x, y]);
    }
    astar.compute(x2, y2, pathCallback);

    return path;
}

function handlePlayerCaught(meanieName, index) {
    const player = Game.players[index];
    const playerName = player.getName();
    const x = player.getX();
    const y = player.getY();

    alert(`${playerName} caught by ${meanieName}`);

    // remove player
    Game.scheduler.remove(player);
    Game.players[index] = null;
    // remove player icon
    Game.engine.redraw_at(x,y);
}

const BruttoBug = function (x, y) {
    this._core = new PlayerCore(x, y, "X", "red", Game.display, "Brutto Bug");
    this._core.draw();
    let targetIndex = this.getInitialTargetIndex(this._targetIndex);
    this._targetIndex = targetIndex;
    this._targetName = Game.players[this._targetIndex].getName();
    console.log(`TRACER Brutto Bug init target: ${this._targetName} index: ${this._targetIndex}`);

    BruttoBug.prototype.act = function () {
        const meanieName = this._core.name();
        const bx = this._core.x();
        const by = this._core.y();

        const targetIndex = this.getTargetIndex(this._targetIndex);
        this._targetIndex = targetIndex;
        this._targetName = Game.players[this._targetIndex].getName();
        // console.log(`TRACER Brutto Bug act target: ${this._targetName} index: ${this._targetIndex}`);

        // for all players that (a) not target (b) still active
        for (let playerIndex = 0; playerIndex < Game.players.length; playerIndex++) {
            let player = Game.players[playerIndex];
            this.checkPlayerForCatch(player, playerIndex, bx, by, meanieName);
        }

        // ------------------------

        const px = Game.players[this._targetIndex].getX();
        const py = Game.players[this._targetIndex].getY();
        let path = computePath(px, py, bx, by);

        path.shift();
        if (path.length <= 1) {
            Game.rotengine.lock();
            handlePlayerCaught(meanieName, this._targetIndex);

            let numPlayers = this.getNumRemainingPlayers();
            if (numPlayers === 1) {
                let winner = this.getWinnerName();
                alert(`**** ${winner} WINS ****`);
            } else {
                Game.rotengine.unlock();
            }
        } else {
            x = path[0][0];
            y = path[0][1];
            Game.engine.move_player(this._core, x, y);
        }
    }
}

BruttoBug.prototype.checkPlayerForCatch = function (player, playerIndex, bx, by, meanieName) {
    if ((player !== null) && (playerIndex !== this._targetIndex) && (! this.isPlayerInactive(player))) {
        const px = player.getX();
        const py = player.getY();
        let path = computePath(px, py, bx, by);

        path.shift();
        if (path.length <= 1) {
            Game.rotengine.lock();
            console.log(`TRACER Brutto Bug collateral catch: ${player.getName()}`);
            handlePlayerCaught(meanieName, playerIndex);
            Game.rotengine.unlock();
        }
    }
}

BruttoBug.prototype.getWinnerName = function () {
    let result = "";

    Game.players.forEach( function(player) {
        if (player) {
            result = player.getName();
        }
    });

    return result;
}

BruttoBug.prototype.getNumRemainingPlayers = function () {
    let result = 0;

    Game.players.forEach( function(player) {
        if (player) {
            result++;
        }
    });

    return result;
}

BruttoBug.prototype.isPlayerInactive = function (index) {
    return (Game.players[index] === null); //  || (! Game.players[index]));
}

BruttoBug.prototype.getInitialTargetIndex = function (targetIndex) {
    let result = getRandomInt(Game.players.length) - 1;
    return result;
}

BruttoBug.prototype.getTargetIndex = function (targetIndex) {
    let result = targetIndex;

    if (this.isPlayerInactive(targetIndex)) {
        // choose a new target
        let isDone = false;
        while (!isDone) {
            result = getRandomInt(Game.players.length) - 1;
            if (! this.isPlayerInactive(result)) {
                isDone = true;
            }
        }
        console.log(`TRACER gTI new target index: ${result}`);
    }

    return result;
}

// ------------

function mySleep(time_in_ms) {
  return new Promise((resolve) => setTimeout(resolve, time_in_ms));
}

function getRandomInt(n) {
    let min = Math.ceil(1);
    let max = Math.floor(n);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playerAct() {
    Game.rotengine.lock();
    const seed = getRandomInt(20);
    const point = Game.engine.get_random_free_cell(seed);
    // console.log(`TRACER random seed: ${seed} x: ${point.x} y: ${point.y}`);

    let x = point.x;
    let y = point.y;

    const px = this._core.x();
    const py = this._core.y();
    let path = computePath(x, y, px, py);

    path.shift();
    if (path.length <= 1) {
        console.log("TRACER player is stuck...");
    } else {
        x = path[0][0];
        y = path[0][1];
        Game.engine.move_player(this._core, x, y);
    }

    // sleep
    const delay_in_ms = 100;
    mySleep(delay_in_ms).then(() => {
        // unlock
        Game.rotengine.unlock();
    });
}

// ------------

let Player = function (x, y, id, hexColor, name) {
    this._core = new PlayerCore(x, y, id, hexColor, Game.display, name);
    this._core.draw();
}

Player.prototype.act = playerAct;
Player.prototype.getX = function () { return this._core.x(); }
Player.prototype.getY = function () { return this._core.y(); }
Player.prototype.getName = function () { return this._core.name(); }

Game.init();

export function stats_updated(stats) {
    document.getElementById("hitpoints").textContent = stats.hitpoints;
    document.getElementById("max_hitpoints").textContent = stats.max_hitpoints;
    document.getElementById("moves").textContent = stats.moves;
    document.getElementById("x").textContent = stats.x;
    document.getElementById("y").textContent = stats.y;
}
