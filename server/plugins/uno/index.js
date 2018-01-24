'use strict';

const config = require('config');
const Uno = require('../../../lib/logic');
const Kartenstapel = require('../../../lib/kartenstapel');

exports.plugin = {
    register: (server, options) => {

        const openGames = {};

        // list all known games
        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, h) {
                return { games: Object.keys(openGames), result: 'OK' };
            }
        });

        // start a new game
        server.route({
            method:  'POST',
            path:    '/',
            handler: function (request, h) {
                const game = new Uno(new Kartenstapel());
                openGames[game.hash] = {
                    started: new Date(),
                    game:    game
                };
                return { gameHash: game.hash, result: 'OK' };
            }
        });

        // get detailed game details
        server.route({
            method:  'GET',
            path:    '/{gameHash}',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }
                const gameState = openGames[gameHash].game.getGameState();
                return { gameState: gameState, result: 'OK' };
            }
        });

        // get player details, player's hash in query is required
        server.route({
            method:  'GET',
            path:    '/{gameHash}/player/{name}',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }
                if (!request.query.hash) {
                    return { result: 'PLAYER_HASH_MISSING' };
                }
                const player = openGames[gameHash].game.getPlayerByHash(request.query.hash);
                if (!player || player.getName() !== request.params.name) {
                    return { result: 'PLAYER_NOT_FOUND' };
                }
                return { player: player, result: 'OK' };
            }
        });

        // add a player to a game
        server.route({
            method:  'POST',
            path:    '/{gameHash}/player/{name}',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }
                const player = openGames[gameHash].game.addPlayer(request.params.name, config.cardsPerPlayer);

                return { player: player, result: 'OK' };
            }
        });

        // play a card
        server.route({
            method:  'POST',
            path:    '/{gameHash}/player/{name}/playCard/{cardIndex}',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }

                if (!request.query.hash) {
                    return { result: 'PLAYER_HASH_MISSING' };
                }
                const actualPlayer = openGames[gameHash].game.getActualPlayer();
                if (actualPlayer.getHash() !== request.query.hash) {
                    return { result: 'NOT_PLAYERS_TURN' };
                }

                const moveResult = openGames[gameHash].game.move(request.params.cardIndex);
                if (moveResult.action === 'success') {
                    openGames[gameHash].game.getNextPlayer();
                }

                return {
                    moveResult: moveResult,
                    hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                    result: 'OK'
                };
            }
        });

        // get a new card
        server.route({
            method:  'POST',
            path:    '/{gameHash}/player/{name}/getCard',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }

                if (!request.query.hash) {
                    return { result: 'PLAYER_HASH_MISSING' };
                }
                const actualPlayer = openGames[gameHash].game.getActualPlayer();
                if (actualPlayer.getHash() !== request.query.hash) {
                    return { result: 'NOT_PLAYERS_TURN' };
                }

                const newCard = this.logic.addNewCardToPlayer();
                if (newCard === false) {
                    return { return: 'INVALID_MOVE' };
                } else {
                    openGames[gameHash].game.getNextPlayer();
                }

                return {
                    newCard: newCard,
                    hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                    result: 'OK'
                };
            }
        });

        // take assJackpot
        server.route({
            method:  'POST',
            path:    '/{gameHash}/player/{name}/takeAssJackpot',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }

                if (!request.query.hash) {
                    return { result: 'PLAYER_HASH_MISSING' };
                }
                const actualPlayer = openGames[gameHash].game.getActualPlayer();
                if (actualPlayer.getHash() !== request.query.hash) {
                    return { result: 'NOT_PLAYERS_TURN' };
                }

                const jackpotCards = this.logic.redeemAssJackpot();
                if (jackpotCards === false) {
                    return { return: 'INVALID_MOVE' };
                } else {
                    openGames[gameHash].game.getNextPlayer();
                }

                return {
                    jackpotCards: jackpotCards,
                    hasPlayerWon: openGames[gameHash].game.hasPlayerWon(),
                    result: 'OK'
                };
            }
        });

        // start the game
        server.route({
            method:  'POST',
            path:    '/{gameHash}/start',
            handler: function (request, h) {
                const gameHash = request.params.gameHash;
                if (!openGames[gameHash]) {
                    return { result: 'GAME_NOT_FOUND' };
                }
                if (openGames[gameHash].game.getGameState().gameStarted) {
                    return { result: 'GAME_ALREADY_STARTED' };
                }
                const card = openGames[gameHash].game.startGame();
                return { card: card, result: 'OK' };
            }
        });
    },
    pkg: require('./package.json')
};