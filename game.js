/**
 * Created by Lucy Gao, 2024
 *
 * This is the file that provides all functionality for game.html.
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

  function splitAndUpperCase(text) {
    if (text == "RTTime") {
      return "REACTION TIME";
    }
    else {
      return text.split(/(?=[A-Z])/).join(' ').toUpperCase();
    }
  }

  function createRadarChart(data, numberData) {
    id("dropdown-main").innerHTML = "";
    let canvas = gen("canvas");
    let labels = numberData.map(key => splitAndUpperCase(key));
    let chartData = {
      labels: labels,
      datasets: [{
        data: numberData.map(key => data[key]),
        fill: true,
        backgroundColor: 'rgba(137, 176, 207, 0.45)',
        borderColor: '#A1C7EA',
        pointRadius: 5,
        pointBackgroundColor: '#A1C7EA',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#FFFFFF'
      }]
    };

    let config = {
      type: 'radar',
      data: chartData,
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        aspectRatio: 2,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 1,
            pointLabels: {
              font: {
                size: 16,
                family: 'Kodchasan',
              },
              color: "white"
            },
            angleLines: {
              display: true,
              color: 'white',
            },
            grid: {
              color: 'white',
            },
            ticks: {
              display: false,
              beginAtZero: true
            }
          }
        }
      }
    };
    let chart = new Chart(canvas, config);
    id("dropdown-main").appendChild(canvas);
    canvas.classList.add("chart");
    id("dropdown-text").textContent = "RADAR CHART";
  }

  function arrayDropdown(arr, key) {
    id("dropdown-main").innerHTML = "";
    let canvas = gen("canvas");
    let labels = arr.map((_, index) => ("TRIAL " + (index + 1).toString()));
    let chartData = {
      labels: labels,
      datasets: [{
        data: arr,
        pointBackgroundColor: '#A1C7EA',
        pointRadius: 5,
        borderColor: '#A1C7EA',
        borderWidth: 5,
        borderCapStyle: 'round',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#FFFFFF'
      }]
    };
    let config = {
      type: "line",
      data: chartData,
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: key.split(/(?=[A-Z])/).join(' ').toUpperCase(),
              font: {
                size: 16,
                family: 'Kodchasan',
              },
              color: "white"
            },
            min: 0,
            offset: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.3)'
            },
            ticks: {
              color: "white",
              font: {
                size: 12,
                family: 'Kodchasan'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: "TRIAL",
              font: {
                size: 16,
                family: 'Kodchasan',
              },
              color: "white"
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.3)'
            },
            ticks: {
              color: "white",
              font: {
                size: 12,
                family: 'Kodchasan'
              }
            }
          }
        }
      }
    };
    let chart = new Chart(canvas, config);
    id("dropdown-main").appendChild(canvas);
    id("dropdown-text").textContent = key.split(/(?=[A-Z])/).join(' ').toUpperCase() + " ACROSS TRIALS";
  }

  /**
   * Find the Player ID and update the dashboard with the player's data.
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

    showGame(db, playerID);
  }

  /**
   * Load and display the game data. Includes the recent and best score for the game as well as all
   * game features (radar chart, line chart).
   * @param {FirebaseFirestore} db - Cloud Firestore database
   * @param {String} gameShort - shortened name of the game (ex: FID)
   * @param {String} playerID - the player's ID
   * @param {firebase.firestore.QueryDocumentSnapshot} session - the Cloud Firestore document
   * holding data for the desired session
   */
  async function showGameFeatures(db, gameShort, playerID, session) {
    // display Session1 as SESSION #1
    let split = session.id.match(/^([a-zA-Z]+)(\d+)$/);
    if (split) {
      id("session").textContent = split[1].toUpperCase() + " #" + split[2];
    }
    else {
      console.log("Unexpected session name: " + latestSession.id);
    }

    let data = session.data();
    let gameDoc = await db.collection("GamesInfo").doc(gameShort).get();
    if (gameDoc.exists) {
      id("recent-trial-game").textContent = gameDoc.data().Name.toUpperCase();
    }
    qs("#recent-trial-score h1").textContent = data.Score;
    let gameScoreDoc = await db.collection(playerID).doc("GamesMeta").get();
    qs("#top-score h1").textContent = gameScoreDoc.data()[gameShort].TopScore;

    document.body.style.backgroundImage = "url(images/" + gameShort + "gamedash.png)";
    id("back").addEventListener("click", () => {
      window.location = "index.html";
    });

    // modify dropdown
    id("dropdown-content").innerHTML = "";
    let keys = Object.keys(data).sort();
    let numberData = [];
    keys.forEach(key => {
      if (key != "Score") {
        if (typeof(data[key]) == "number") {
          numberData.push(key);
        }
        else if (Array.isArray(data[key])) {
          let p = gen("p");
          p.id = key.toLowerCase();
          let arr = data[key];
          p.textContent = key.split(/(?=[A-Z])/).join(' ').toUpperCase() + " ACROSS TRIALS";
          p.addEventListener("click", () => {
            arrayDropdown(arr, key);
          });
          id("dropdown-content").appendChild(p);
        }
        else {
          console.log("Unexpected field type: " + typeof(data[key]))
        }
      }
    });
    if (numberData.length != 0) {
      let p = gen("p");
      p.id = "radar-chart";
      p.textContent = "RADAR CHART";
      p.addEventListener("click", () => {
        createRadarChart(data, numberData);
      });
      createRadarChart(data, numberData);
      id("dropdown-content").insertBefore(p, id("dropdown-content").firstChild);
    }
  }

  /**
   * Find all game sessions and populate the dashboard with game data.
   * @param {FirebaseFirestore} db - Cloud Firestore database
   * @param {String} playerID - the player's ID
   */
  async function showGame(db, playerID) {
    let params = new URLSearchParams(window.location.search);
    let gameShort = params.get("game");

    try {
      // show latest session data
      let sessionDocs = await db.collection(playerID).doc("GamePlay").collection(gameShort).get();
      let latestSession = null;
      sessionDocs.forEach(doc => {
        if (!latestSession || doc.id > latestSession.id) {
          latestSession = doc;
        }
      });
      if (latestSession.exists) {
        showGameFeatures(db, gameShort, playerID, latestSession);
      }

      // find maximum session number
      let split = latestSession.id.match(/^([a-zA-Z]+)(\d+)$/);
      let maxSessionNum = parseInt(split[2]);
      id("right-arrow").classList.add("hidden");

      // add event listeners to previous and next arrows
      id("right-arrow").addEventListener("click", async () => {
        let curr = parseInt(id("session").textContent.split(' #')[1]);
        if (curr + 1 <= maxSessionNum) {
          let nextSession = await db.collection(playerID).doc("GamePlay").collection(gameShort).doc("Session" + (curr + 1)).get();
          showGameFeatures(db, gameShort, playerID, nextSession);

          if (id("left-arrow").classList.contains("hidden")) {
            id("left-arrow").classList.remove("hidden");
          }
          if (curr + 1 == maxSessionNum) {
            id("right-arrow").classList.add("hidden");
          }
        }
      });

      id("left-arrow").addEventListener("click", async () => {
        // navigate to previous session
        let curr = parseInt(id("session").textContent.split(' #')[1]);
        let prevSession = await db.collection(playerID).doc("GamePlay").collection(gameShort).doc("Session" + (curr - 1)).get();
        if (prevSession.exists) {
          showGameFeatures(db, gameShort, playerID, prevSession);
          if (id("right-arrow").classList.contains("hidden")) {
            id("right-arrow").classList.remove("hidden");
          }

          // no more previous sessions
          if (curr - 1 == 1) {
            id("left-arrow").classList.add("hidden");
          }
        }
        else {
          console.log("No previous session: " + prevNum);
        }
      });
    } catch (error) {
      console.error("Error getting game information: ", error);
    }
  }

  init();
})();