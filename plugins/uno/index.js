'use strict';

var config = require('config');
var Uno = require('../../logic');
var randomstring = require("randomstring");
var Kartenstapel = require('../../Kartenstapel');

exports.register = function (server, options, next) {

    var openGames = {};

    server.route({
        method:  'POST',
        path:    '/',
        handler: function (request, reply) {
            var gameHash = randomstring.generate();
            openGames[gameHash] = {
                started: new Date(),
                game:    new Uno(new Kartenstapel())
            };
            reply({ gameHash: gameHash, result: 'OK' });
        }
    });

    server.route({
        method:  'GET',
        path:    '/{gameHash}',
        handler: function (request, reply) {
            var gameHash = request.params.gameHash;
            if (!openGames[gameHash]) {
                return reply({ result: 'GAME_NOT_FOUND' });
            }
            var gameState = openGames[gameHash].game.getGameState();
            reply({ gameState: gameState, result: 'OK' });
        }
    });

    server.route({
        method:  'GET',
        path:    '/{gameHash}/player/{name}',
        handler: function (request, reply) {
            var gameHash = request.params.gameHash;
            if (!openGames[gameHash]) {
                return reply({ result: 'GAME_NOT_FOUND' });
            }
            if (!request.query.hash) {
                return reply({ result: 'PLAYER_HASH_MISSING' });
            }
            var player = openGames[gameHash].game.getPlayerByHash(request.query.hash);
            if (!player || player.getName() !== request.params.name) {
                return reply({ result: 'PLAYER_NOT_FOUND' });
            }
            reply({ player: player, result: 'OK' });
        }
    });

    server.route({
        method:  'POST',
        path:    '/{gameHash}/player/{name}',
        handler: function (request, reply) {
            var gameHash = request.params.gameHash;
            if (!openGames[gameHash]) {
                return reply({ result: 'GAME_NOT_FOUND' });
            }
            var player = openGames[gameHash].game.addPlayer(request.params.name, config.cardsPerPlayer);

            reply({ player: player, result: 'OK' });
        }
    });

    server.route({
        method:  'POST',
        path:    '/{gameHash}/player/{name}/playCard/{cardIndex}',
        handler: function (request, reply) {
            var gameHash = request.params.gameHash;
            if (!openGames[gameHash]) {
                return reply({ result: 'GAME_NOT_FOUND' });
            }

            if (!request.query.hash) {
                return reply({ result: 'PLAYER_HASH_MISSING' });
            }
            var actualPlayer = openGames[gameHash].game.getActualPlayer();
            if (actualPlayer.getHash() !== request.query.hash) {
                return reply({ result: 'NOT_PLAYERS_TURN' });
            }

            var moveResult = openGames[gameHash].game.move(request.params.cardIndex);

            reply({
                moveResult: moveResult,
                hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                result: 'OK'
            });
        }
    });

    server.route({
        method:  'POST',
        path:    '/{gameHash}/start',
        handler: function (request, reply) {
            var gameHash = request.params.gameHash;
            if (!openGames[gameHash]) {
                return reply({ result: 'GAME_NOT_FOUND' });
            }
            var card = openGames[gameHash].game.startGame();
            reply({ card: card, result: 'OK' });
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
