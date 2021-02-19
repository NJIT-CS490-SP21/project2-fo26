import logo from './logo.svg';
import './App.css';
import { Board, Square } from './Board.js';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
    
  return (
    <div>
      <div className="board">
            <Board />
        </div>
    </div>
  );
}

export default App;
