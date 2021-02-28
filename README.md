# Milestone 1
## Accessing via Heroku ##
This app is hosted on Heroku and can be accessed at https://aqueous-fjord-51437.herokuapp.com/
## Deploying This App Locally
### Requirements ###
Before deploying this app locally, the following Python packages must be installed:
  * Flask
  * flask-socketio
  * flask_cors

These packages can be individually installed within a command line interface by using the command `pip install PACKAGE_NAME_HERE`.
Node.js and NPM are also required, which can be downloaded [here](https://nodejs.org/en/)
### Local Deployment Steps ###
The following steps should be carried out within a Linux terminal.
1. Clone this repository by entering the command `git clone https://github.com/NJIT-CS490-SP21/project2-fo26.git`
2. Navigate to the project folder by using the command `cd project2-fo26`
3. Execute the command `npm install` in the project folder.
4. Next, execute the command `python app.py` to start the Flask server.
5. Open a new terminal window and in it run the command `cd project2-fo26`
6. Still in the new terminal window, now run the command `npm run start`
7. Preview the webpage by clicking on one of the links provided by the previous command.
## Additional Features / Current Technical Issues ##
### Feature: Resetting roles based on if an active player leaves ###
Currently, if an active player leaves, the roles will not be reassigned. I am planning on implementing this by updating the `app.py` file, which is the Flask server file. In this file, I plan to add a check in the `disconnect()` function. This will get the username of the player who disconnected from the `logged_in_users` list. With this information, I could check if the player was a 'X' or 'O' player. If they were an 'X' player, I would reset the 2nd user in the list to be player 'X', and any possible 3rd user to be player 'O'. If player 'O' disconnected, I would make the possible 3rd player in the list become 'O' instead. After this assignment, I could simply create a new list called `new_logged_in_users` that contains all users except those who match the logged out user's username.
### Current Issue: Heroku connection issues on privately sending data with Socket IO ###
Currently, the best solution I have thought of to get a user's data such as their player status, is to ask the server to calculate this information. After doing this, in the `login()` function in `app.py`, it privately sends data to the requesting clients socket id. While this works locally, it has proven in occasionally be an issue while using the app on Heroku. To fix this I am planning on not using private data sending on socket io. Instead, I plan to only request the `logged_in_users` list via a socket `emit` call in `App.js`. With this, I plan to use the length of the `logged_in_users` list to determine what the player's status is. If the length is below 2, I know the logged in user is player 'X' or 'O', and otherwise they are a spectator. I could accomplish this via a `useEffect()` function in `App.js` with a `socket.on` function instead of it waiting for a `getLoggedInUsers` call. On this call, I could carry out the aforementioned logic to correctly set the `user` state.
## Technical Issues ##
### Implementing the turn taking system ###
One issue I had was implementing turn taking. In this issue, sometimes a player could make two moves before the other player could respond. My process in solving this was to first identify which components of my project were responsible for updating this information. At this point, I am only tracking turn information with a state variable called`isXTurn` in the `Board.js` file. I borrowed this idea from the React tic-tac-toe tutorial at https://reactjs.org/tutorial/tutorial.html. After checking if a player's move was valid, I negate `isXTurn`. However, I came to the conclusion that the reason why this didn't always work was because the `Board` component didn't re-render yet, so `isXTurn` was still stuck on the previous value, letting the same player go multiple times. After Google searching something along the lines of "react correctly setting states", I found documentation such as this: https://reactjs.org/docs/state-and-lifecycle.html. This documentation suggests that passing functions to a setState is better, as ensures that the intended value is returned when you access it. I applied this by passing in a function that created a `newBoard` inside the `setBoard()` function, instead of directly passing it in as a parameter. This seemed to have fixed the issue.
### Resetting the game board on a new game ###
Another issue I had was implementing resetting the game board and showing a winner. My thought process was to think of when I wanted this to happen and how to get this information to all clients. After this thought, I knew that I needed to make some use of socket io events. After reading documentation such as https://socket.io/docs/v3/emitting-events/ and https://socket.io/docs/v3/listening-to-events/, I felt like I had an idea of how to accomplish this. I decided to emit an event called `winner` to the server. Upon receiving this, the server simply emits back`winner` to all clients. With a `useEffect()` function in `App.py`, there is a `socket.on()` function that waits for this event. Upon receiving the event, I populate a `winner` state with the data initially sent in the `Board.js` file containing the letter and username of who won. After this, I use conditional rendering per the documentation provided to generate my win message. If the user is a non-active player, they will simply see the information of who won. Otherwise, the players additionally see a button to reset the game. Again, I make use a socket event called `resetGame` that prompts the sever to emit `resetGame` to all clients. This prompts the `Board.js` file to reset the `Board` and `isXTurn` states back to their initial states.
