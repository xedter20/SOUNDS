const express = require('express');
const app = express();
const player = require('play-sound')((opts = {}));

const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello Worldss!');
});

app.get('/playAudioAlarm', (req, res) => {
  player.play('audio/emergency-alarm.mp3', function (err) {
    if (err) throw err;
    res.json({
      success: true
    });
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
