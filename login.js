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

    const provider = new firebase.auth.GoogleAuthProvider();
    const db = firebase.firestore();

    id("start").addEventListener('click', () => {
      // login with google
      auth.signInWithPopup(provider)
      .then((result) => {
        var user = result.user;
        // create a playerid subfield - user picks their own username
        // subfield for prolific id - user inputs this when they pick username - just 2 input boxes
        // readyplayerme thing
        var userRef = db.collection('Users').doc(user.uid);
        userRef.set({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL
        }).then(function() {
          subscribeAvatarEvents(db, user.uid);
          console.log('User data stored in Firestore');
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
      })
      .catch((error) => {
        console.error('Error during sign-in:', error);
      });
    })

    auth.onAuthStateChanged(function(user) {
      if (user) {
        var userRef = db.collection('Users').doc(user.uid);

        // save user data in firestore database
        userRef.set({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL
        }).then(function() {
          subscribeAvatarEvents(db, user.uid);
          console.log('User data stored in Firestore');
        }).catch(function(error) {
          console.error('Error storing user data:', error);
        });
      }
    });

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
      // reset form fields
      id("player-id").value = "";
      id("prolific-id").value = "";
      id("info-form").classList.add("hidden");

      // TODO
      // if (id("yes").checked) {

      // }
      // else {
      //   // show avatar creation if no account
        id("avatar-creation").classList.remove("hidden");
      // }

      // show main dashboard w player info + rpm avatar

    }).catch(function(error) {
      console.error('Error storing user data:', error);
    });
  }

  /**
   * .
   * Taken from ReadyPlayerMe Quickstart code:
   * https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native-integration/quickstart
   */
  function subscribeAvatarEvents(db, uid) {
    window.addEventListener('message', (e) => {
      subscribe(db, uid, e)
    });
    document.addEventListener('message', (e) => {
      subscribe(db, uid, e)
    });
  }

  /**
   * Taken from ReadyPlayerMe Quickstart code:
   * https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native-integration/quickstart
   *
   */
  function subscribe(db, uid, event) {
    const json = parse(event);

    if (json?.source !== 'readyplayerme') {
      return;
    }

    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === 'v1.frame.ready') {
      frame.contentWindow.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**'
        }),
        '*'
      );
    }

    // Get avatar GLB URL
    if (json.eventName === 'v1.avatar.exported') {
      var userRef = db.collection('Users').doc(uid);

      // save avatar in firestore database
      userRef.update({
        avatarURL: json.data.url
      }).then(function() {
        id('avatar-creation').classList.add("hidden");
        id('success-msg').classList.remove("hidden");
      }).catch(function(error) {
        console.error('Error storing ReadyPlayerMe avatar URL:', error);
      });
    }

    // Get user id
    if (json.eventName === 'v1.user.set') {
      console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }
  }

  /**
   * .
   *
   */
  function parse(event) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  }

  init();
})();