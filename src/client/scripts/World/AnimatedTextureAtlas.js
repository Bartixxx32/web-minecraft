var AnimatedTextureAtlas, TextureAtlasCreator;

import * as THREE from "three";

TextureAtlasCreator = class TextureAtlasCreator {
    constructor(options) {
        this.textureX = options.textureX;
        this.textureMapping = options.textureMapping;
        this.size = 36;
        this.willSize = 27;
    }

    gen(tick) {
        var canvasx, ctx, i, lol, multi, texmap, toxelX, toxelY, xd;
        multi = {};
        for (i in this.textureMapping) {
            if (i.includes("@")) {
                xd = this.decodeName(i);
                if (multi[xd.pref] === void 0) {
                    multi[xd.pref] = xd;
                } else {
                    multi[xd.pref].x = Math.max(multi[xd.pref].x, xd.x);
                    multi[xd.pref].y = Math.max(multi[xd.pref].y, xd.y);
                }
            }
        }
        canvasx = document.createElement("canvas");
        ctx = canvasx.getContext("2d");
        canvasx.width = this.willSize * 16;
        canvasx.height = this.willSize * 16;
        toxelX = 1;
        toxelY = 1;
        for (i in this.textureMapping) {
            if (i.includes("@")) {
                xd = this.decodeName(i);
                if (multi[xd.pref].loaded === void 0) {
                    multi[xd.pref].loaded = true;
                    lol = this.getToxelForTick(
                        tick,
                        multi[xd.pref].x + 1,
                        multi[xd.pref].y + 1
                    );
                    texmap = this.textureMapping[
                        `${xd.pref}@${lol.col}@${lol.row}`
                    ];
                    ctx.drawImage(
                        this.textureX,
                        (texmap.x - 1) * 16,
                        (texmap.y - 1) * 16,
                        16,
                        16,
                        (toxelX - 1) * 16,
                        (toxelY - 1) * 16,
                        16,
                        16
                    );
                    toxelX++;
                    if (toxelX > this.willSize) {
                        toxelX = 1;
                        toxelY++;
                    }
                }
            } else {
                ctx.drawImage(
                    this.textureX,
                    (this.textureMapping[i].x - 1) * 16,
                    (this.textureMapping[i].y - 1) * 16,
                    16,
                    16,
                    (toxelX - 1) * 16,
                    (toxelY - 1) * 16,
                    16,
                    16
                );
                toxelX++;
                if (toxelX > this.willSize) {
                    toxelX = 1;
                    toxelY++;
                }
            }
        }
        return canvasx;
    }

    decodeName(i) {
        var j, k, l, m, m2, pref, ref, ref1, sub, x, y;
        m = null;
        for (
            j = k = 0, ref = i.length - 1;
            0 <= ref ? k <= ref : k >= ref;
            j = 0 <= ref ? ++k : --k
        ) {
            if (i[j] === "@") {
                m = j;
                break;
            }
        }
        pref = i.substr(0, m);
        sub = i.substr(m, i.length);
        m2 = null;
        for (
            j = l = 0, ref1 = sub.length - 1;
            0 <= ref1 ? l <= ref1 : l >= ref1;
            j = 0 <= ref1 ? ++l : --l
        ) {
            if (sub[j] === "@") {
                m2 = j;
            }
        }
        x = parseInt(sub.substr(1, m2 - 1));
        y = parseInt(sub.substr(m2 + 1, sub.length));
        return { pref, x, y };
    }

    getToxelForTick(tick, w, h) {
        var col, row;
        tick = (tick % (w * h)) + 1;
        //option1
        col = (tick - 1) % w;
        row = Math.ceil(tick / w) - 1;
        //option2
        col = Math.ceil(tick / h) - 1;
        row = (tick - 1) % h;
        return { row, col };
    }
};

AnimatedTextureAtlas = class AnimatedTextureAtlas {
    constructor(game) {
        var _this, i, k, savedTextures, t, tekstura, tickq;
        _this = this;
        this.game = game;
        this.material = new THREE.MeshStandardMaterial({
            side: 0,
            map: null,
            vertexColors: true,
            transparent: true,
        });
        this.atlasCreator = new TextureAtlasCreator({
            textureX: this.game.al.get("blocksAtlasFull"),
            textureMapping: this.game.al.get("blocksMappingFull"),
        });
        savedTextures = [];
        for (i = k = 0; k <= 9; i = ++k) {
            t = this.atlasCreator.gen(i).toDataURL();
            tekstura = new THREE.TextureLoader().load(t);
            tekstura.magFilter = THREE.NearestFilter;
            tekstura.minFilter = THREE.NearestFilter;
            savedTextures.push(tekstura);
        }
        tickq = 0;
        setInterval(function () {
            var tekst;
            tickq++;
            tekst = savedTextures[tickq % 9];
            _this.material.map = tekst;
            _this.material.map.needsUpdate = true;
        }, 100);
    }
};

export { AnimatedTextureAtlas, TextureAtlasCreator };
