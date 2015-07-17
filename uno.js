'use strict';
var chalk = require('chalk');
var inq = require('inquirer');
var Player = require('./player');
var Kartenstapel = require('./Kartenstapel');

var UnoGame = {
	players: [],
	playersAmount: 3,
	kartenstapel: null,
	actualPlayer: null,
	actualCard: null,
	wish: null,
	assJackpot: 0,
	directionAscending: true,

	initialize: function() {
		this.kartenstapel = Kartenstapel;
		this.kartenstapel.initialize();
	},

	start: function() {
		this.createPlayers();

		console.log('-----');
		this.actualCard = this.kartenstapel.give(1)[0];
		console.log('Aufgedeckt: ' + this.actualCard.getName());

		this.nextPlayer();
	},

	createPlayers: function() {
		for (var i = 0; i < this.playersAmount; i++) {
			var player = new Player();
			player.receiveCards(this.kartenstapel.give(7));
			player.setName('Spieler ' + (i + 1));
			this.players.push(player);
			console.log(player.getName() + ' bekommt: ' +
				player.getAllCards().map(function(card) {
					return card.getName();
				}).join(', '));
		}
	},

	getNextPlayer: function() {
		if (this.actualPlayer !== null && this.actualPlayer + 1 < this.players.length) {
			this.actualPlayer++;
		} else {
			this.actualPlayer = 0;
		}
		return this.actualPlayer;
	},

	getPrevPlayer: function() {
		if (this.actualPlayer !== null && this.actualPlayer - 1 >= 0) {
			this.actualPlayer--;
		} else {
			this.actualPlayer = this.players.length - 1;
		}
		return this.actualPlayer;
	},

	nextPlayer: function() {
		if(this.directionAscending) {
			this.getNextPlayer();			
		} else {
			this.getPrevPlayer();
		}
		this.play();
	},

	play: function() {
		var player = this.players[this.actualPlayer];

		console.log('-----');
		console.log(player.getName() + ' ist an der Reihe');

		if(this.wish) {
			console.log('***** Es wurde eine Farbe gewuenscht. Sie muessen nun ' + this.wish + ' legen. *****');
		}
		
		var choices = player.getChoices();

		if(this.assJackpot) {
			console.log('***** Sie muessten ' + this.assJackpot + ' Karten ziehen. Es sei denn, sie benutzen selbst eine Zieh-Karte. *****');
			choices.push({
				name: this.assJackpot + ' Karten ziehen',
				value: 'getCard'
			});
		} else {
			choices.push({
				name: 'Karte ziehen',
				value: 'getCard'
			});	
		}
		
		inq.prompt([{
			name: 'card',
			type: 'list',
			message: 'Welcher Karte spielen?',
			choices: choices
		}], function(answer) {
			this.processPlayerAnswer(answer.card, player);
		}.bind(this));
	},

	processPlayerAnswer: function(card, player) {
		if (card === 'getCard') {
			var amount = 1;
			if(this.assJackpot) {
				amount = this.assJackpot;
				this.assJackpot = 0;
			}
			var newCards = this.kartenstapel.give(amount);
			player.receiveCards(newCards);
			console.log(player.getName() + ' zieht diese Karte: ' + newCards.map(function(card) {
					return card.getName();
				}).join(', '));
		} else {
			var playedCard = player.getAllCards()[card];
			if(this.checkMove(this.actualCard, playedCard)) {
				this.actualCard = playedCard;
				player.removeCard(card);
				
				switch(playedCard.amount) {
					case 'Richtungswechsel':
						this.directionAscending = !this.directionAscending;
					break;
					case 'Aussetzen':
						this.getNextPlayer();
						break;
					case 'Zieh2':
						this.assJackpot += 2;
						break;
					case 'Zieh4-Wuenschen':
						this.assJackpot += 4;
						this.noteWish();
						return;
						break;
					case 'Wuenschen':
						this.noteWish();
						return;
						break;
				}				
			} else {
				console.log(chalk.red('***** Diese Karte kann nicht gespielt werden. Bitte eine neue aussuchen! *****'));
				console.log('Aktuell aufgedeckt: ' + this.actualCard.getName());
				this.play();
				return;
			}
		}

		var leftCards = player.getAllCards().length;
		if (leftCards === 0) {
			console.log(chalk.red('******************************'));
			console.log(player.getName() + ' hat keine Karten mehr -> GEWONNEN');
			return;
		}

		this.nextPlayer();
	},
	
	checkMove: function(oldCard, playedCard) {
		if(this.assJackpot && ['Zieh2', 'Zieh4-Wuenschen'].indexOf(playedCard.amount) === -1) {
			return false;
		}
		if(this.wish && (this.wish !== playedCard.color || ['Zieh4-Wuenschen'].indexOf(playedCard.amount) !== -1)) {
			return false;
		}
		if(playedCard.special) {
			return true;
		}	
		if(oldCard.color === playedCard.color) {
			return true;
		}
		if(oldCard.amount === playedCard.amount) {
			return true;
		}
		return false;
	},

	noteWish: function() {
		var choices = this.kartenstapel.farben.map(function(farbe) {
			return {
				name: farbe,
				value: farbe
			}
		});
		inq.prompt([{
			name: 'wish',
			type: 'list',
			message: 'Welche Farbe soll der nächste Spieler legen?',
			choices: choices
		}], function(answer) {
			this.wish = answer.wish;
			this.nextPlayer();
		}.bind(this));
	}

};

module.exports = UnoGame;