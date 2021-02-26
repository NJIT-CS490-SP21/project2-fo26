import React from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection

export const PlayerSquare = (props) => {
    const onClickBox = () => {
        props.handleBoardChange(props.index)
    }
    
    return (
        <div className="box" onClick={onClickBox}>
            {props.value}
        </div>
    );
}


export const Board = (props) => {
    const [Board, setBoard] = useState(props.b4JoinedBoard);
    const [isXTurn, setXTurn] = useState(true);
  
    useEffect(() => {
        socket.on('move', (data) => {
          console.log(data);
          
          //Update the board with the opponent's move
          setBoard((prevBoard) => {
            let newBoard = [...prevBoard]
            newBoard[data.index] = data.player
            return newBoard
          });
          
          //Swap turns once the opponent has moved
          setXTurn((prevTurn) => !prevTurn);
        });
    }, []);
    
    // Set the board to include moves made before
    // the user joined
    useEffect(() => {
         setBoard(props.b4JoinedBoard);
    }, [props.b4JoinedBoard]);
    
    // Get the value of who should go next,
    // based on moves before the user joined
    useEffect(() => {
         setXTurn(props.isXNext);
    }, [props.isXNext]);
    
    const handleBoardChange = (index) => {
        let newBoard = [...Board];
        // Get the letter of the player trying to make a move
        const playerLetter = props.user['player']
        const isXTurnCopy = isXTurn;
        
        // Check if player tried to make a valid move
        // Also check if the spot they clicked on is empty
        if (playerLetter === 'X' && isXTurnCopy && newBoard[index] == '') {
            // The move is valid
            newBoard[index] = 'X';
            setXTurn(false);
        }
        else if (playerLetter === 'O' && !isXTurnCopy && newBoard[index] == '') {
            newBoard[index] = 'O';
            setXTurn(true);
        }
        
        else {
            // Not a valid move, stop at this point
            return null;
        }
        
        setBoard(newBoard);
        
        // Check if there are no empty spaces to calculate winner
        if (!newBoard.includes('')) {
            console.log('Placeholder');
        }
        
        //Send back the move that was just made's information
        socket.emit('move', {
            index: index,
            player: newBoard[index]
        });
    }
    
    if (props.user['spectator']) {
        // Return a non-clickable board
        // that still updates based on the players' moves
        return (
            <div className="board">
            {Board.map((value, index) => 
                 <div className="box">
                    {value}
                </div>
            )}
            </div>   
        )
    }
    else {
        return (
            <div className="board">
                {Board.map((value, index) => 
                    <PlayerSquare 
                        handleBoardChange={handleBoardChange}
                        value={value} index={index} 
                    />
                )}
            </div>
        )
    }
}