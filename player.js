'use strict';

function Player() {
	this.cards = [];
	this.name = 'Unbekannter Spieler';
};
Player.prototype.receiveCards = function(cards) {
	this.cards = this.cards.concat(cards);
};
Player.prototype.getAllCards = function() {
	return this.cards;
};
Player.prototype.removeCard = function(cardPosition) {
	this.cards.splice(cardPosition, 1);
};
Player.prototype.setName = function(name) {
	this.name = name;
};
Player.prototype.getName = function() {
	return this.name;
};
Player.prototype.getChoices = function() {
	return this.cards.map(function(card, index) {
		return {
			name: card.getName(),
			value: index
		};
	});
};

module.exports = Player;