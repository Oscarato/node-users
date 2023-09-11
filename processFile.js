const fs = require('fs');

function processFile(filePath) {
 fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const words = data.split(/\s+/);
    const wordCount = {};

    words.forEach((word) => {
      if (word in wordCount) {
        wordCount[word]++;
      } else {
        wordCount[word] = 1;
      }
    });

    console.log(wordCount);
 });
}

module.exports = processFile;