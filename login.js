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
    id("info-form").classList.add("hidden");
    id("intro").classList.remove("hidden");

    let database = initializeFirebase();
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
    const auth = firebase.auth();
    const db = firebase.firestore();

    id("start").addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      // login with google
      auth.signInWithPopup(provider)
      .then((result) => {
        var user = result.user;

        // check if user has an existing account in database
        const userRef = db.collection("Users").doc(user.uid);
        userRef.get()
          .then((docSnapshot) => {
            if (docSnapshot.exists) {
              userRef.onSnapshot(() => {
                // continue to play page
                let params = new URLSearchParams();
                params.set('uid', user.uid);
                window.location = "play.html?" + params.toString();
              });
            } else {
              // user doesn't exist yet, prompt user to make account
              userRef.set({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                profilePicture: user.photoURL
              }).then(function() {
                // show player ID and prolific ID entry
                id("info-form").classList.remove("hidden");
                id("intro").classList.add("hidden");
                // add EventListener for form submission
                id("info-form").addEventListener("submit", (e) => {
                  e.preventDefault();
                  savePlayerInfo(db, user.uid);
                });
              }).catch(function(error) {
                console.error('Error storing user data:', error);
              });
            }
        });
      })
      .catch((error) => {
        console.error('Error during sign-in:', error);
      });
    })

    return db;
  }

  /**
   * .
   *
   */
  function savePlayerInfo(db, uid) {
    var userRef = db.collection('Users').doc(uid);

    // save user data in firestore database
    userRef.update({
      playerID: id("player-id").value,
      prolificID: id("prolific-id").value
    }).then(function() {
      let playerID = "PLAYER #" + id("player-id").value.toUpperCase();

      // reset form fields
      id("player-id").value = "";
      id("prolific-id").value = "";
      id("info-form").classList.add("hidden");

      // pick readyplayerme avatar
      id("avatar-creation").classList.remove("hidden");
      let elems = qsa("#avatars img");
      elems.forEach(element => {
        let src = element.src;
        // just get the avatar ID from the picture
        let match = src.match(/\/avatars\/([a-f0-9]+)\.png$/);
        let avatarID = match ? match[1] : null;
        let url = "https://models.readyplayer.me/" + avatarID + ".glb";
        element.addEventListener("click", () => {
          // save avatar in firestore database
          var user = db.collection('Users').doc(uid);
          user.update({
            avatarURL: url
          }).then(function() {
            var playerIDRef = db.collection(playerID).doc("GamesMeta");
            playerIDRef.update({
              avatarURL: url
            }).then(function() {
              id('avatar-creation').classList.add("hidden");
              id('success-msg').classList.remove("hidden");
              setTimeout(() => {
                let params = new URLSearchParams();
                params.set('uid', uid);
                window.location = "play.html?" + params.toString();
              }, 3000);
            }).catch(function(error) {
              console.error('Error storing ReadyPlayerMe avatar URL into GamesMeta:', error);
            });


          }).catch(function(error) {
            console.error('Error storing ReadyPlayerMe avatar URL:', error);
          });
        });
      });

    }).catch(function(error) {
      console.error('Error storing user data:', error);
    });
  }

  init();
})();