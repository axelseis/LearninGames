


var words = require("an-array-of-english-words");
var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','t','u','v','w','x','y','z'];

get4RandomLetters = function(excludeletter,templateWord){
  var rand = [];
  var tempLetter = letters[Math.floor(Math.random()*100)];
  while(rand.length < 5){
    while(words.indexOf(templateWord.replace('_',tempLetter)) != -1 || rand.indexOf(tempLetter) != -1){
      tempLetter = letters[Math.floor(Math.random()*100)];
    }
    rand.push(tempLetter);
  }
  return rand;
}

var Test = function(){
  this.words = words;
  this.lastWords = []
}


Test.prototype = {
  
  _getRandomWord: function(){
    var wordN = Math.floor(Math.random()*this.words.length);
    while(this.lastWords.indexOf(wordN) != -1){
      wordN = Math.floor(Math.random()*this.words.length);
    }

    var word = this.words[wordN];
    var letterN = Math.floor(Math.random()*this.words[wordN].length);
    var letter = word.charAt(letterN);
    var templateWord = word.substr(0, letterN) + '_' + word.substr(letterN+1);
    var filled = get4RandomLetters(letter,templateWord).concat(letter).sort(function(){return 0.5 - Math.random()});
    /*
    var filled = this.words[wordN][2].concat(this.words[wordN][1][letterN]).sort(function(){return 0.5 - Math.random()}).splice(0,5);

    */
    this.lastWords.push(wordN);
    if(this.lastWords.length > 200){
      this.lastWords.shift();
    }
    return [word,templateWord, filled.toString()];
  },

  init: function(){
    for (var i = 0; i < 100; i++) {
      console.log('_getRandomWord:', this._getRandomWord());
    }  
  }
}

module.exports = new Test();

