'use strict';
var Card = require('./card');

var Kartenstapel = function (farben, deckseiten, sonder) {
    this.farben = farben || ['blau', 'gruen', 'rot', 'gelb'];
    this.deckseiten = deckseiten || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'RichtungsWechsel', 'Zieh2', 'Aussetzen'];
    this.sonder = sonder || ['Wuenschen', 'Zieh4-Wuenschen'];
    this.stapel = [];
};

var prototypeMethods = {
    initialize: function () {
        this.createStapel();
    },

    createStapel: function () {
        this.farben.forEach(function (farbe) {
            this.deckseiten.forEach(function (deckseite) {
                this.stapel.push(new Card(farbe, deckseite));
            }.bind(this));
        }.bind(this));
        this.sonder.forEach(function (karte) {
            this.stapel.push(new Card(karte, karte, true));
        }.bind(this));

        // double stapel
        for (var i = 1; i < 2; i++) {
            this.stapel = this.stapel.concat(this.stapel);
        }
    },

    give: function (amount) {
        var cards = [];
        for (var i = 0; i < amount; i++) {
            var cardPosition = Math.round(Math.random() * this.stapel.length);
            cards = cards.concat(this.stapel.splice(cardPosition, 1));
        }
        return cards;
    },

    getStapelCount: function () {
        return this.stapel.length;
    },

    getAllColors: function () {
        return this.farben;
    }
};

Object.keys(prototypeMethods).forEach(function (methodName) {
    Kartenstapel.prototype[methodName] = prototypeMethods[methodName];
});

module.exports = Kartenstapel;