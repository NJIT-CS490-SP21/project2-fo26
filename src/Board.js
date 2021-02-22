import React from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection

export const Square = (props) => {
    const onClickBox = () => {
        let newBoard = [...props.Board]
        
        if (newBoard[props.index] == 'X')
            newBoard[props.index] = 'O'
        else
            newBoard[props.index] = 'X'
            
        props.setBoard(newBoard)
        
        socket.emit('move', {
            index: props.index,
            player: newBoard[props.index]
        });
    }
    
    return (
        <div className="box" onClick={onClickBox}>
            {props.value}
        </div>
    )
}


export const Board = () => {
    const [Board, setBoard] = useState(['','','','','','','','','']);
    useEffect(() => {
        socket.on('move', (data) => {
          console.log(data);
          setBoard((prevBoard) => {
            let newBoard = [...prevBoard]
            newBoard[data.index] = data.player
            return newBoard
          });
        })
    }, ['','','','','','','','','']);
    
    return (
        <div className="board">
            {Board.map((squareVal, index) => 
                <Square 
                    Board={Board} setBoard={setBoard} 
                    value={squareVal} index={index} 
                />
            )}
        </div>
    )
}