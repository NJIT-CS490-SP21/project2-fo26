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
  
  useEffect(() => {
    socket.on('getLoggedInUsers', (data) => {
      console.log(data);
      setAllUsers(data);
      // Ask for current board information from server on log in
      socket.emit('getBoard');
    });
  }, []);
  
  useEffect(() => {
    socket.on('getBoard', (data) => {
        console.log(data);
        setBoard(data['board']);
        setNext(data['isXNext'])
    })
  }, [])
  
  
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
      <div>
      <DisplayUsers allUsers={allUsers}/>
      <LogInControl 
        user={user} setUser={setUser}
        isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn}
      />
      <Board user={user} b4JoinedBoard={b4JoinedBoard} isXNext={isXNext}/>
      </div>
    )
  }
  
  return gameScreen;
}

export default App;