import React from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection

export const Square = (props) => {
    const onClickBox = () => {
        props.handleBoardChange(props.index)
    }
    
    return (
        <div className="box" onClick={onClickBox}>
            {props.value}
        </div>
    );
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
        });
    }, []);
    
    const handleBoardChange = (index) => {
        let newBoard = [...Board];
        
        if (newBoard[index] == 'X')
            newBoard[index] = 'O';
        else
            newBoard[index] = 'X';
            
        setBoard(newBoard);
        
        socket.emit('move', {
            index: index,
            player: newBoard[index]
        });
    }
    
    return (
        <div className="board">
            {Board.map((value, index) => 
                <Square 
                    handleBoardChange={handleBoardChange}
                    value={value} index={index} 
                />
            )}
        </div>
    )
}