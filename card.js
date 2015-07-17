'use strict';

function Card(color, amount, special) {
	this.color = color;
	this.amount = amount;
	this.special = special || false;
};
Card.prototype.getName = function() {
	if (this.special) {
		return this.color;
	}
	return this.color + ' ' + this.amount;
};

module.exports = Card;