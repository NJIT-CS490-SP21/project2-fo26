import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const PlayerSquare = ({ handleBoardChange, value, index }) => {
  const onClickBox = () => {
    handleBoardChange(index);
  };

  const handleKeyPress = (e) => {
    console.log(e.key);
  };

  return (
    <div className="box" role="menuitem" tabIndex={0} onClick={onClickBox} onKeyPress={handleKeyPress}>
      {value}
    </div>
  );
};

export const GameBoard = ({
  user, allUsers, winner, socket,
}) => {
  const [Board, setBoard] = useState(['', '', '', '', '', '', '', '', '']);
  const [isXTurn, setXTurn] = useState(true);

  useEffect(() => {
    socket.on('move', (data) => {
      // Update the board with the opponent's move
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[data.index] = data.player;
        return newBoard;
      });

      // Swap turns once the opponent has moved
      setXTurn((prevState) => !prevState);
    });
  }, []);

  useEffect(() => {
    socket.on('winner', (data) => {
      // Update the board with the opponent's last move
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[data.index] = data.player;
        return newBoard;
      });
    });
  }, []);

  useEffect(() => {
    socket.on('resetGame', () => {
      // Set X turn to true
      setXTurn((prevState) => {
        if (prevState) return prevState;
        return !prevState;
      });
      setBoard(['', '', '', '', '', '', '', '', '']);
    });
  }, []);

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
    for (let i = 0; i < lines.length; i += 1) {
      const [a, b, c] = lines[i];
      if (
        squares[a]
        && squares[a] === squares[b]
        && squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }

  const handleBoardChange = (index) => {
    const newBoard = [...Board];
    // Get the letter of the player trying to make a move
    const playerLetter = user.player;

    // Check if player tried to make a valid move
    // Also check if the spot they clicked on is empty
    if (playerLetter === 'X' && isXTurn && newBoard[index] === '') {
      // The move is valid
      newBoard[index] = 'X';
      setXTurn((prevState) => !prevState);
    } else if (playerLetter === 'O' && !isXTurn && newBoard[index] === '') {
      newBoard[index] = 'O';
      setXTurn((prevState) => !prevState);
    } else {
      // Not a valid move, stop at this point
      return null;
    }
    setBoard(newBoard);

    // There is a draw as the board is full but no winner
    if (!newBoard.includes('')) {
      socket.emit('winner', {
        winMsg: 'It\'s a Draw!',
        status: 'draw',
        index,
        player: newBoard[index],
      });
    } else {
      // Check if there is a winner with the current board
      const isWinner = calculateWinner(newBoard);
      if (isWinner) {
        // Send the last move and winner information thus ending the game
        socket.emit('winner', {
          winMsg: `Player ${isWinner} (${user.username}) won!`,
          status: 'win',
          username: user.username,
          index,
          player: newBoard[index],
        });
      } else {
        // Send back the move that was just made's information
        socket.emit('move', {
          index,
          player: newBoard[index],
        });
      }
    }
    return null;
  };

  // Make board unclickable if the player is a spectator,
  // only 1 user is online, the game ends and isn't restarted
  if (
    user.spectator
    || allUsers.length === 1
    || Object.keys(winner).length !== 0
  ) {
    // Return a non-clickable board
    // that still updates based on the players' moves
    return (
      <div>
        <div className="board">
          {Board.map((value) => (
            <div className="box">{value}</div>
          ))}
        </div>
        <h2>Moves may take a few seconds to load...</h2>
      </div>
    );
  }
  return (
    <div>
      <div className="board">
        {Board.map((value, index) => (
          <PlayerSquare
            handleBoardChange={handleBoardChange}
            value={value}
            index={index}
          />
        ))}
      </div>
      <h1>X Goes First</h1>
      <h2>Moves may take a few seconds to load...</h2>
    </div>
  );
};

PlayerSquare.propTypes = {
  handleBoardChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

GameBoard.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    spectator: PropTypes.bool.isRequired,
    player: PropTypes.string.isRequired,
  }).isRequired,
  allUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  winner: PropTypes.objectOf(PropTypes.object).isRequired,
  socket: PropTypes.objectOf(PropTypes.object).isRequired,
};
