'use strict';

var config = require('config');
var Uno = require('../../../lib/logic');
var Kartenstapel = require('../../../lib/kartenstapel');

exports.register = function (server, options, next) {

    var openGames = {};

    // list all known games
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply({ games: Object.keys(openGames), result: 'OK' });
        }
    });

    // start a new game
    server.route({
        method:  'POST',
        path:    '/',
        handler: function (request, reply) {
            var game = new Uno(new Kartenstapel());
            openGames[game.hash] = {
                started: new Date(),
                game:    game
            };
            reply({ gameHash: game.hash, result: 'OK' });
        }
    });

    // get detailed game details
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

    // get player details, player's hash in query is required
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

    // add a player to a game
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

    // play a card
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
            if (moveResult.action === 'success') {
                openGames[gameHash].game.getNextPlayer();
            }

            reply({
                moveResult: moveResult,
                hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                result: 'OK'
            });
        }
    });

    // get a new card
    server.route({
        method:  'POST',
        path:    '/{gameHash}/player/{name}/getCard',
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

            var newCard = this.logic.addNewCardToPlayer();
            if (newCard === false) {
                return reply({ return: 'INVALID_MOVE' });
            } else {
                openGames[gameHash].game.getNextPlayer();
            }

            reply({
                newCard: newCard,
                hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                result: 'OK'
            });
        }
    });

    // take assJackpot
    server.route({
        method:  'POST',
        path:    '/{gameHash}/player/{name}/takeAssJackpot',
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

            var jackpotCards = this.logic.redeemAssJackpot();
            if (jackpotCards === false) {
                return reply({ return: 'INVALID_MOVE' });
            } else {
                openGames[gameHash].game.getNextPlayer();
            }

            reply({
                jackpotCards: jackpotCards,
                hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                result: 'OK'
            });
        }
    });

    // start the game
    server.route({
        method:  'POST',
        path:    '/{gameHash}/start',
        handler: function (request, reply) {
            var gameHash = request.params.gameHash;
            if (!openGames[gameHash]) {
                return reply({ result: 'GAME_NOT_FOUND' });
            }
            if (openGames[gameHash].game.getGameState().gameStarted) {
                return reply({ result: 'GAME_ALREADY_STARTED' });
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
