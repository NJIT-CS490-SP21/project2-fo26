import './App.css';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LogInControl from './Login';
import { GameBoard } from './GameBoard';
import DisplayUsers from './DisplayUsers';
import Leaderboard from './Leaderboard';

const socket = io();

function App() {
  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [winner, setWinner] = useState({});

  useEffect(() => {
    socket.on('getLoggedInUsers', (data) => {
      setAllUsers(data.loggedInUsers);
    });
  }, []);

  useEffect(() => {
    socket.on('resetGame', () => {
      setWinner({});
    });
  }, []);

  useEffect(() => {
    socket.on('winner', (data) => {
      setWinner(data);
    });
  }, []);

  const restartGame = () => {
    if (!user.spectator) {
      socket.emit('resetGame');
    }
    return null;
  };

  let gameScreen;

  if (!isLoggedIn) {
    gameScreen = (
      <LogInControl
        user={user}
        setUser={setUser}
        isLoggedIn={isLoggedIn}
        setLoggedIn={setLoggedIn}
        socket={socket}
      />
    );
  } else if (user.spectator) {
    gameScreen = (
      <div>
        <Leaderboard user={user} socket={socket} />
        <div id="gameScreen">
          {Object.keys(winner).length !== 0 ? (
            <h1>{winner.winMsg}</h1>
          ) : null}
          <DisplayUsers allUsers={allUsers} />
          <LogInControl
            user={user}
            setUser={setUser}
            isLoggedIn={isLoggedIn}
            setLoggedIn={setLoggedIn}
            socket={socket}
          />
          <GameBoard
            user={user}
            allUsers={allUsers}
            winner={winner}
            socket={socket}
          />
        </div>
      </div>
    );
  } else {
    gameScreen = (
      <div>
        <Leaderboard user={user} socket={socket} />
        <div id="gameScreen">
          {Object.keys(winner).length !== 0 ? (
            <div>
              <h1>{winner.winMsg}</h1>
              <button type="button" onClick={restartGame}>
                Players click here to restart
              </button>
            </div>
          ) : null}
          <DisplayUsers allUsers={allUsers} />
          <LogInControl
            user={user}
            setUser={setUser}
            isLoggedIn={isLoggedIn}
            setLoggedIn={setLoggedIn}
            socket={socket}
          />
          <GameBoard
            user={user}
            allUsers={allUsers}
            winner={winner}
            socket={socket}
          />
        </div>
      </div>
    );
  }

  return gameScreen;
}

export default App;
