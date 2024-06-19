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
   * Find the Player ID and show all games in Cloud Firestore database.
   * @param {FirebaseFirestore} db - Cloud Firestore database
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
   * Show all games in Cloud Firestore database.
   * @param {FirebaseFirestore} db - Cloud Firestore database
   * @param {String} playerID - the player's ID
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
            game.appendChild(gameName);

            game.addEventListener("click", () => {
              window.location = gameDoc.data().Link;
            });
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