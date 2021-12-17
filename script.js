//Get canvas from html
const canvas = document.getElementById("main");

//Load sounds
const winSound = new Audio("sounds/win.wav");
const jumpSoundA = new Audio("sounds/jump.wav");
const jumpSoundB = new Audio("sounds/jump.wav");
const jumpSoundC = new Audio("sounds/jump.wav");
const bounceSound = new Audio("sounds/bounce.wav");
const dieSound = new Audio("sounds/die.wav");
const jumpSounds = [jumpSoundA, jumpSoundB, jumpSoundC];
var jumpsound = 0;
var loaded = false;

//Define game
G = {}
G.bestTimes = JSON.parse(window.localStorage.getItem("bestTimes"));
if (G.bestTimes == null) {
    G.bestTimes = {};
}
G.levelCount = 0;
G.record = false;
G.pack = 0;
G.level = 0;
G.playing = false;
G.timer = 0;
G.scene = "m";
G.ctx = canvas.getContext("2d");
G.ctx.fillStyle = "white";
G.ctx.fillRect(0, 0, 800, 600);
G.terminal = {};
G.terminal.x = 6;
G.terminal.y = 25;
G.terminal.vx = 0.4;
G.offset = {};
G.offset.x = 0;
G.offset.y = 0;
G.character = {};
G.character.x = 0;
G.character.y = 0;
G.character.vx = 0;
G.character.vy = 0;
G.character.width = 0;
G.character.height = 0;
G.character.collider = {};
G.character.collider.x = 0;
G.character.collider.y = 0;
G.character.collider.width = 0;
G.character.collider.height = 0;
G.version = "";
G.jumps = 0;
G.keys = {};
G.keys.left = false;
G.keys.right = false;
G.objects = [];
G.deco = [];
G.texts = [];

