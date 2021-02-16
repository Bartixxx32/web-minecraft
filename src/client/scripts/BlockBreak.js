var BlockBreak;

import * as THREE from "three";

BlockBreak = class BlockBreak {
    constructor(game) {
        console.log(game);
        this.game = game;
        this.texture = this.game.al.get("blocksAtlasSnap");
        this.texture.magFilter = THREE.NearestFilter;
        this.cursor = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1.001, 1.001, 1.001),
            new THREE.MeshBasicMaterial({
                map: this.texture,
                transparent: true,
            })
        );
        this.lastPos = [];
        this.cursorOut = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.cursor.geometry),
            new THREE.LineBasicMaterial({
                color: 0x000000,
            })
        );
        this.game.scene.add(this.cursor, this.cursorOut);
        this.uv = {};
        this.isDigging = false;
        this.done = true;
        this.setState(0);
    }

    setState(state) {
        var i, j, q, ref, toxX, toxY;
        //od 0 do 9
        if (state === 0) {
            return (this.cursor.material.visible = false);
        } else {
            this.cursor.material.visible = true;
            toxX = 6 + state;
            toxY = 8;
            q = 1 / 27;
            for (
                i = j = 0,
                    ref = this.cursor.geometry.attributes.uv.array.length;
                0 <= ref ? j <= ref : j >= ref;
                i = 0 <= ref ? ++j : --j
            ) {
                if (this.uv[i] === void 0) {
                    if (i % 2 === 0) {
                        if (this.cursor.geometry.attributes.uv.array[i] === 0) {
                            this.uv[i] = 0;
                        } else {
                            this.uv[i] = 1;
                        }
                    } else {
                        if (this.cursor.geometry.attributes.uv.array[i] === 0) {
                            this.uv[i] = 0;
                        } else {
                            this.uv[i] = 1;
                        }
                    }
                }
                if (i % 2 === 0) {
                    if (this.uv[i] === 0) {
                        this.cursor.geometry.attributes.uv.array[i] = q * toxX;
                    } else {
                        this.cursor.geometry.attributes.uv.array[i] =
                            q * toxX + q;
                    }
                } else {
                    if (this.uv[i] === 0) {
                        this.cursor.geometry.attributes.uv.array[i] =
                            1 - q * toxY - q;
                    } else {
                        this.cursor.geometry.attributes.uv.array[i] =
                            1 - q * toxY;
                    }
                }
            }
            return (this.cursor.geometry.attributes.uv.needsUpdate = true);
        }
    }

    updatePos(cb) {
        var pos, rayBlock;
        rayBlock = this.game.world.getRayBlock();
        if (JSON.stringify(this.lastPos) !== JSON.stringify(rayBlock)) {
            this.lastPos = rayBlock;
            cb();
        }
        if (rayBlock) {
            pos = rayBlock.posBreak;
            this.cursor.position.set(...pos);
            this.cursor.visible = true;
            this.cursorOut.position.set(...pos);
            return (this.cursorOut.visible = true);
        } else {
            this.cursor.visible = false;
            return (this.cursorOut.visible = false);
        }
    }

    digRequest() {
        var pos;
        console.log("REQUESTING DIGGING...");
        pos = this.game.world.getRayBlock().posBreak;
        if (pos !== void 0) {
            this.game.socket.emit("dig", pos);
            this.done = false;
        }
    }

    startDigging(time) {
        var _this, ile;
        _this = this;
        ile = 0;
        if (this.isDigging === false) {
            this.isDigging = true;
            this.int = setInterval(function () {
                if (ile === 11) {
                    _this.setState(0);
                    clearInterval(_this.int);
                    _this.isDigging = false;
                } else {
                    _this.setState(ile);
                }
                ile++;
            }, time / 10);
        }
    }

    stopDigging(callback) {
        this.done = true;
        this.isDigging = false;
        console.log("Digging Stopped!");
        this.game.socket.emit("stopDigging", function (xd) {
            return callback(xd);
        });
        this.setState(0);
        clearInterval(this.int);
    }
};

export { BlockBreak };
