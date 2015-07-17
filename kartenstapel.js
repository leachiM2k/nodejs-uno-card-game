'use strict';
var chalk = require('chalk');
var Card = require('./card');

var Kartenstapel = {
	farben: [chalk.blue('blau'), chalk.green('gruen'), chalk.red('rot'), chalk.yellow('gelb')],
	deckseiten: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'RichtungsWechsel', 'Zieh2', 'Aussetzen'],
	sonder: ['Wuenschen', 'Zieh4-Wuenschen'],

	stapel: [],

	initialize: function() {
		this.createStapel();
	},

	createStapel: function() {
		this.farben.forEach(function(farbe) {
			this.deckseiten.forEach(function(deckseite) {
				this.stapel.push(new Card(farbe, deckseite));
			}.bind(this));
		}.bind(this));
		this.sonder.forEach(function(karte) {
			this.stapel.push(new Card(karte, karte, true));
		}.bind(this));

		// double stapel
		for (var i = 1; i < 2; i++) {
			this.stapel = this.stapel.concat(this.stapel);
		}
	},

	give: function(amount) {
		var cards = [];
		for (var i = 0; i < amount; i++) {
			var cardPosition = Math.round(Math.random() * this.stapel.length);
			cards = cards.concat(this.stapel.splice(cardPosition, 1));
		}
		return cards;
	}
};

module.exports = Kartenstapel;