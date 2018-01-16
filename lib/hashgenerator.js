'use strict';
var randomstring = require("randomstring");
var i = -1;

module.exports = function() {
    //return ['a','b','c','d','e','f','g'][i++];
    return randomstring.generate();
}