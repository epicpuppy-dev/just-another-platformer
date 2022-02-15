/*
GAME STATES
m: menu
l: level select
g: game
e: end screen
t: leaderboards
c: settings
cr: rebind controls
r: register
s: sign in
*/
if (typeof G == 'undefined') {
    G = {};
}
G.colors = [
    "#444444", //0: Normal
    "#999933", //1: Jump
    "#33aa33", //2: Bounce
    "#ff2222", //3: Lava
    "#44aaee", //4: Bounce Pad
    "#cccc33", //5: Double Jump
    "#ffff33", //6: Triple Jump
    "#99aa33", //7: Jump Bounce Pad
    "", //8: Boost Pad
    "#33ff33" //9: Goal
];
G.difficultyColors = [
    "#44dddd", //0
    "#44dd44", //1
    "#dddd44", //2
    "#ee8844", //3
    "#dd4444", //4
];
G.textureMap = [
    null, //0: Normal
    null, //1: Jump
    null, //2: Bounce
    null, //3: Lava
    null, //4: Bounce Pad
    null, //5: Double Jump
    null, //6: Triple Jump
    null, //7: Jump Bounce Pad
    null, //8: None
    null //9: Goal
]
G.platformTexture = false;

function Draw() {

    //Draw Menu Screen ('m')
    if (G.scene == "m") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Just Another Platformer", G.xmid, G.ymid - 150);
        //Don't draw section if level data is not loaded
        if (!loaded) {
            G.ctx.font = "24px 'Press Start 2P', sans-serif";
            G.ctx.textAlign = "center";
            G.ctx.textBaseline = "bottom";
            //Loading
            if (G.levelCount != 0) {
                G.ctx.fillStyle = "#99bbcc";
                G.ctx.fillRect(0, G.height - 35, (G.width * (G.levelsLoaded / G.levelCount)), 35);
                G.ctx.fillStyle = "black";
                G.ctx.fillText("Loading... (" + G.levelsLoaded + "/" + G.levelCount + ")", G.xmid, G.height - 2);
            } else {
                G.ctx.fillText("Loading...", G.xmid, G.height - 2);
            }
            G.ctx.textBaseline = "alphabetical";
            return;
        }
        G.ctx.font = "32px 'Press Start 2P', sans-serif";
        if (G.nav == 0) G.ctx.fillText("> Play <", G.xmid, G.ymid);
        else G.ctx.fillText("Play", G.xmid, G.ymid);
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        if (G.nav == 3 && !G.offline) G.ctx.fillText("> Leaderboards <", G.xmid, G.ymid + 200);
        else if (!G.offline) G.ctx.fillText("Leaderboards", G.xmid, G.ymid + 200);
        if (G.nav == 1) G.ctx.fillText("> Settings <", G.xmid, G.ymid + 100);
        else G.ctx.fillText("Settings", G.xmid, G.ymid + 100)
        if (G.nav == 2 && !G.updated) G.ctx.fillText("> Patch Notes <", G.xmid, G.ymid + 150);
        else if (G.nav != 2 && !G.updated) G.ctx.fillText("Patch Notes", G.xmid, G.ymid + 150);
        if (G.updated) G.ctx.fillStyle = "goldenrod";
        if (G.nav == 2 && G.updated) G.ctx.fillText("> Patch Notes (NEW UPDATE!) <", G.xmid, G.ymid + 150);
        else if (G.nav != 2 && G.updated) G.ctx.fillText("Patch Notes (NEW UPDATE!)", G.xmid, G.ymid + 150);
        if (G.updated) G.ctx.fillStyle = "black";
        if (G.nav == 4 && !G.signedin && !G.offline) G.ctx.fillText("> Register <", G.xmid, G.ymid + 250);
        else if (!G.signedin && !G.offline) G.ctx.fillText("Register", G.xmid, G.ymid + 250);
        if (G.nav == 5 && !G.signedin && !G.offline) G.ctx.fillText("> Sign In <", G.xmid, G.ymid + 300);
        else if (!G.signedin && !G.offline) G.ctx.fillText("Sign In", G.xmid, G.ymid + 300);
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "left";
        G.ctx.fillText("Current Version: " + G.version, 10, 24);
        G.ctx.textAlign = "right";
        if (G.offline) G.ctx.fillText("OFFLINE MODE", G.width - 10, 24);
        G.ctx.textAlign = "center";
        G.ctx.fillText(
            "Use " + G.bindings.left + ", " + G.bindings.right + ", and " + G.bindings.jump + " to navigate"
            , G.xmid, G.height - 15);
    }

    //Draw Settings Screen ('c', 'cr')
    if (G.scene == "c" || G.scene == "cr") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Settings", G.xmid, 150);
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        if (G.bind == 0) G.ctx.fillStyle = "#44aaee";
        else G.ctx.fillStyle = "black";
        if (G.nav == 0) G.ctx.fillText("> Left: " + G.bindings.left + " <", G.xmid, G.ymid - 100);
        else G.ctx.fillText("Left: " + G.bindings.left, G.xmid, G.ymid - 100);
        if (G.bind == 1) G.ctx.fillStyle = "#44aaee";
        else G.ctx.fillStyle = "black";
        if (G.nav == 1) G.ctx.fillText("> Right: " + G.bindings.right + " <", G.xmid, G.ymid - 50);
        else G.ctx.fillText("Right: " + G.bindings.right, G.xmid, G.ymid - 50);
        if (G.bind == 2) G.ctx.fillStyle = "#44aaee";
        else G.ctx.fillStyle = "black";
        if (G.nav == 2) G.ctx.fillText("> Jump: " + G.bindings.jump + " <", G.xmid, G.ymid);
        else G.ctx.fillText("Jump: " + G.bindings.jump, G.xmid, G.ymid);
        if (G.bind == 3) G.ctx.fillStyle = "#44aaee";
        else G.ctx.fillStyle = "black";
        if (G.nav == 3) G.ctx.fillText("> Exit/Back: " + G.bindings.quit + " <", G.xmid, G.ymid + 50);
        else G.ctx.fillText("Exit/Back: " + G.bindings.quit, G.xmid, G.ymid + 50);
        if (G.bind == 4) G.ctx.fillStyle = "#44aaee";
        else G.ctx.fillStyle = "black";
        if (G.nav == 4) G.ctx.fillText("> Retry: " + G.bindings.retry + " <", G.xmid, G.ymid + 100);
        else G.ctx.fillText("Retry: " + G.bindings.retry, G.xmid, G.ymid + 100);
        G.ctx.fillStyle = "#dd4444";
        if (G.crcooldown > 0) G.ctx.fillText("Key already bound to a different control", G.xmid, G.ymid + 150);
        G.ctx.fillStyle = "black";
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "right";
        G.ctx.fillText("Current Version: " + G.version, G.width - 10, 24);
        G.ctx.textAlign = "center";
        G.ctx.fillText(
            "Use " + G.bindings.left + ", " + G.bindings.right + ", and " + G.bindings.jump + " to navigate"
            , G.xmid, G.height - 15);
        G.ctx.textAlign = "left";
        G.ctx.fillText("Use " + G.bindings.quit + " to go back", 10, 24);
    }

    //Draw Registration Screen ('r')
    if (G.scene == "r") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Register", G.xmid, 150);
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        if (G.nav == 0) G.ctx.fillText(" > Username: " + G.username + " <", G.xmid, G.ymid - 100);
        else G.ctx.fillText("Username: " + G.username, G.xmid, G.ymid - 100);
        if (G.nav == 1) G.ctx.fillText(" > Email: " + G.email + " <", G.xmid, G.ymid - 50);
        else G.ctx.fillText("Email: " + G.email, G.xmid, G.ymid - 50);
        if (G.nav == 2) G.ctx.fillText(" > Password: " + G.password.replaceAll(/./g, "*") + " <", G.xmid, G.ymid);
        else G.ctx.fillText("Password: " + G.password.replaceAll(/./g, "*"), G.xmid, G.ymid);
        if (G.nav == 3) G.ctx.fillText(" > Confirm Password: " + G.confirm.replaceAll(/./g, "*") + " <", G.xmid, G.ymid + 50);
        else G.ctx.fillText("Confirm Password: " + G.confirm.replaceAll(/./g, "*"), G.xmid, G.ymid + 50);
        G.ctx.fillStyle = "#dd4444";
        if (G.rerror == "una") G.ctx.fillText("Username already taken", G.xmid, G.ymid + 100);
        else if (G.rerror == "aal") G.ctx.fillText("Account already linked", G.xmid, G.ymid + 100);
        else if (G.rerror == "ena") G.ctx.fillText("Email already registered", G.xmid, G.ymid + 100);
        else if (G.rerror == "iea") G.ctx.fillText("Invalid email address", G.xmid, G.ymid + 100);
        else if (G.rerror == "iun") G.ctx.fillText("Invalid username", G.xmid, G.ymid + 100);
        else if (G.rerror == "ipw") G.ctx.fillText("Invalid password", G.xmid, G.ymid + 100);
        else if (G.rerror == "pnm") G.ctx.fillText("Passwords do not match", G.xmid, G.ymid + 100);
        G.ctx.fillStyle = "black";
        G.ctx.fillText("Use Enter to proceed and Escape to go back", G.xmid, G.height - 15);
    }

    //Draw Sign In Screen ('s')
    if (G.scene == "s") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Sign In", G.xmid, G.ymid - 200);
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        if (G.nav == 0) G.ctx.fillText(" > Username: " + G.username + " <", G.xmid, G.ymid);
        else G.ctx.fillText("Username: " + G.username, G.xmid, G.ymid);
        if (G.nav == 1) G.ctx.fillText(" > Password: " + G.password.replaceAll(/./g, "*") + " <", G.xmid, G.ymid + 50);
        else G.ctx.fillText("Password: " + G.password.replaceAll(/./g, "*"), G.xmid, G.ymid + 50);
        G.ctx.fillStyle = "#dd4444";
        if (G.rerror == "iup") G.ctx.fillText("Invalid username or password", G.xmid, G.ymid + 100);
        G.ctx.fillStyle = "black";
        G.ctx.fillText("Use Enter to proceed and Escape to go back", G.xmid, G.height - 15);
    }

    //Draw Leaderboards Screen ('p')
    if (G.scene == "p") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Patch Notes", G.xmid, G.ymid - 200);
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText("> " + G.notes[G.nav].version + " <", G.xmid, G.ymid - 100);
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        offset = -10;
        for (const line of G.notes[G.nav].notes) {
            G.ctx.fillText("- " + line, G.xmid, G.ymid + offset);
            offset += 35;
        }
        G.ctx.textAlign = "center";
        G.ctx.fillText(
            "Use " + G.bindings.left + ", " + G.bindings.right + ", and " + G.bindings.jump + " to navigate"
            , G.xmid, G.height - 15);
        G.ctx.textAlign = "left";
        G.ctx.fillText("Use " + G.bindings.quit + " to go back", 10, 24);
    }
    
    //Draw Leaderboards Screen ('t')
    if (G.scene == "t") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Leaderboards", G.xmid, G.ymid - 200);
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Not yet implemented lol", G.xmid, G.ymid + 50);
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.fillText(
            "Use " + G.bindings.left + ", " + G.bindings.right + ", and " + G.bindings.jump + " to navigate"
            , G.xmid, G.height - 15);
        G.ctx.textAlign = "left";
        G.ctx.fillText("Use " + G.bindings.quit + " to go back", 10, 24);
    }

    //Draw Level Select ('l')
    if (G.scene == "l") {
        //Title
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("Level Select", G.xmid, G.ymid - 150);
        G.ctx.textBaseline = "bottom";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        //Level Pack Name
        G.ctx.textBaseline = "middle";
        G.ctx.font = "32px 'Press Start 2P', sans-serif";
        G.ctx.fillText("> " + G.levels[G.pack].name + " <", G.xmid, G.ymid - 50);
        //Level Pack Length
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText((G.levels[G.pack].levels.length - 1) + " levels", G.xmid, G.ymid);
        //Level Pack Stats (Labels)
        G.ctx.textAlign = "right";
        G.ctx.fillText("Difficulty: ", G.xmid, G.ymid + 50);
        G.ctx.fillText("Best Time: ", G.xmid, G.ymid + 100);
        //Level Pack Stats (Data)
        var difficulty = "[" + "X".repeat(G.levels[G.pack].difficulty + 1) + " ".repeat(4 - G.levels[G.pack].difficulty) + "]";
        G.ctx.fillStyle = G.difficultyColors[G.levels[G.pack].difficulty];
        G.ctx.textAlign = "left";
        G.ctx.fillText(difficulty, G.xmid, G.ymid + 50);
        G.ctx.fillStyle = "black";
        //If best time for pack exists, show it
        if (G.bestTimes[G.levels[G.pack].id] == undefined) {
            G.ctx.fillText("None", G.xmid, G.ymid + 100);
        } else {
            G.ctx.fillText(G.bestTimes[G.levels[G.pack].id].toFixed(2) + "s", G.xmid, G.ymid + 100);
        }
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.fillText(
            "Use " + G.bindings.left + ", " + G.bindings.right + ", and " + G.bindings.jump + " to navigate"
            , G.xmid, G.height - 15);
        G.ctx.textAlign = "left";
        G.ctx.fillText("Use " + G.bindings.quit + " to go back", 10, 24);
    }

    //Draw screen if currently in game
    if (G.scene == "g") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, G.width, G.height);
        //Draw Character
        G.ctx.fillStyle = "#000000";
        G.ctx.fillRect(G.xmid - (G.character.width / 2), G.ymid - (G.character.height / 2), G.character.width, G.character.height);
        //Configure pattern offset
        var translation = new DOMMatrix([1, 0, 0, 1, 0, 0])
            .translateSelf(G.offset.x, G.offset.y);
        //Draw Platforms
        for (const platform of G.objects) {
            if (G.textureMap[platform.type] !== null) {
                G.ctx.fillStyle = G.textureMap[platform.type];
                G.ctx.fillStyle.setTransform(translation);
                G.platformTexture = true;
            } else {
                G.ctx.fillStyle = G.colors[platform.type];
                G.platformTexture = false;
                //Dynamic Platform Colors
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
            }

            //Draw Platform Rect
            G.ctx.fillRect(platform.x + G.offset.x, platform.y + G.offset.y, platform.width, platform.height);
            if (G.platformTexture) {
                G.ctx.globalCompositeOperation = "multiply";
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
                G.ctx.fillStyle = G.colors[platform.type];
                G.ctx.fillRect(platform.x + G.offset.x, platform.y + G.offset.y, platform.width, platform.height);
                G.ctx.globalCompositeOperation = "source-over";
            }
        }
        //Draw Decorations
        for (const deco of G.deco) {
            G.ctx.fillStyle = deco.color;
            G.ctx.fillRect(deco.x + G.offset.x, deco.y + G.offset.y, deco.width, deco.height);
        }
        //Draw Text Objects
        for (const text of G.texts) {
            G.ctx.fillStyle = text.color;
            G.ctx.font = text.font;
            G.ctx.textAlign = text.align;
            G.ctx.fillText(text.text, text.x + G.offset.x, text.y + G.offset.y);
        }
        //Draw Top Bar
        G.ctx.fillStyle = "#000000";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillStyle = "#eeeeee";
        G.ctx.fillRect(0, 0, G.width, 40);
        //Draw Time
        G.ctx.textAlign = "left";
        G.ctx.fillStyle = "#000000";
        G.ctx.textBaseline = "top";
        G.ctx.fillText("Time: " + G.timer.toFixed(2), 10, 10);
        //Draw Level Name
        G.ctx.textAlign = "right";
        G.ctx.textBaseline = "middle";
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.fillText(G.levels[G.pack].name + " - " + G.levels[G.pack].levels[G.level].name + " - " + (G.level + 1) + "/" + (G.levels[G.pack].levels.length - 1), G.width - 10, 20);
        G.ctx.textAlign = "left";
        G.ctx.textBaseline = "alphabetic"
    }

    //Draw end screen
    if (G.scene == "e") {
        //Draw Win Title
        G.ctx.fillStyle = "#eeffee";
        G.ctx.fillRect(0, 0, G.width, G.height);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("You Win!", G.xmid, G.ymid);
        //Draw Time
        G.ctx.font = "32px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Your Time: " + G.timer.toFixed(2) + " seconds", G.xmid, G.ymid + 50);
        //Draw Control Hints
        G.ctx.textBaseline = "bottom";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Press JUMP to continue", G.xmid, G.height - 10);
        if (G.record) {
            //Draw New Record
            G.ctx.fillStyle = "gold";
            G.ctx.fillText("New Record!", G.xmid, G.ymid + 100);
        }
    }

}