import logo from './logo.svg';
import './App.css';
import { LogInControl } from './Login.js'
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  // Get the current board information from
  // the Flask server only once per page load
  useEffect(() => {
    socket.emit('getBoard', {});
    
    socket.on('getBoard', (data) => {
      console.log(data);
    });
  });
  
  return (
    <LogInControl/>
  );
}

export default App;
