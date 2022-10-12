/*
GAME STATES (* = not done)
m: menu
l: level select
g: game
e: end screen
p: patch notes*
t: leaderboards*
c: settings
cr: rebind controls
r: register
s: sign in
*/

//Get canvas from html
const canvas = document.getElementById("main");

//Load sounds
const winSound = new Audio("assets/sounds/win.wav");
const jumpSoundA = new Audio("assets/sounds/jump.wav");
const jumpSoundB = new Audio("assets/sounds/jump.wav");
const jumpSoundC = new Audio("assets/sounds/jump.wav");
const bounceSound = new Audio("assets/sounds/bounce.wav");
const dieSound = new Audio("assets/sounds/die.wav");
const jumpSounds = [jumpSoundA, jumpSoundB, jumpSoundC];
var jumpsound = 0;
var loaded = false;

//Define game
if (typeof G == 'undefined') {
    G = {};
}
G.levelCount = 0;
G.record = false;
G.pack = 0;
G.level = 0;
G.playing = false;
G.timer = 0;
G.offline = false;
G.ac = 0;
G.updated = false;
G.crerror = false;
G.crcooldown = 0;
G.bind = -1;
G.scene = "m";
G.regname = /\w/;
G.regpass = /\w|[!@#$%^&*+=]/;
G.regmail = /\w|[!@#$%^&*+=.]/;
G.password = "";
G.username = "";
G.confirm = "";
G.email = "";
G.rerror = "";
G.nav = 0;
G.signedin = false;
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
PlayFab.settings.titleId = 68593;
G.GUID = window.localStorage.getItem("guid");
G.newUser = false;

//get window size
resize = null;
G.width = window.innerWidth;
G.height = window.innerHeight;
G.xmid = Math.round(G.width / 2);
G.ymid = Math.round(G.height / 2);
canvas.width = G.width;
canvas.height = G.height;
//on window resize
window.addEventListener('resize', function () {
    canvas.style.display = "none";
    clearTimeout(resize);
    G.width = window.innerWidth;
    G.height = window.innerHeight;
    G.xmid = Math.round(G.width / 2);
    G.ymid = Math.round(G.height / 2);
    canvas.width = G.width;
    canvas.height = G.height;
    resize = setTimeout(function () {canvas.style.display = ""}, 250);
});

if (G.GUID === null) {
    G.GUID = crypto.randomUUID()
    window.localStorage.setItem("guid", G.GUID);
    G.newUser = true;
}
G.signedin = JSON.parse(window.localStorage.getItem("signedin"));
if (G.signedin === null) {
    G.signedin = false;
    window.localStorage.setItem("signedin", JSON.stringify(G.signedin));
}
G.bindings = JSON.parse(window.localStorage.getItem("controls"));
if (G.bindings === null) {
    G.bindings = {
        left: "ArrowLeft",
        right: "ArrowRight",
        jump: "Space",
        quit: "Escape",
        retry: "KeyR"
    }
    SaveBindings();
}
G.player = {};
function SaveBindings() {
    window.localStorage.setItem("controls", JSON.stringify(G.bindings));
}
G.bestTimes = {};

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
    const root = G.character.collider;
    //Get distances from each side
    var root_bottom = (root.y - 0.25) + root.height;
    var object_bottom = object.y + object.height;
    var root_right = root.x + root.width;
    var object_right = object.x + object.width;

    var b_collision = object_bottom - (root.y - 0.25);
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
    ) return;
    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision) return "t";
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) return "b";
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) return "l";
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision) return "r";
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
    const index = G.filesLoading.indexOf(file);
    if (index > -1) {
        G.filesLoading.splice(index, 1);
    }
    G.levelsLoaded++;
}
async function FetchImage(file, name) {
    const image = new Image();
    image.onload = function () {
        G["texture" + name] = G.ctx.createPattern(this, "repeat");
        G.levelsLoaded++;
    }
    image.src = file;
}
async function FetchLevels() {
    //Fetch all levels from levels.json
    try {

        G.levelsLoaded = 0;
        G.levelCount = 0;
        G.filesLoading = [];
        //Load images
        G.levelCount += 10;
        FetchImage("assets/img/texture_goal.png", "Goal");
        FetchImage("assets/img/texture_jump_1.png", "Jump1");
        FetchImage("assets/img/texture_jump_2.png", "Jump2");
        FetchImage("assets/img/texture_jump_3.png", "Jump3");
        FetchImage("assets/img/texture_bounce.png", "Bounce");
        FetchImage("assets/img/texture_bounce_jump.png", "BounceJump");
        FetchImage("assets/img/texture_lava.png", "Lava");
        FetchImage("assets/img/texture_jump_1.png", "Jump1");
        FetchImage("assets/img/texture_bounce_pad.png", "BouncePad");
        FetchImage("assets/img/texture_boost.png", "Boost");

        G.levelCount += 2;
        G.authRequest = {};
        G.authRequest.TitleId = PlayFab.settings.titleId;
        G.authRequest.CustomId = G.GUID;
        if (G.newUser) G.authRequest.CreateAccount = true;
        else G.authRequest.CreateAccount = false;
        PlayFabClientSDK.LoginWithCustomID(G.authRequest, (response, error) => {
            if (error) {
                console.error(error)
                G.offline = true;
                G.levelsLoaded += 2;
            }
            else {
                // display account details
                var result = response.data;
                G.player.id = result.PlayFabId;
                G.levelsLoaded++;

                PlayFabClientSDK.GetUserData({}, (response, error) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        // display account details
                        var result = response.data;
                        if (result.Data.bestTimes === undefined) {
                            G.bestTimes = {};
                        } else {
                            G.bestTimes = JSON.parse(result.Data.bestTimes.Value);
                        }
                        G.levelsLoaded++;
                    }
                });
            }
        });

        //Load levels
        G.levelCount += 3;
        G.levels = await FetchFile("./assets/levels.json?r=" + Math.random());
        for (const pack of G.levels) G.levelCount += pack.levels.length - 1;
        G.badwords = await FetchFile("./assets/namefilter.json");
        G.levelsLoaded++;
        G.notes = await FetchFile("./assets/changelog.json?r=" + Math.random());
        G.levelsLoaded++;
        const version = await FetchFile("./assets/version.json?r=" + Math.random());
        G.version = version.version;
        G.levelsLoaded++;
        oldver = window.localStorage.getItem('version');
        if (oldver != G.version) G.updated = true;
        for (let x = 0; x < G.levels.length; x++) {
            pack = G.levels[x];
            for (let y = 0; y < pack.levels.length; y++) {
                level = pack.levels[y];
                if (level.gg == true) {
                    continue;
                }
                G.filesLoading.push(level.file);
                FetchLevel(level.file, x, y);
            }
        }
        G.loadTicks = 0;
        G.loadCheck = setInterval(function () {
            if (G.levelsLoaded >= G.levelCount) {
                loaded = true;
                G.textureMap = [
                    null, //0: Normal
                    G.textureJump1, //1: Jump
                    G.textureBounce, //2: Bounce
                    G.textureLava, //3: Lava
                    G.textureBouncePad, //4: Bounce Pad
                    G.textureJump2, //5: Double Jump
                    G.textureJump3, //6: Triple Jump
                    G.textureBounceJump, //7: Jump Bounce Pad
                    G.textureBoost, //8: Boost
                    G.textureGoal //9: Goal
                ]
                clearInterval(G.loadCheck);
            }
            G.loadTicks++;
            if (G.loadTicks == 100) {
                console.log(G.levels);
                console.log(G.filesLoading);
            }
        }, 100);
    } catch (err) {
        console.log(err);
        console.log("ERROR FROM FetchLevels");
    }
}
FetchLevels();
G.binds = [
    "left",
    "right",
    "jump",
    "quit",
    "retry"
]
//Detect key pressed
document.addEventListener('keydown', function (event) {
    //If in menu
    if (G.scene == "m" && loaded) {
        if (event.code == G.bindings.jump) {
            //Submenu switcher
            if (G.nav == 0) G.scene = "l";
            if (G.nav == 1) {G.scene = "c"; G.nav = 0;}
            if (G.nav == 2) {G.scene = "p"; G.nav = 0; window.localStorage.setItem('version', G.version); G.updated = false;}
            if (G.nav == 3) {G.scene = "t"; G.nav = 0;}
            if (G.nav == 4) {G.scene = "r"; G.nav = 0;}
            if (G.nav == 5) {G.scene = "s"; G.nav = 0;}
        }
        if (event.code == G.bindings.right && !G.offline) G.nav = Math.min(G.nav + 1, 5);
        else if (event.code == G.bindings.right && G.offline) G.nav = Math.min(G.nav + 1, 2);
        if (event.code == G.bindings.left) G.nav = Math.max(G.nav - 1, 0);
    } else if (G.scene == "l" && loaded) {
        if (event.code == G.bindings.jump) {
            LoadLevel(G.levels[G.pack].levels[G.level].id);
            G.vy = 0;
            G.vx = 0;
            G.scene = "g";
        }
        if (event.code == G.bindings.quit) G.scene = "m";
        //Navigate level select
        if (event.code == G.bindings.right) {
            if (G.pack < G.levels.length - 1) {
                G.pack++;
            } else {
                G.pack = 0;
            }
        }
        if (event.code == G.bindings.left) {
            if (G.pack > 0) {
                G.pack--;
            } else {
                G.pack = G.levels.length - 1;
            }
        }
    } else if (G.scene == "c") {
        if (event.code == G.bindings.quit) {G.scene = "m"; G.nav = 0;}
        if (event.code == G.bindings.right) G.nav = Math.min(G.nav + 1, 4);
        if (event.code == G.bindings.left) G.nav = Math.max(G.nav - 1, 0);
        if (event.code == G.bindings.jump) {G.bind = G.nav; G.scene = "cr";}
    } else if (G.scene == "cr") {
        const key = event.code;
        if (key == G.bindings[G.binds[G.bind]]) {G.scene = "c"; G.bind = -1; return;}
        for (bind in G.bindings) if (key == G.bindings[bind]) {G.crerror = true; G.crcooldown = 200; return;}
        G.bindings[G.binds[G.bind]] = key;
        G.scene = "c";
        G.bind = -1;
        SaveBindings();
    } else if (G.scene == "r") {
        if (event.code == "Escape") {
            G.nav--;
            if (G.nav < 0) {
                G.scene = "m";
                G.nav = 0;
                G.password = "";
                G.username = "";
                G.confirm = "";
                G.email = "";
                G.rerror = "";
                return;
            }
        }
        if (event.code == "Enter") {
            G.nav++;
            if (G.nav > 3) {
                if (G.password != G.confirm) {
                    G.rerror = "pnm";
                    G.nav = 3;
                    return;
                }
                if (G.username.length < 3 || G.username.length > 20) {
                    G.rerror = "iun";
                    G.nav = 3;
                    return;
                }
                if (G.password.length < 6 || G.password.length > 50) {
                    G.rerror = "ipw";
                    G.nav = 3;
                    return;
                }
                for (const word of G.badwords) {
                    if (G.username.toLowerCase().includes(word)) {
                        G.rerror = "iun";
                        G.nav = 3;
                        return;
                    }
                }
                regReq = {};
                regReq.Email = G.email;
                regReq.Password = G.password;
                regReq.Username = G.username;
                PlayFabClientSDK.AddUsernamePassword(regReq, (response, error) => {
                    if (error) {
                        if (error.errorCode == 1011) {
                            G.rerror = "aal";
                            G.nav = 3;
                            return;
                        }
                        if (error.errorCode == 1006) {
                            G.rerror = "ena";
                            G.nav = 3;
                            return;
                        }
                        if (error.errorCode == 1005) {
                            G.rerror = "iea";
                            G.nav = 3;
                            return;
                        }
                        if (error.errorCode == 1008) {
                            G.rerror = "ipw";
                            G.nav = 3;
                            return;
                        }
                        if (error.errorCode == 1007) {
                            G.rerror = "iun";
                            G.nav = 3;
                            return;
                        }
                        if (error.errorCode == 1009) {
                            G.rerror = "una";
                            G.nav = 3;
                            return;
                        }
                    }
                    else {
                        G.scene = "m";
                        G.nav = 0;
                        G.password = "";
                        G.username = "";
                        G.confirm = "";
                        G.email = "";
                        G.rerror = "";
                        G.signedin = true;
                        window.localStorage.setItem("signedin", JSON.stringify(true));
                        return;
                    }
                });
            }
        }
        if (G.nav == 0) {
            if (event.code == "Backspace") G.username = G.username.slice(0, -1);
            if (!(G.regname.test(event.key))) return;
            if (event.key.length != 1) return;
            G.username += event.key;
        }
        else if (G.nav == 1) {
            if (event.code == "Backspace") G.email = G.email.slice(0, -1);
            if (!G.regmail.test(event.key)) return;
            if (event.key.length != 1) return;
            G.email += event.key;
        }
        else if (G.nav == 2) {
            if (event.code == "Backspace") G.password = G.password.slice(0, -1);
            if (!G.regpass.test(event.key)) return;
            if (event.key.length != 1) return;
            G.password += event.key;
        }
        else if (G.nav == 3) {
            if (event.code == "Backspace") G.confirm = G.confirm.slice(0, -1);
            if (!G.regpass.test(event.key)) return;
            if (event.key.length != 1) return;
            G.confirm += event.key;
        }
    }
    //Sign In
    else if (G.scene == "s") {
        if (event.code == "Escape") {
            G.nav--;
            if (G.nav < 0) {
                G.scene = "m";
                G.nav = 0;
                G.password = "";
                G.username = "";
                G.rerror = "";
                return;
            }
        }
        if (event.code == "Enter") {
            G.nav++;
            if (G.nav > 1) {
                if (G.username.length < 3 || G.username.length > 20) {
                    G.rerror = "iup";
                    G.nav = 1;
                    return;
                }
                if (G.password.length < 6 || G.password.length > 50) {
                    G.rerror = "iup";
                    G.nav = 1;
                    return;
                }
                liReq = {};
                liReq.Password = G.password;
                liReq.Username = G.username;
                liReq.TitleId = PlayFab.settings.titleId;
                liReq.InfoRequestParameters = {
                    GetUserAccountInfo: true
                };
                PlayFabClientSDK.LoginWithPlayFab(liReq, (response, error) => {
                    if (error) {
                        if (error.errorCode == 1003) {
                            G.rerror = "iup";
                            G.nav = 1;
                            return;
                        }
                    }
                    else {
                        G.GUID = response.data.InfoResultPayload.AccountInfo.CustomIdInfo.CustomId;
                        console.log(G.GUID);
                        window.localStorage.setItem("guid", G.GUID);
                        G.scene = "m";
                        G.nav = 0;
                        G.password = "";
                        G.username = "";
                        G.rerror = "";
                        G.signedin = true;
                        window.localStorage.setItem("signedin", JSON.stringify(true));
                        return;
                    }
                });
            }
        } 
        if (G.nav == 0) {
            if (event.code == "Backspace") G.username = G.username.slice(0, -1);
            if (!(G.regname.test(event.key))) return;
            if (event.key.length != 1) return;
            G.username += event.key;
        }
        else if (G.nav == 1) {
            if (event.code == "Backspace") G.password = G.password.slice(0, -1);
            if (!G.regpass.test(event.key)) return;
            if (event.key.length != 1) return;
            G.password += event.key;
        }
    } else if (G.scene == "t") {
        if (event.code == G.bindings.quit) {
            G.scene = "m";
            G.nav = 0;
        }
    } else if (G.scene == "p") {
        if (event.code == G.bindings.quit) {
            G.scene = "m";
            G.nav = 0;
        }
        if (event.code == G.bindings.left) G.nav = Math.max(G.nav - 1, 0);
        if (event.code == G.bindings.right) G.nav = Math.min(G.nav + 1, G.notes.length - 1);
    }
    if (event.code == G.bindings.left) {
        G.keys.left = true;
    }
    else if (event.code == G.bindings.right) {
        G.keys.right = true;
    }
    else if (event.code == G.bindings.jump && G.jumps > 0) {
        jumpsound += 1;
        if (jumpsound > 2) {
            jumpsound = 0;
        }
        jumpSounds[jumpsound].play();
        G.character.vy = -6;
        G.jumps -= 1;
    }
    else if (event.code == G.bindings.jump && G.scene == "e") {
        G.scene = "m";
        G.timer = 0;
        G.level = 0;
        G.record = false;
    }
    else if (event.code == G.bindings.retry && G.scene == "g") {
        G.level = 0;
        G.timer = 0;
        G.objects = [];
        G.deco = [];
        G.texts = [];
        G.character.vy = 0;
        G.character.vx = 0;
        LoadLevel(G.levels[G.pack].levels[G.level].id);
    }
    else if (event.code == G.bindings.quit && G.scene == "g") {
        G.level = 0;
        G.timer = 0;
        G.objects = [];
        G.deco = [];
        G.texts = [];
        G.scene = "m";
    }
    for (const key in G.bindings) if (event.code == G.bindings[key]) event.preventDefault();
});
//Key up
document.addEventListener('keyup', function (event) {
    if (event.code == G.bindings.left) {
        G.keys.left = false;
    }
    else if (event.code == G.bindings.right) {
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
    G.crcooldown--;
    //Increment timer
    if (G.playing) {
        //if (G.timer - G.ac != 0.02 && G.timer != 0) window.close();
        G.ac = G.timer;
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
                    } else if (G.timer < G.bestTimes[G.levels[G.pack].id]) {
                        G.bestTimes[G.levels[G.pack].id] = G.timer;
                        G.record = true;
                    }
                    var updateRequest = {
                        Data: { bestTimes: JSON.stringify(G.bestTimes) },
                        Permission: "public"
                    }
                    PlayFabClientSDK.UpdateUserData(updateRequest, (response, error) => {
                        if (error) {
                            console.log(error);
                        }
                    });
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
    G.offset.x = Math.round(-G.character.x + G.xmid - G.character.width / 2);
    G.offset.y = Math.round(-G.character.y + G.ymid - G.character.height / 2);
    Draw();
}
const drawScreen = setInterval(function () {
    Main()
}, 20);