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
          //console.log(data);
          
          //Update the board with the opponent's move
          setBoard((prevBoard) => {
            let newBoard = [...prevBoard]
            newBoard[data.index] = data.player
            return newBoard
          });
          
          //setBoard(data['newBoard'])
          //Swap turns once the opponent has moved
          setXTurn(data['isXNext']);
        });
    }, []);
    
    
    // Set the board to include moves made before
    // the user joined
    useEffect(() => {
         setBoard(props.b4JoinedBoard);
         setXTurn(props.isXNext);
    }, [props.b4JoinedBoard]);
    
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
        
        // There is a draw as the board is full but no winner
        if (!newBoard.includes('')) {
            socket.emit('winner', {
                    winner: 'It\'s a Draw!',
                    index: index,
                    player: newBoard[index]
                });
        }
        else {
            // Check if there is a winner with the current board
            const winner = calculateWinner(newBoard);
            if (winner) {
                // End the game
                socket.emit('winner', {
                    winner: 'Player ' + winner + ' (' + props.user['username'] + ') won!',
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
        if (props.allUsers.length === 1) {
            return (
                <div>
                <h1>Waiting for another player...</h1>
                </div>   
            )
        }
        else {
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
            </div>
        )
    }
}