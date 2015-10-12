'use strict';
var chalk = require('chalk');
var inq = require('inquirer');
var Logic = require('./logic');
var Player = require('./player');
var Kartenstapel = require('./Kartenstapel');

var UnoGame = {
    playersAmount: 2,
    actualPlayer:  null,

    initialize: function () {
        var cliFarben = [chalk.blue('blau'), chalk.green('gruen'), chalk.red('rot'), chalk.yellow('gelb')];
        var kartenstapel = new Kartenstapel(cliFarben);
        this.logic = new Logic(kartenstapel);
    },

    start: function () {
        this.createPlayers();

        console.log('-----');
        var card = this.logic.startGame();
        console.log('Aufgedeckt: ' + card.getName());

        this.play();
    },

    createPlayers: function () {
        for (var i = 0; i < this.playersAmount; i++) {
            var player = this.logic.addPlayer('Spieler ' + (i + 1), 7);
            console.log(player.getName() + ' bekommt: ' +
                player.getAllCards().map(function (card) {
                    return card.getName();
                }).join(', '));
        }
    },

    playWithNextPlayer: function () {
        this.logic.getNextPlayer();
        this.play();
    },

    play: function () {
        console.log('-----');
        console.log(this.logic.getActualPlayer().getName() + ' ist an der Reihe');

        if (this.logic.hasPlayerColorWish()) {
            console.log('***** Es wurde eine Farbe gewuenscht. Sie muessen nun ' + this.logic.getColorWish() + ' legen. *****');
        }

        var choices = this.logic.getActualPlayer().getChoices();

        var assJackpot = this.logic.getAssJackpotCount();
        if (assJackpot) {
            console.log('***** Sie muessten ' + assJackpot + ' Karten ziehen. Es sei denn, sie benutzen selbst eine Zieh-Karte. *****');
            choices.push({
                name:  assJackpot + ' Karten ziehen',
                value: 'getAssJackpot'
            });
        } else {
            choices.push({
                name:  'Karte ziehen',
                value: 'getCard'
            });
        }

        inq.prompt([{
            name:    'card',
            type:    'list',
            message: 'Welcher Karte spielen?',
            choices: choices
        }], function (answer) {
            this.processPlayerAnswer(answer.card);
        }.bind(this));
    },

    processPlayerAnswer: function (cardIndex) {
        if (cardIndex === 'getAssJackpot') {
            var jackpotCards = this.logic.redeemAssJackpot();
            if (jackpotCards === false) {
                console.log(chalk.red('***** Dieser Zug ist unzulässig.'));
                this.play();
                return;
            }
            console.log(this.logic.getActualPlayer().getName() + ' zieht den Jackpot mit: ' + jackpotCards.map(function (card) {
                    return card.getName();
                }).join(', '));

        } else if (cardIndex === 'getCard') {
            var newCard = this.logic.addNewCardToPlayer();
            if (newCard === false) {
                console.log(chalk.red('***** Dieser Zug ist unzulässig.'));
                this.play();
                return;
            }
            console.log(this.logic.getActualPlayer().getName() + ' zieht diese Karte: ' + newCard.map(function (card) {
                    return card.getName();
                }).join(', '));
        } else {
            var moveResult = this.logic.move(cardIndex);

            if (moveResult.action === 'wrongMove') {
                console.log(chalk.red('***** Diese Karte kann nicht gespielt werden. Bitte eine neue aussuchen! *****'));
                console.log('Aktuell aufgedeckt: ' + this.logic.getActualCard().getName());
                this.play();
                return;
            }
            if (moveResult.action === 'noteWish') {
                this.noteWish();
                return;
            }
        }

        if (this.logic.hasPlayerWon()) {
            console.log(chalk.red('******************************'));
            console.log(this.logic.getActualPlayer().getName() + ' hat keine Karten mehr -> GEWONNEN');
            return;
        }

        this.playWithNextPlayer();
    },

    noteWish: function () {
        var choices = Kartenstapel.getAllColors().map(function (farbe) {
            return {
                name:  farbe,
                value: farbe
            }
        });
        inq.prompt([{
            name:    'wish',
            type:    'list',
            message: 'Welche Farbe soll der nächste Spieler legen?',
            choices: choices
        }], function (answer) {
            this.logic.setColorWish(answer.colorWish);
            this.playWithNextPlayer();
        }.bind(this));
    }

};

module.exports = UnoGame;