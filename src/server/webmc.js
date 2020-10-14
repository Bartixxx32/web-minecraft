// Generated by CoffeeScript 2.5.1
(function() {
  var app, config, express, fs, http, io, port, server, sf;

  fs = require("fs");

  http = require("http");

  server = http.createServer();

  io = require("socket.io")(server);

  express = require('express');

  app = express();

  sf = {};

  config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));

  port = config["express-port"];

  app.use(express.static(__dirname + "/../client/"));

  app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-store');
    return next();
  });

  app.get("/websocket/", function(req, res) {
    return res.send(String(config["websocket-port"]));
  });

  app.get("/host/", function(req, res) {
    return res.send(String(config["host"]));
  });

  app.listen(port);

  server.listen(config["websocket-port"]);

  io.sockets.on("connection", function(socket) {
    socket.on("initClient", function(data) {
      try {
        return sf.onjoin(socket.id, data);
      } catch (error) {}
    });
    socket.on("playerUpdate", function(data) {
      try {
        return sf.onplayerUpdate(data);
      } catch (error) {}
    });
    socket.on("blockUpdate", function(block) {
      try {
        return sf.onblockUpdate(...block);
      } catch (error) {}
    });
    return socket.on("disconnect", function() {
      try {
        return sf.onleave(socket.id);
      } catch (error) {}
    });
  });

  module.exports = {
    on: function(type, f) {
      if (type === "join") {
        sf.onjoin = f;
      }
      if (type === "leave") {
        sf.onleave = f;
      }
      if (type === "blockUpdate") {
        sf.onblockUpdate = f;
      }
      if (type === "playerUpdate") {
        return sf.onplayerUpdate = f;
      }
    },
    send: function(socketid, message, data) {
      return io.to(socketid).emit(message, data);
    },
    broadcast: function(message, data) {
      return io.sockets.emit(message, data);
    },
    config
  };

}).call(this);