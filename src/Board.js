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
    const [Board, setBoard] = useState(['','','','','','','','','']);
    const [isXTurn, setXTurn] = useState(true);
  
    useEffect(() => {
        socket.on('move', (data) => {
            console.log('MOVE');
            console.log(data);
          
            //Update the board with the opponent's move
            setBoard((prevBoard) => {
                let newBoard = [...prevBoard]
                newBoard[data.index] = data.player
                return newBoard
            });
          
            //Swap turns once the opponent has moved
            setXTurn((prevState) => !prevState);
        });
    }, []);
    
    useEffect(() => {
        socket.on('winner', (data) => {
          console.log('WINNER')
          console.log(data);
          
          //Update the board with the opponent's last move
          setBoard((prevBoard) => {
            let newBoard = [...prevBoard]
            newBoard[data.index] = data.player
            return newBoard
          });
        });
    }, []);
    
    useEffect(() => {
        socket.on('resetGame', (data) => {
            console.log('RESET GAME');
            // Set X turn to true
            setXTurn((prevState) => {
                if (prevState)
                    return prevState
                else
                    return !prevState
            });
            setBoard(['','','','','','','','','']);
        });
    }, [])
    
    const handleBoardChange = (index) => {
        let newBoard = [...Board];
        // Get the letter of the player trying to make a move
        const playerLetter = props.user['player']
        
        // Check if player tried to make a valid move
        // Also check if the spot they clicked on is empty
        if (playerLetter === 'X' && isXTurn && newBoard[index] == '') {
            // The move is valid
            newBoard[index] = 'X';
            setXTurn((prevState) => !prevState);
        }
        else if (playerLetter === 'O' && !isXTurn && newBoard[index] == '') {
            newBoard[index] = 'O';
            setXTurn((prevState) => !prevState);
        }
        
        else {
            // Not a valid move, stop at this point
            return null;
        }
        
        setBoard(newBoard);
        
        // There is a draw as the board is full but no winner
        if (!newBoard.includes('')) {
            socket.emit('winner', {
                    winner: 'It\'s a Draw!',
                    status: 'draw',
                    index: index,
                    player: newBoard[index]
                });
        }
        else {
            // Check if there is a winner with the current board
            const winner = calculateWinner(newBoard);
            if (winner) {
                // Send the last move and winner information thus ending the game
                socket.emit('winner', {
                    winMsg: 'Player ' + winner + ' (' + props.user['username'] + ') won!',
                    status: 'win',
                    username: props.user['username'],
                    index: index,
                    player: newBoard[index]
                });
            }
            else {
                // Send back the move that was just made's information
                socket.emit('move', {
                    index: index,
                    player: newBoard[index]
                });
            }
        }
    }
    
    function calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
              return squares[a];
            }
        }
      return null;
    }

    // Make board unclickable if the player is a spectator, only 1 user is online, the game ends and isn't restarted
    if (props.user['spectator'] || props.allUsers.length === 1 || Object.keys(props.winner).length !== 0) {
        // Return a non-clickable board
        // that still updates based on the players' moves
        return (
            <div>
            <div className="board">
            {Board.map((value, index) => 
                 <div className="box">
                    {value}
                </div>
            )}
            </div>   
            <h2>Moves may take a few seconds to load...</h2>
            </div>
        )
    }
    else {
        return (
            <div>
                <div className="board">
                    {Board.map((value, index) => 
                        <PlayerSquare 
                            handleBoardChange={handleBoardChange}
                            value={value} index={index} 
                        />
                    )}
                </div>
                <h1>X Goes First</h1>
                <h2>Moves may take a few seconds to load...</h2>
            </div>
        )
    }
}