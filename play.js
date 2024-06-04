/**
 * Created by Lucy Gao, 2024
 *
 * This is the file that provides all functionality for play.html.
 */

(function() {
  "use strict";

  /**
  * Initialization of page.
  */
  function init() {
    let database = initializeFirebase();
    updateData(database);

    // TODO: MENU BAR
  }

  /**
   * docstring
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
   * docstring
   */
  function updateData(db) {
    let playerID = "PLAYER #0817";

    // NOTE: need admin access to list top-level collections

    // try {
    //   let collections = await db.listCollections();
    //   collections.forEach(collection => {
    //     if (collection.id != "GamesInfo") {
    //       playerID = collection.id;
    //     }
    //   });
    // } catch (error) {
    //   console.error("Error finding collections: ", error);
    // }

    let elems = qsa(".player-id");
    elems.forEach(element => {
      element.textContent = playerID;
    });

    showGames(db, playerID);
  }

  /**
   * docstring
   */
  async function showGames(db, playerID) {
    id("back").addEventListener("click", () => {
      window.location = "index.html";
    });

    try {
      let doc = await db.collection(playerID).doc("GamesMeta").get();
      if (doc.exists) {
        let games = id("games");
        games.innerHTML = "";
        let data = doc.data();

        for (const key in data) {
          if (data.hasOwnProperty(key) && key != "RecentGame" && key != "RecentScore" && key != "TopScore") {
            let game = gen("div");
            game.classList.add("game");
            game.style.backgroundImage = "url(images/" + key.toLowerCase() + "background.png)";
            let gameName = gen("h1");
            let gameDoc = await db.collection("GamesInfo").doc(key).get();
            if (gameDoc.exists) {
              gameName.textContent = gameDoc.data().Name.toUpperCase();
              game.id = gameDoc.data().Name.split(' ').join('-').toLowerCase();
            }
            else {
              console.log("ERROR: No GamesInfo document for " + key);
            }
            let recentScore = gen("h3");
            recentScore.textContent = "Score: " + data[key].RecentScore;
            let bestScore = gen("h3");
            bestScore.textContent = "Best: " + data[key].TopScore;
            game.appendChild(gameName);
            game.appendChild(recentScore);
            game.appendChild(bestScore);

            let button = gen("button");
            button.classList.add("play-button");
            button.setAttribute("type", "button");
            button.textContent = "PLAY";
            button.addEventListener("click", () => {
              window.location = gameDoc.data().Link;
            });
            game.appendChild(button);
            games.appendChild(game);
          }
        }
      }
    } catch (error) {
      console.error("Error getting games: ", error);
    }
  }

  init();
})();