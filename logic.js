'use strict';

var Player = require('./player');

var Logic = function (kartenstapel) {
    this.assJackpot = 0;
    this.actualCard = null;
    this.actualPlayer = 0;
    this.players = [];
    this.gameStarted = false;
    this.directionAscending = true;
    this.colorWish = null;

    this.kartenstapel = kartenstapel;
    this.kartenstapel.initialize();
};

Logic.prototype.addPlayer = function (name, amountOfCards) {
    if (this.gameStarted) {
        throw new Error('Can not add player on running game');
    }
    name = name || 'Spieler ' + Math.random();
    amountOfCards = amountOfCards || 7;
    var player = new Player();
    player.receiveCards(this.kartenstapel.give(amountOfCards));
    player.setName(name);
    this.players.push(player);
    return player;
};

Logic.prototype.getPlayerByHash = function (hash) {
    return this.players.filter(function (player) {
        return player.getHash() === hash;
    })[0];
};

Logic.prototype.getGameState = function () {
    var state = {
        gameStarted: this.gameStarted,
        players:     this.players.map(function (player) {
            return {
                name: player.getName()
            }
        }),
        cardCount:   this.kartenstapel.getStapelCount()
    };

    if (this.gameStarted) {
        state.actualCard = this.getActualCard();
        state.actualPlayer = this.getActualPlayer().getName();
        state.direction = this.directionAscending ? 'ascending' : 'descending';
    }

    return state;
};

Logic.prototype.startGame = function () {
    if (this.gameStarted) {
        throw new Error('The game has already began');
    }
    if (this.players.length < 2) {
        throw new Error('No sense to start a game with less than 2 players');
    }
    this.gameStarted = true;
    this.setActualCard(this.kartenstapel.give(1)[0]);
    return this.getActualCard();
};

Logic.prototype.getActualCard = function () {
    return this.actualCard;
};

Logic.prototype.setActualCard = function (card) {
    this.actualCard = card;
};

Logic.prototype.getNextPlayerNumber = function () {
    if (this.actualPlayer !== null && this.actualPlayer + 1 < this.players.length) {
        this.actualPlayer++;
    } else {
        this.actualPlayer = 0;
    }
    return this.actualPlayer;
};

Logic.prototype.getPrevPlayerNumber = function () {
    if (this.actualPlayer !== null && this.actualPlayer - 1 >= 0) {
        this.actualPlayer--;
    } else {
        this.actualPlayer = this.players.length - 1;
    }
    return this.actualPlayer;
};

Logic.prototype.getActualPlayerNumber = function () {
    return this.actualPlayer;
};

Logic.prototype.getActualPlayer = function () {
    return this.players[this.actualPlayer];
};

Logic.prototype.getNextPlayer = function () {
    if (this.directionAscending) {
        this.getNextPlayerNumber();
    } else {
        this.getPrevPlayerNumber();
    }

    return this.getActualPlayer();
};

function isAssJackpotCard(card) {
    return ['Zieh2', 'Zieh4-Wuenschen'].indexOf(card.amount) !== -1
}

function isColorWishOverrideCard(card) {
    return ['Zieh4-Wuenschen'].indexOf(card.amount) !== -1;
}

Logic.prototype.checkMove = function (oldCard, playedCard) {
    if (!playedCard) {
        return false;
    }
    if (this.getAssJackpotCount() > 0 && !isAssJackpotCard(playedCard)) {
        return false;
    }
    if (this.hasPlayerColorWish() && (this.getColorWish() !== playedCard.color || isColorWishOverrideCard(playedCard))) {
        return false;
    }
    if (playedCard.special) {
        return true;
    }
    if (oldCard.color === playedCard.color) {
        return true;
    }
    if (oldCard.amount === playedCard.amount) {
        return true;
    }
    return false;
};

Logic.prototype.move = function (cardIndex) {
    var player = this.getActualPlayer();
    var playedCard = player.getAllCards()[cardIndex];

    if (!this.checkMove(this.getActualCard(), playedCard)) {
        return { action: 'wrongMove' };
    }

    this.setActualCard(playedCard);
    player.removeCard(cardIndex);

    switch (playedCard.amount) {
        case 'Richtungswechsel':
            this.directionAscending = !this.directionAscending;
            break;
        case 'Aussetzen':
            this.getNextPlayerNumber();
            break;
        case 'Zieh2':
            this.increaseAssJackpotCount(2);
            break;
        case 'Zieh4-Wuenschen':
            this.increaseAssJackpotCount(4);
            return { action: 'noteWish' };
            break;
        case 'Wuenschen':
            return { action: 'noteWish' };
            break;
    }

    return { action: 'success' };
};

Logic.prototype.hasPlayerWon = function () {
    return this.getActualPlayer().getAllCards().length === 0;
};

Logic.prototype.setColorWish = function (colorWish) {
    this.colorWish = colorWish;
};

Logic.prototype.hasPlayerColorWish = function () {
    return !!this.colorWish;
};

Logic.prototype.getColorWish = function () {
    return this.colorWish;
};

Logic.prototype.addNewCardToPlayer = function () {
    var player = this.getActualPlayer();

    if (this.getAssJackpotCount() > 0) {
        return false;
    }

    var newCards = this.kartenstapel.give(1);
    player.receiveCards(newCards);

    return newCards;
};

Logic.prototype.redeemAssJackpot = function () {
    var player = this.getActualPlayer();

    if (this.getAssJackpotCount() === 0) {
        return false;
    }

    var newCards = this.kartenstapel.give(this.getAssJackpotCount());
    this.resetAssJackpotCount();
    player.receiveCards(newCards);

    return newCards;
};

Logic.prototype.getAssJackpotCount = function () {
    return this.assJackpot;
};

Logic.prototype.increaseAssJackpotCount = function (amount) {
    this.assJackpot += amount;
};

Logic.prototype.resetAssJackpotCount = function () {
    this.assJackpot = 0;
};

module.exports = Logic;