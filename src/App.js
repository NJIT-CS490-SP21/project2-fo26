import logo from './logo.svg';
import './App.css';
import { LogInControl } from './Login.js';
import { Board } from './Board.js'
import { DisplayUsers } from './DisplayUsers.js';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([])
  const [isLoggedIn, setLoggedIn] = useState(false);
  // The changes made to the board before the user joined
  // After the client gets this info from the server, this state will be updated
  const [b4JoinedBoard, setBoard] = useState(['','','','','','','','','']);
  const [isXNext, setNext] = useState(true);
  const [winner, setWinner] = useState({});
  
  useEffect(() => {
    socket.on('getLoggedInUsers', (data) => {
      console.log(data['loggedInUsers']);
      setAllUsers(data['loggedInUsers']);
      // If a player left reset the winner object back to empty
      if (data['resetBoard']) {
        setWinner({});
      }
      // Ask for current board information from server on log in
      // Also let it know if the board should be reset due to a player logging out
      socket.emit('getBoard', {resetBoard: data['resetBoard']});
    });
  }, []);
  
  useEffect(() => {
    socket.on('getBoard', (data) => {
        console.log(data);
        setBoard(data['board']);
        setNext(data['isXNext']);
        if (data['resetGame'])
          setWinner({});
        // TODO: Socket emit 'checkRoles' to see if the user needs to change their role
    })
  }, [])
  
  useEffect(() => {
    socket.on('winner', (data) => {
        console.log(data);
        setWinner(data);
    })
  }, [])
  
  const restartGame = () => {
    if (!user['spectator']) {
      socket.emit('getBoard', {resetBoard: true, restartGame: true});
      //TODO CHECK FOR RESTART GAME ON GET BOARD TO HIDE RESTART GAME BTN
      // ALSO STOP SPECTATOR FROM RESTARTING GAME
      setWinner({});
    }
    else
      return null;
  }
  
  let gameScreen;
  
  if (!isLoggedIn) {
    gameScreen = (
      <LogInControl 
        user={user} setUser={setUser}
        isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn}
      />  
    )
  }
  else {
    gameScreen = (
      <div id="gameScreen">
        {Object.keys(winner).length != 0 ? 
          <div id="restartGame"><h1>PLAYER {winner['winner']} WON!</h1>
          <button onClick={restartGame}>Players click here to restart</button></div> : null}
        <DisplayUsers allUsers={allUsers}/>
        <LogInControl 
          user={user} setUser={setUser}
          isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn}
        />
        <Board user={user} 
          b4JoinedBoard={b4JoinedBoard} isXNext={isXNext}
        />
      </div>
    )
  }
  
  return gameScreen;
}

export default App;