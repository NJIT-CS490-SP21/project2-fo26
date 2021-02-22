import logo from './logo.svg';
import './App.css';
import { LogInControl } from './Login.js'
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  
  return (
    <LoginControl isLoggedIn={isLoggedIn} setLoggedin={setLoggedIn}/>
  );
}

export default App;