class Platform {
    constructor(x, y, width, height, type, power, boost) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.power = power;
        this.boost = boost;
    }
}
class Rect {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
}
class GameText {
    constructor(x, y, size, font, text, color, align = "left") {
        this.x = x;
        this.y = y;
        this.font = size + "px " + font;
        this.text = text;
        this.color = color;
        this.align = align;
    }
}
async function FetchFile(file) {
    try {
        let res = await fetch(file);
        return await res.json();
    } catch (err) {
        console.log(err.stack);
        console.log("ERROR FROM FetchFile");
    }
}
function CollisionDirection(object) {
    const root = G.character;
    //Get distances from each side
    var root_bottom = root.y + root.height;
    var object_bottom = object.y + object.height;
    var root_right = root.x + root.width;
    var object_right = object.x + object.width;

    var b_collision = object_bottom - root.y;
    var t_collision = root_bottom - object.y;
    var l_collision = root_right - object.x;
    var r_collision = object_right - root.x;

    //Return closest side
    if (
        t_collision == b_collision ||
        t_collision == l_collision ||
        t_collision == r_collision ||
        b_collision == l_collision ||
        b_collision == r_collision ||
        l_collision == r_collision
    ) {
        return;
    }
    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision && root.vy > 0) {
        return "t";
    }
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision && root.vy < 0) {
        return "b";
    }
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision && root.vx > 0) {
        return "l";
    }
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision && root.vx < 0) {
        return "r";
    }
    return;
}
function IsCollision(root, object) {
    //Detect if objects are overlapping
    var collision = false;
    if (
        root.x > object.x &&
        root.x < object.x + object.width &&
        root.y > object.y &&
        root.y < object.y + object.height
    ) {
        collision = true;
    } if (
        root.x + root.width > object.x &&
        root.x + root.width < object.x + object.width &&
        root.y > object.y &&
        root.y < object.y + object.height
    ) {
        collision = true;
    } if (
        root.x > object.x &&
        root.x < object.x + object.width &&
        root.y + root.height > object.y &&
        root.y + root.height < object.y + object.height
    ) {
        collision = true;
    } if (
        root.x + root.width > object.x &&
        root.x + root.width < object.x + object.width &&
        root.y + root.height > object.y &&
        root.y + root.height < object.y + object.height
    ) {
        collision = true;
    }
    return collision;
}
function LevelCollision(root) {
    //Run collision with every object in level
    var collisions = [];
    for (const object of G.objects) {
        var collision = IsCollision(root, object);
        if (collision) {
            collisions.push(object);
        }
    }
    return collisions;
}
function LoadLevel(levelid) {
    //Load level data from id
    G.character.vx = 0;
    G.character.vy = 0;
    G.terminal.x = 6;
    G.terminal.vx = 0.4;
    G.jumps = 0;
    console.log("LOADLEVEL: " + levelid);
    G.leveldata = null;
    for (const pack of G.levels) {
        for (const level of pack.levels) {
            if (level.id != levelid) {
                continue;
            }
            G.leveldata = level.level;
        }
    }
    if (G.leveldata == null) {
        return;
    }
    G.character.width = G.leveldata.character.width;
    G.character.height = G.leveldata.character.height;
    G.character.x = G.leveldata.spawn.x;
    G.character.y = G.leveldata.spawn.y;
    G.character.collider.width = G.leveldata.character.width;
    G.character.collider.height = G.leveldata.character.height;
    for (const object of G.leveldata.objects) {
        G.objects.push(new Platform(object.x, object.y, object.width, object.height, object.type, object.power, object.boost));
    }
    for (const deco of G.leveldata.decorations) {
        G.deco.push(new Rect(deco.x, deco.y, deco.width, deco.height, deco.color));
    }
    for (const text of G.leveldata.texts) {
        var align = "left"
        if ("align" in text) {
            align = text.align
        }
        G.texts.push(new GameText(text.x, text.y, text.size, text.font, text.text, text.color, align));
    }
    G.playing = true;
}
async function FetchLevel(file, pack, level) {
    //Fetch a level from a file or url
    let data = await FetchFile(file);
    if (data.gg) {
        return;
    }
    G.levels[pack].levels[level].level = data;
    G.levelsLoaded++;
}
async function FetchLevels() {
    //Fetch all levels from levels.json
    try {
        let levels = await FetchFile("./levels.json?r=" + Math.random());
        G.levels = levels;
        G.levelCount = 1;
        G.levelsLoaded = 0;
        for (const pack of G.levels) G.levelCount += pack.levels.length - 1;
        const version = await FetchFile("./version.json?r=" + Math.random());
        G.version = version.version;
        G.levelsLoaded += 1;
        for (let x = 0; x < G.levels.length; x++) {
            pack = G.levels[x];
            for (let y = 0; y < pack.levels.length; y++) {
                level = pack.levels[y];
                if (level.gg == true) {
                    continue;
                }
                FetchLevel(level.file, x, y);
            }
        }
        G.loadCheck = setInterval(function () {
            if (G.levelsLoaded == G.levelCount) {
                loaded = true;
                clearInterval(G.loadCheck);
            }
        }, 100);
    } catch (err) {
        console.log(err.stack);
        console.log("ERROR FROM FetchLevels");
    }
}
FetchLevels();
G.colors = [
    "#444444", //0: Normal
    "#666644", //1: Jump
    "#44aa44", //2: Bounce
    "#ee2222", //3: Lava
    "#44aaee", //4: Bounce Pad
    "#aaaa44", //5: Double Jump
    "#eeee44", //6: Triple Jump
    "#88aa44", //7: Jump Bounce Pad
    "", //8: None
    "#44ff44" //9: Goal
];
G.difficultyColors = [
    "#44dddd", //0
    "#44dd44", //1
    "#dddd44", //2
    "#ee8844", //3
    "#dd4444", //4
]
function Draw() {
    //Draw Menu
    if (G.scene == "m") {
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, 1200, 700);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Just Another Platformer", 600, 200);
        G.ctx.textBaseline = "bottom";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        //Draw if levels loaded
        if (loaded) {
            G.ctx.textAlign = "right";
            G.ctx.fillText("Ver. " + G.version, 1190, 698);
            G.ctx.textAlign = "center";
            G.ctx.fillText("Press JUMP to start", 600, 698);
            G.ctx.textBaseline = "middle";
            G.ctx.font = "32px 'Press Start 2P', sans-serif";
            G.ctx.fillText("< " + G.levels[G.pack].name + " >", 600, 350);
            G.ctx.font = "24px 'Press Start 2P', sans-serif";
            G.ctx.fillText((G.levels[G.pack].levels.length - 1) + " levels", 600, 400);
            G.ctx.textAlign = "right";
            G.ctx.fillText("Difficulty: ", 600, 450);
            G.ctx.fillText("Best Time: ", 600, 500);
            var difficulty = "[" + "X".repeat(G.levels[G.pack].difficulty + 1) + " ".repeat(4 - G.levels[G.pack].difficulty) + "]";
            G.ctx.fillStyle = G.difficultyColors[G.levels[G.pack].difficulty];
            G.ctx.textAlign = "left";
            G.ctx.fillText(difficulty, 600, 450);
            G.ctx.fillStyle = "black";
            if (G.bestTimes[G.levels[G.pack].id] == undefined) {
                G.ctx.fillText("N/A", 600, 500);
            } else {
                G.ctx.fillText(G.bestTimes[G.levels[G.pack].id].toFixed(2) + "s", 600, 500);
            }
        } else {
            G.ctx.textAlign = "center";
            G.ctx.textBaseline = "bottom";
            if (G.levelCount != 0) {
                G.ctx.fillText("Loading... (" + G.levelsLoaded + "/" + G.levelCount + ")", 600, 698);
            } else {
                G.ctx.fillText("Loading...", 600, 698);
            }
            G.ctx.textBaseline = "alphabetical";
        }
        //Draw game
    } if (G.scene == "g") {
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, 1200, 700);
        G.ctx.fillStyle = "#000000";
        G.ctx.fillRect(600 - (G.character.width / 2), 350 - (G.character.height / 2), G.character.width, G.character.height);
        for (const platform of G.objects) {
            G.ctx.fillStyle = G.colors[platform.type];
            if (platform.type == 4) {
                gval = parseInt(Math.min(platform.power * 12, 255)).toString(16);
                if (gval.length == 1) gval = "0" + gval;
                bval = parseInt(Math.min(platform.power * 20, 255)).toString(16);
                if (bval.length == 1) bval = "0" + bval;
                G.ctx.fillStyle = "#33" + gval + bval;
            }
            if (platform.type == 8) {
                rval = parseInt(Math.min((platform.boost - 0.1) * 300, 255)).toString(16);
                if (rval.length == 1) rval = "0" + rval;
                bval = parseInt(Math.min((platform.power - 1) * 18, 255)).toString(16);
                if (bval.length == 1) bval = "0" + bval;
                G.ctx.fillStyle = `#${rval}33${bval}`;
            }
            G.ctx.fillRect(platform.x + G.offset.x, platform.y + G.offset.y, platform.width, platform.height);
        }
        for (const deco of G.deco) {
            G.ctx.fillStyle = deco.color;
            G.ctx.fillRect(deco.x + G.offset.x, deco.y + G.offset.y, deco.width, deco.height);
        }
        for (const text of G.texts) {
            G.ctx.fillStyle = text.color;
            G.ctx.font = text.font;
            G.ctx.textAlign = text.align;
            G.ctx.fillText(text.text, text.x + G.offset.x, text.y + G.offset.y);
        }
        G.ctx.fillStyle = "#000000";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillStyle = "#eeeeee";
        G.ctx.fillRect(0, 0, 1400, 40);
        G.ctx.textAlign = "left";
        G.ctx.fillStyle = "#000000";
        G.ctx.textBaseline = "top";
        G.ctx.fillText("Time: " + G.timer.toFixed(2), 10, 10);
        G.ctx.textAlign = "right";
        G.ctx.textBaseline = "middle";
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.fillText(G.levels[G.pack].name + " - " + G.levels[G.pack].levels[G.level].name + " - " + (G.level + 1) + "/" + (G.levels[G.pack].levels.length - 1), 1190, 20);
        G.ctx.textAlign = "left";
        G.ctx.textBaseline = "alphabetic"
        //Draw end screen
    } if (G.scene == "e") {
        G.ctx.fillStyle = "#eeffee";
        G.ctx.fillRect(0, 0, 1200, 700);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("You Win!", 600, 350);
        G.ctx.font = "32px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Your Time: " + G.timer.toFixed(2) + " seconds", 600, 400);
        G.ctx.textBaseline = "bottom";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Press JUMP to continue", 600, 698);
        if (G.record) {
            G.ctx.fillStyle = "gold";
            G.ctx.fillText("New Record!", 600, 450);
        }
    }
}
//Detect key pressed
document.addEventListener('keydown', function (event) {
    //If in menu
    if (G.scene == "m" && loaded) {
        if (event.code == "Space") {
            LoadLevel(G.levels[G.pack].levels[G.level].id);
            G.vy = 0;
            G.vx = 0;
            G.scene = "g";
        }
        //Navigate menu
        if (event.code == "ArrowRight") {
            if (G.pack < G.levels.length - 1) {
                G.pack++;
            } else {
                G.pack = 0;
            }
        }
        if (event.code == "ArrowLeft") {
            if (G.pack > 0) {
                G.pack--;
            } else {
                G.pack = G.levels.length - 1;
            }
        }
    }
    if (event.code == "ArrowLeft") {
        G.keys.left = true;
    }
    else if (event.code == "ArrowRight") {
        G.keys.right = true;
    }
    else if (event.code == "Space" && G.jumps > 0) {
        jumpsound += 1;
        if (jumpsound > 2) {
            jumpsound = 0;
        }
        jumpSounds[jumpsound].play();
        G.character.vy = -6;
        G.jumps -= 1;
    }
    else if (event.code == "Space" && G.scene == "e") {
        G.scene = "m";
        G.timer = 0;
        G.level = 0;
        G.record = false;
    }
    else if (event.code == "KeyR" && G.scene == "g") {
        G.level = 0;
        G.timer = 0;
        G.objects = [];
        G.deco = [];
        G.texts = [];
        G.character.vy = 0;
        G.character.vx = 0;
        LoadLevel(G.levels[G.pack].levels[G.level].id);
    }
    else if (event.code == "KeyQ" && G.scene == "g") {
        G.level = 0;
        G.timer = 0;
        G.objects = [];
        G.deco = [];
        G.texts = [];
        G.scene = "m";
    }
});
//Key up
document.addEventListener('keyup', function (event) {
    if (event.code == "ArrowLeft") {
        G.keys.left = false;
    }
    else if (event.code == "ArrowRight") {
        G.keys.right = false;
    }
});
function Movement() {
    //Change character velocity
    if (G.keys.left && G.character.vx > -G.terminal.x) {
        G.character.vx -= G.terminal.vx;
    } if (G.keys.right && G.character.vx < G.terminal.x) {
        G.character.vx += G.terminal.vx;
    }
    if (G.character.vx < 0) {
        G.character.vx = Math.min(G.character.vx + 0.2, 0);
    } if (G.character.vx > 0) {
        G.character.vx = Math.max(G.character.vx - 0.2, 0);
    }
}
function Main() {
    //Increment timer
    if (G.playing) {
        G.timer = parseFloat((G.timer + 0.02).toFixed(2));
    }
    //Create character collider where it would be next frame
    G.character.collider.x = G.character.x + G.character.vx;
    G.character.collider.y = G.character.y + G.character.vy;
    Movement();
    //Collide with objects
    var collisions = LevelCollision(G.character.collider)
    if (collisions.length != 0) {
        var collide = true;
        //Loop through all collisions
        for (const collision of collisions) {
            const direction = CollisionDirection(collision);
            if (direction == "t") {
                G.jumps = 0;
                G.terminal.x = 6;
                G.terminal.vx = 0.4;
            }
            //Do stuff depending on object type
            if (collision.type == 3) {
                dieSound.play();
                G.terminal.x = 6;
                G.terminal.vx = 0.4;
                G.character.x = G.leveldata.spawn.x;
                G.character.y = G.leveldata.spawn.y;
                G.character.vx = 0;
                G.character.vy = 0;
                collide = false;
            } if (collision.type == 1 && direction == "t") {
                G.jumps = 1;
            } if (collision.type == 5 && direction == "t") {
                G.jumps = 2;
            } if (collision.type == 2 && G.character.vy > 4 && direction == "t") {
                bounceSound.play();
                G.character.vy = -G.character.vy * 0.65;
                collide = false;
            } if (collision.type == 6 && direction == "t") {
                G.jumps = 3;
            } if (collision.type == 4 && direction == "t") {
                jumpsound += 1;
                if (jumpsound > 2) {
                    jumpsound = 0;
                }
                jumpSounds[jumpsound].play();
                G.character.vy = -collision.power;
                collide = false;
            } if (collision.type == 8 && direction == "t") {
                G.terminal.x = collision.power;
                G.terminal.vx = collision.boost;
            } if (collision.type == 9) {
                //Game finished
                winSound.play();
                G.level += 1;
                G.objects = [];
                G.deco = [];
                G.texts = [];
                G.character.vy = 0;
                G.character.vx = 0;
                if (G.levels[G.pack].levels[G.level].gg == true) {
                    G.playing = false;
                    G.scene = "e";
                    if (G.bestTimes[G.levels[G.pack].id] == undefined) {
                        G.bestTimes[G.levels[G.pack].id] = G.timer;
                        G.record = true;
                        window.localStorage.setItem("bestTimes", JSON.stringify(G.bestTimes));
                    } else {
                        if (G.timer < G.bestTimes[G.levels[G.pack].id]) {
                            G.bestTimes[G.levels[G.pack].id] = G.timer;
                            G.record = true;
                            window.localStorage.setItem("bestTimes", JSON.stringify(G.bestTimes));
                        }
                    }
                } else {
                    LoadLevel(G.levels[G.pack].levels[G.level].id);
                }
                collide = false;
            } if (collision.type == 7 && G.character.vy > 4 && direction == "t") {
                bounceSound.play();
                G.character.vy = -G.character.vy * 0.65;
                G.jumps = 1;
                collide = false;
            }
            if (collide) {

                if (direction == "t") {
                    G.character.y = collision.y - G.character.height;
                    G.character.vy = 0;
                } else if (direction == "b") {
                    G.character.y = collision.y + collision.height;
                    G.character.vy = 0;
                } else if (direction == "l") {
                    G.character.x = collision.x - G.character.width;
                    G.character.vx = 0;
                } else if (direction == "r") {
                    G.character.x = collision.x + collision.width;
                    G.character.vx = 0;
                }
            }
        }
    }
    G.character.x += G.character.vx;
    G.character.y += G.character.vy;
    G.character.vy += 0.25;
    G.character.vy = Math.min(G.character.vy, G.terminal.y);
    G.offset.x = Math.round(-G.character.x + 1200 / 2 - G.character.width / 2);
    G.offset.y = Math.round(-G.character.y + 700 / 2 - G.character.height / 2);
    Draw();
}
const drawScreen = setInterval(function () {
    Main()
}, 20);