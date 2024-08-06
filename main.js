/**
 * Created by Lucy Gao, 2024
 *
 * This is the file that provides all functionality for index.html.
 * It loads data from a Google Firebase database and displays it for the dashboard.
 *
 * Firebase Database: https://console.firebase.google.com/u/0/project/survivors-7fb7c/firestore/databases/-default-/data/~2F
 */

(function() {
  "use strict";

  /**
  * Initialization of page.
  */
  function init() {
    let database = initializeFirebase();
    updateData(database);

    // TODO: ADD MENU BAR LINKS
  }

  /**
   * Initialize the Firebase configuration to use the data in this Cloud Firestore database:
   * https://console.firebase.google.com/u/0/project/survivors-7fb7c/firestore/databases/-default-/data/~2F
   */
  function initializeFirebase() {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBYm2l9oxUy0YPC_-uoyzHcr_kIbTOscvE",
      authDomain: "survivors-7fb7c.firebaseapp.com",
      projectId: "survivors-7fb7c",
      storageBucket: "survivors-7fb7c.appspot.com",
      messagingSenderId: "499787496541",
      appId: "1:499787496541:web:b4c390cf1d1f9c39e7a1b4",
      measurementId: "G-0RVESW34CC"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    return db;
  }

  /**
   * Find the Player ID and update all of the different parts of the dashboard with player data
   * stored in the Cloud Firestore database.
   * @param {FirebaseFirestore} db - Cloud Firestore database
   */
  async function updateData(db) {
    let params = new URLSearchParams(window.location.search);
    let uid = params.get("uid");

    try {
      let doc = await db.collection("Users").doc(uid).get();
      if (doc.exists) {
        let data = doc.data();
        let playerID = data.playerID;
        id("player-id").textContent = playerID;

        // update links
        let curr = new URLSearchParams(window.location.search);
        let uid = curr.get("uid");
        let params = new URLSearchParams();
        params.set('uid', uid)
        id("play-link").href = "play.html?" + params.toString();

        // Load games, recent trial, leaderboard, notifications
        loadGames(db, playerID);
        loadRecentTrial(db, playerID);
        loadLeaderboard(db, playerID);
        loadNotifications(db, playerID);
        loadAvatar(db, playerID);
      }
    } catch (error) {
      console.error("Error getting player ID: ", error);
    }
  }

  /**
   * Change screen to show game page URL of the given game.
   * @param {String} shorthand - shortened name of the game (ex: FID)
   */
  function showGamePage(shorthand) {
    let curr = new URLSearchParams(window.location.search);
    let uid = curr.get("uid");
    let params = new URLSearchParams();
    params.set('game', shorthand);
    params.set('uid', uid)
    window.location = "game.html?" + params.toString();
  }

  /**
   * Load the games section of the main dashboard. This shows all the games stored in the database
   * along with the player's recent and best scores. Each game also links to a game-specific dashboard.
   * @param {FirebaseFirestore} db - Cloud Firestore database
   * @param {String} playerID - the player's ID
   */
  async function loadGames(db, playerID) {
    try {
      let doc = await db.collection(playerID).doc("GamesMeta").get();
      if (doc.exists) {
        let games = id("games");
        games.innerHTML = "";
        let data = doc.data();

        for (const key in data) {
          if (data.hasOwnProperty(key) && key != "avatarURL" && key != "RecentGame" && key != "RecentScore" && key != "TopScore") {
            let game = gen("div");
            game.id = key;
            game.classList.add("game");
            game.style.backgroundImage = "url(images/" + key.toLowerCase() + "background.png)";
            let gameDetails = gen("div");
            gameDetails.classList.add("game-details");
            let gameName = gen("h2");

            let gameDoc = await db.collection("GamesInfo").doc(key).get();
            if (gameDoc.exists) {
              gameName.textContent = gameDoc.data().Name.toUpperCase();
              gameName.classList.add("game-name");
            }
            else {
              console.log("ERROR: No GamesInfo document for " + key);
            }

            let scores = gen("div");
            scores.classList.add("scores");
            let recentScore = gen("p");
            recentScore.classList.add("recent-score");
            recentScore.textContent = "Score: " + data[key].RecentScore;
            let bestScore = gen("p");
            bestScore.classList.add("best-score");
            bestScore.textContent = "Best: " + data[key].TopScore;
            scores.appendChild(recentScore);
            scores.appendChild(bestScore);
            gameDetails.appendChild(gameName);
            gameDetails.appendChild(scores);
            let button = gen("button");
            button.id = gameDoc.data().Name.split(' ').join('-').toLowerCase() + "-button";
            button.setAttribute("type", "button");
            button.textContent = "?";
            button.addEventListener("click", () => {
              showGamePage(key);
            });

            game.appendChild(gameDetails);
            game.appendChild(button);
            game.addEventListener("click", () => {
              showGamePage(key);
            });
            games.appendChild(game);
          }
        }
      }
    } catch (error) {
      console.error("Error getting games: ", error);
    }
  }

  /**
  * Show the recent trial panel on the main dashboard. Shows the game the player has most recently
  * played, their score, win/loss ratio, and a link to the game-specific dashboard.
  * @param {FirebaseFirestore} db - Cloud Firestore database
  * @param {String} playerID - the player's ID
  */
  async function loadRecentTrial(db, playerID) {
    try {
      let doc = await db.collection(playerID).doc("GamesMeta").get();
      if (doc.exists) {
        let data = doc.data();
        let recentGame = data.RecentGame;
        let gameName = "";
        let nameDoc = await db.collection("GamesInfo").doc(recentGame).get();
        if (nameDoc.exists) {
          gameName = nameDoc.data().Name;
        }
        else {
          console.log("Full name of " + recentGame + " not found.");
        }
        // update HTML
        id("recent-trial-game").textContent = gameName.toUpperCase();
        qs("#recent-trial-score h1").textContent = data.RecentScore;

        let sessionDocs = await db.collection(playerID).doc("GamePlay").collection(recentGame).get();
        let latestSession = null;
        sessionDocs.forEach(doc => {
          if (!latestSession || doc.id > latestSession.id) {
            latestSession = doc;
          }
        });
        if (latestSession.exists) {
          let gameData = latestSession.data();
          let wins = gameData.State.filter(item => item === 1).length;
          let losses = gameData.State.length - wins;
          id("recent-trial-win").textContent = wins + " win";
          let width = 100 * wins / gameData.State.length;
          id("recent-trial-win").style.width = width + "%";
          id("recent-trial-loss").textContent = losses + " loss";
        }
        else {
          console.log("Could not find game win/loss information for " + recentGame + ".");
        }

        id("recent-trial").style.backgroundImage = "url(images/" + recentGame.toLowerCase() + "background.png)";
        id("expand").addEventListener("click", () => {
          showGamePage(recentGame);
        });
      }
    } catch (error) {
      console.error("Error getting recent trial: ", error);
    }
  }

  /**
  * Show the leaderboard section on the main dashboard using data from the Cloud Firestore database.
  * @param {FirebaseFirestore} db - Cloud Firestore database
  */
  async function loadLeaderboard(db) {
    try {
      let doc = await db.collection("GamesInfo").doc("GlobalLeaderboard").get();
      if (doc.exists) {
        let data = doc.data();
        let leaderboard = data.Leaderboard;
        let table = qs("#leaderboard-table tbody");
        table.innerHTML = "";

        // sort the leaderboard map
        let entries = Object.entries(leaderboard)
        let sorted = entries.sort((a, b) => b[1] - a[1]);
        for (const item of sorted) {
          let row = gen("tr");
          let playerID = gen("td");
          playerID.textContent = item[0];
          let playerScore = gen("td");
          playerScore.textContent = item[1];
          row.appendChild(playerID);
          row.appendChild(playerScore);
          table.appendChild(row);
        }
      }
    } catch (error) {
      console.error("Error getting leaderboard: ", error);
    }
  }

  /**
  * Show the notifications panel on the main dashboard from data in the Cloud Firestore database.
  * @param {FirebaseFirestore} db - Cloud Firestore database
  * @param {String} playerID - the player's ID
  */
  async function loadNotifications(db, playerID) {
    try {
      let doc = await db.collection(playerID).doc("Notification").get();
      if (doc.exists) {
        let data = doc.data();
        let notifList = qs("#notif-list");
        notifList.innerHTML = "";

        // get keys alphabetically
        let keys = Object.keys(data).sort();
        keys.forEach(key => {
          let notif = gen("div");
          notif.classList.add("notif");
          let img = gen("img");
          img.src = "images/notification.png";
          let notifMessage = gen("p");
          notifMessage.textContent = data[key];
          notif.appendChild(img);
          notif.appendChild(notifMessage);
          notifList.appendChild(notif);
        });
      }
    } catch (error) {
      console.error("Error getting notifications: ", error);
    }
  }

  /**
   * Load the player's ReadyPlayerMe avatar.
   * @param {FirebaseFirestore} db - Cloud Firestore database
   * @param {String} playerID - the player's ID
   */
  async function loadAvatar(db, playerID) {
    try {
      let doc = await db.collection(playerID).doc("GamesMeta").get();
      if (doc.exists) {
        let avatarURL = doc.data().avatarURL;

        // use ReadyPlayerMe API to get 2D image of avatar
        // trim off the ".glb" file type
        let baseURL = avatarURL.substring(0, avatarURL.indexOf(".glb"));
        let url = baseURL + ".png?blendShapes[mouthSmile]=0.2&camera=fullbody&quality=100&size=1024";
        let resp = await fetch(url);
        if (!resp.ok) {
          throw Error("Error in ReadyPlayerMe request: " + resp.statusText);
        }
        let blob = await resp.blob();
        let avatarImage = URL.createObjectURL(blob);
        id("2d-avatar").setAttribute("src", avatarImage);
      }
    } catch (error) {
      console.error("Error getting player avatar: ", error);
    }
  }

  init();
})();