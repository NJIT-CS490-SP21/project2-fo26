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
  const [allUsers, setAllUsers] = useState([]);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [winner, setWinner] = useState({});
  
  useEffect(() => {
    socket.on('getLoggedInUsers', (data) => {
      console.log('GET LOGGED IN USERS');
      console.log(data);
      setAllUsers(data['loggedInUsers']);
    });
  }, []);
  
  useEffect(() => {
    socket.on('resetGame', (data) => {
      setWinner({});  
    });
  }, []);
  
  useEffect(() => {
    socket.on('winner', (data) => {
        setWinner(data);
    });
  }, []);
  
  const restartGame = () => {
    if (!user['spectator']) {
      socket.emit('resetGame');
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
    );
  }
  else {
    if (user['spectator']) {
      gameScreen = (
        <div id="gameScreen">
          {(Object.keys(winner).length !== 0) ? <h1>{winner['winner']}</h1> : null}
          <DisplayUsers allUsers={allUsers}/>
          <LogInControl 
            user={user} setUser={setUser}
            isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn}
          />
          <Board user={user} 
            allUsers={allUsers}
            winner={winner}
          />
        </div>
      );
    }
    
    else {
      gameScreen = (
        <div id="gameScreen">
        {(Object.keys(winner).length !== 0) ? 
          <div><h1>{winner['winner']}</h1>
          <button onClick={restartGame}>Players click here to restart</button></div> : null}
        <DisplayUsers allUsers={allUsers}/>
        <LogInControl 
          user={user} setUser={setUser}
          isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn}
        />
        <Board user={user}
            allUsers={allUsers}
            winner={winner}
          />
        </div>  
      );
    }
  }
  
  return gameScreen;
}

export default App;