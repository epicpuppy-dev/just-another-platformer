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

    //Draw Menu ('m')
    if (G.scene == "m") {
        //Title
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
        //Don't draw section if level data is not loaded
        if (!loaded) {
            G.ctx.textAlign = "center";
            G.ctx.textBaseline = "bottom";
            //Loading
            if (G.levelCount != 0) {
                G.ctx.fillText("Loading... (" + G.levelsLoaded + "/" + G.levelCount + ")", 600, 698);
            } else {
                G.ctx.fillText("Loading...", 600, 698);
            }
            G.ctx.textBaseline = "alphabetical";
            return;
        }
        //Version Number
        G.ctx.textAlign = "right";
        G.ctx.fillText("Ver. " + G.version, 1190, 698);
        //Control Hints
        G.ctx.textAlign = "center";
        G.ctx.fillText("Press JUMP to start", 600, 698);
        //Level Pack Name
        G.ctx.textBaseline = "middle";
        G.ctx.font = "32px 'Press Start 2P', sans-serif";
        G.ctx.fillText("< " + G.levels[G.pack].name + " >", 600, 350);
        //Level Pack Length
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText((G.levels[G.pack].levels.length - 1) + " levels", 600, 400);
        //Level Pack Stats (Labels)
        G.ctx.textAlign = "right";
        G.ctx.fillText("Difficulty: ", 600, 450);
        G.ctx.fillText("Best Time: ", 600, 500);
        //Level Pack Stats (Data)
        var difficulty = "[" + "X".repeat(G.levels[G.pack].difficulty + 1) + " ".repeat(4 - G.levels[G.pack].difficulty) + "]";
        G.ctx.fillStyle = G.difficultyColors[G.levels[G.pack].difficulty];
        G.ctx.textAlign = "left";
        G.ctx.fillText(difficulty, 600, 450);
        G.ctx.fillStyle = "black";
        //If best time for pack exists, show it
        if (G.bestTimes[G.levels[G.pack].id] == undefined) {
            G.ctx.fillText("N/A", 600, 500);
        } else {
            G.ctx.fillText(G.bestTimes[G.levels[G.pack].id].toFixed(2) + "s", 600, 500);
        }
    } 

    //Draw screen if currently in game
    if (G.scene == "g") {
        //Clear Screen
        G.ctx.fillStyle = "#ffffff";
        G.ctx.fillRect(0, 0, 1200, 700);
        //Draw Character
        G.ctx.fillStyle = "#000000";
        G.ctx.fillRect(600 - (G.character.width / 2), 350 - (G.character.height / 2), G.character.width, G.character.height);
        //Configure pattern offset
        var translation = new DOMMatrix([1,0,0,1,0,0])
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
            }
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
            //Draw Platform Rect
            G.ctx.fillRect(platform.x + G.offset.x, platform.y + G.offset.y, platform.width, platform.height);
            if (G.platformTexture) {
                G.ctx.globalCompositeOperation = "multiply";
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
        G.ctx.fillRect(0, 0, 1400, 40);
        //Draw Time
        G.ctx.textAlign = "left";
        G.ctx.fillStyle = "#000000";
        G.ctx.textBaseline = "top";
        G.ctx.fillText("Time: " + G.timer.toFixed(2), 10, 10);
        //Draw Level Name
        G.ctx.textAlign = "right";
        G.ctx.textBaseline = "middle";
        G.ctx.font = "16px 'Press Start 2P', sans-serif";
        G.ctx.fillText(G.levels[G.pack].name + " - " + G.levels[G.pack].levels[G.level].name + " - " + (G.level + 1) + "/" + (G.levels[G.pack].levels.length - 1), 1190, 20);
        G.ctx.textAlign = "left";
        G.ctx.textBaseline = "alphabetic"
    } 

    //Draw end screen
    if (G.scene == "e") {
        //Draw Win Title
        G.ctx.fillStyle = "#eeffee";
        G.ctx.fillRect(0, 0, 1200, 700);
        G.ctx.fillStyle = "black";
        G.ctx.font = "40px 'Press Start 2P', sans-serif";
        G.ctx.textAlign = "center";
        G.ctx.textBaseline = "middle";
        G.ctx.fillText("You Win!", 600, 350);
        //Draw Time
        G.ctx.font = "32px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Your Time: " + G.timer.toFixed(2) + " seconds", 600, 400);
        //Draw Control Hints
        G.ctx.textBaseline = "bottom";
        G.ctx.font = "24px 'Press Start 2P', sans-serif";
        G.ctx.fillText("Press JUMP to continue", 600, 698);
        if (G.record) {
            //Draw New Record
            G.ctx.fillStyle = "gold";
            G.ctx.fillText("New Record!", 600, 450);
        }
    }

}