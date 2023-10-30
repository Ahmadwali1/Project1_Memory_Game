if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

// All game audio we are using
class AudioController {
  constructor() {
    this.bgMusic = new Audio("sounds/melodyloops-preview-rap-dude-2m30s.mp3");
    this.flipSound = new Audio("sounds/book_page-45210.mp3");
    this.matchSound = new Audio("sounds/Assets_Audio_match.wav");
    this.victorySound = new Audio("sounds/level-win-6416.mp3");
    this.gameOverSound = new Audio(
      "sounds/ochoochogift-winner-laugh-154997.mp3"
    );
    this.bgMusic.volume = 0.5;
    this.bgMusic.loop = true;
  }
  // background music starts
  startMusic() {
    this.bgMusic.play();
  }
  //stoping background music when it is needed
  stopMusic() {
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }
  //flipping sound of a card
  flip() {
    this.flipSound.play();
  }
  // Two cards match use this sound
  match() {
    this.matchSound.play();
  }
  // game win sound
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  // gameover sound
  gameOver() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}

// game logic and structure for the game
class MixOrMatch {
  constructor(totalTime, cards) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timeRemaining = totalTime;
    this.timer = document.getElementById("time_remaining");
    this.ticker = document.getElementById("flips");
    this.audioController = new AudioController();
    this.matchedCards = [];
  }
  // this function will start the game and everything will start over
  startGame() {
    this.cardToCheck = null;
    this.totalClicks = 0;
    this.timeRemaining = this.totalTime;
    this.matchedCards = [];
    this.busy = true;
    //when the game start later apply these changes
    setTimeout(() => {
      this.audioController.startMusic();
      this.shuffleCards();
      this.countDown = this.startCountDown();
      this.busy = false;
    }, 500);
    // first game start hidecards
    this.hidecards();
    this.timer.innerText = this.timeRemaining;
    this.ticker.innerText = this.totalClicks;
  }
  //hidecards function so we can use later
  hidecards() {
    this.cardsArray.forEach(function (card) {
      card.classList.remove("visible");
    });
  }

  //if a card is fliped what should happen
  flipCard(card) {
    if (this.canFlipedCard(card)) {
      this.audioController.flip();
      this.totalClicks++;
      this.ticker.innerText = this.totalClicks;
      card.classList.add("visible");

      if (this.cardToCheck) {
        this.checkForCardMatch(card);
      } else {
        this.cardToCheck = card;
      }
    }
  }
  //looking if two cards are match or not
  checkForCardMatch(card) {
    if (this.getCardType(card) === this.getCardType(this.cardToCheck)) {
      this.cardMatch(card, this.cardToCheck);
    } else {
      this.cardMisMatch(card, this.cardToCheck);
    }
    this.cardToCheck = null;
  }
  //if we find two cards these codes will apply
  cardMatch(card1, card2) {
    this.matchedCards.push(card1);
    this.matchedCards.push(card2);
    this.audioController.match();
    if (this.matchedCards.length === this.cardsArray.length) {
      this.victory();
    }
  }
  //if two cards mismatch the below code will apply
  cardMisMatch(card1, card2) {
    this.busy = true;
    setTimeout(() => {
      card1.classList.remove("visible");
      card2.classList.remove("visible");
      this.busy = false;
    }, 1000);
  }
  // gets cards src image
  getCardType(card) {
    return card.getElementsByClassName("card-value")[0].src;
  }
  //for counting time
  startCountDown() {
    return setInterval(() => {
      this.timeRemaining--;
      this.timer.innerText = this.timeRemaining;
      if (this.timeRemaining === 0) {
        this.gameOver();
      }
    }, 1000);
  }
  // if game is over these thing should happen
  gameOver() {
    clearInterval(this.countDown);
    this.audioController.gameOver();
    document.getElementById("game-over-text").classList.add("visible");
  }

  // if we win the game these code should apply
  victory() {
    clearInterval(this.countDown);
    this.audioController.victory();
    const playerTime = this.totalTime - this.timeRemaining;
    timesArray.push(playerTime);
    updateRanking();
    document.getElementById("victory-text").classList.add("visible");
  }
  // here we are shuffling cards random
  shuffleCards() {
    for (let i = this.cardsArray.length - 1; i > 0; i--) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      this.cardsArray[randIndex].style.order = i;
      this.cardsArray[i].style.order = randIndex;
    }
  }
  //it check if we can flip a card or not
  canFlipedCard(card) {
    return (
      !this.busy &&
      !this.matchedCards.includes(card) &&
      card !== this.cardToCheck
    );
  }
}
let timesArray = [];
let cards = Array.from(document.getElementsByClassName("card"));
function updateRanking() {
  const rankedTimes = timesArray.sort((a, b) => a - b).slice(0, 10);

  const rankingList = document.getElementById("ranking-list");
  rankingList.innerHTML = "";

  rankedTimes.forEach((time, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Rank ${index + 1}: ${time} seconds`;
    rankingList.appendChild(listItem);
  });
  localStorage.setItem("rankings", JSON.stringify(rankedTimes));
}

document.addEventListener("DOMContentLoaded", function () {
  const storeRank = localStorage.getItem("rankings");
  if (storeRank) {
    const parse = JSON.parse(storeRank);
    timesArray = parse;
  }
  const startButton = document.getElementById("start-button");
  const playerNameInput = document.getElementById("player-name");
  const overText = document.querySelector(".over-text");
  const game = new MixOrMatch(60, cards);

  startButton.addEventListener("click", function () {
    const playerName = playerNameInput.value;
    if (playerName.trim() === "") {
      alert("please enter your name before starting the game.");
    } else {
      game.startGame();
      overText.style.display = "none";
      updateRanking();
    }
  });
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      game.flipCard(card);
    });
  });
});

function ready() {
  let overEl = Array.from(document.getElementsByClassName("over-text"));

  overEl.forEach((over) => {
    over.addEventListener("click", function () {
      over.classList.remove("visible");
      game.startGame();
    });
  });
}
