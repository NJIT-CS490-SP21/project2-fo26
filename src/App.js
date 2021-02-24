import logo from './logo.svg';
import './App.css';
import { LogInControl } from './Login.js'
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
    
  return (
    <LogInControl/>
  );
}

export default App;
