# Survivors Platform Dashboards
*Dashboards for the Survivors Platform*

## Objective
Design and code a dashboard to allow players to engage with scores, in-game feedback, and achievements. The dashboards will display the player's overall statistics and rankings, as well as link to more detailed dashboards for each game. These pages should be very visually engaging for the user and encourage them to explore their historical performance, improve their gameplay, and play the games more.

## Page Breakdown
**Main Dashboard** (`main.html`) - user gets overview of their entire performance and statistics, serves as a main page that links to other more specific pages
- This page pulls from the styles in `styles.css` and the functions in `main.js`. It uses the player's `uid` in the URL to access their game data in the Cloud Firestore database and then populates the dashboard.

**Game Dashboard** (`game.html`) - allows user to delve deeper into their performance in each game
- This page pulls from the styles in `gamestyles.css` and the functions in `game.js`. It uses the player's `uid` and the specific game in the URL to access their game data in the Cloud Firestore database and then populates the dashboard. Chart.js is used for chart creation.

**Play Page** (`play.html`) - displays all games the user can play with links that redirect to the games
- This page pulls from the styles in `playstyles.css` and the functions in `play.js`. It has links to the WebGL builds of the Survivors games.
- In the future, we may want to remove the Back button on this page for new users only to force them to play some games before accessing the dashboards. Otherwise, they will only be met with empty dashboards (currently they will see hardcoded data, we can update the dashboards to be blank if the user has no play data).

**Login Page** (`index.html`) - walks user through the login / account creation process, then redirects to the play page
- The login page is the landing page for the [Github Pages](https://fearlab2022.github.io/survivors-dashboards/). It pulls from the styles in `loginstyles.css` and the functions in `login.js`. It uses Google sign-in for user account creation, has the user pick a ReadyPlayerMe avatar, saves user data in the Cloud Firestore database, and then redirects to the play page.
- There were some issues with having complete customization using ReadyPlayerMe's web integration, since sometimes pressing the `Next` button on the iframe did not trigger the `v1.avatar.exported` event as it should, causing the page to be stuck. In the future, it would be good if this could be implemented to allow users greater flexibility with avatar creation.

## User Flow
The user will start on the login page, and login with Google to create a new account. The user will create a player ID and enter their prolific ID, and then pick a ReadyPlayerMe avatar. After selecting their user, the player's data is saved under `Users` in the Google Cloud Firestore database. The user is redirected to the play page, where they can play the Survivors platform games. After playing games, they can press `HOME` on the play page to navigate to the main dashboard and explore their performance. They can see their recent trial scores, notifications, leaderboard, and links to the game dashboards. By clicking the recent trial section or any of the game dashboard tiles, the user will be brought to the game dashboard for the game they have clicked on. Here, the user can explore more specific insights for that particular game.

If the user already has an existing account, they will be automatically redirected to the play page after signing in with their Google account.

## Debugging
- **User avatar is not showing up, information on the dashboards is not updating** - The main and game dashboards have hardcoded HTML with dummy test data. If this is what you are seeing, this is because the database does not have data for this player ID and is failing to populate the dashboards. Check the console log for more specific errors. Currently, there is only test data in the Cloud Firestore database for player ID `PLAYER #0817`, so for the dashboards to populate this must be the player ID.
- **Menu bar links not working** - This is also likely the same as above. The hardcoded menu bar links are just `#`.
- **Inventory, Store links** - These pages have not been implemented yet, so they do not link to any pages.

## Future Work
- Remove back button on play page for new users (see under Play Page in Page Breakdown for more details)
- Allow full customization for ReadyPlayerMe avatars (see under Login Page in Page Breakdown for more details)
- Create the other pages for the menu bar and link them
- Link the character profile page to the dashboard
- Make the leaderboard more robust - freeze the current player's row in the table and highlight it, only show the top few players and then the current player