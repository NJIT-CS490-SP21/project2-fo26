import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Leaderboard = ({ user, socket }) => {
  const [show, setShow] = useState(false);
  const [leaderboard, setLeaders] = useState([]);

  useEffect(() => {
    // Ask server for updated leaderboard once
    // a game ends
    socket.on('winner', () => {
      socket.emit('getLeaders');
    });
  }, []);

  useEffect(() => {
    socket.on('getLeaders', (data) => {
      console.log(data);
      setLeaders(data.allUsers);
    });
  }, []);

  useEffect(() => {
    socket.on('getLeadersByName', (data) => {
      setLeaders(data.allUsers);
    });
  }, []);

  const handleClick = () => {
    setShow((prevState) => !prevState);
    socket.emit('getLeaders');
  };

  const handleSortByName = () => {
    socket.emit('getLeadersByName');
  };

  const handleSortByScore = () => {
    socket.emit('getLeaders');
  };

  if (show) {
    return (
      <div id="leaderDiv">
        <button type="button" id="leaderboardBtn" onClick={handleClick}>
          Toggle Leaderboard
        </button>
        <div id="sortButtons">
          <br />
          <button type="button" onClick={handleSortByName}>Sort by Name</button>
          <br />
          <button type="button" onClick={handleSortByScore}>Sort by Score</button>
        </div>
        <table id="leaderboard">
          <thead>
            <tr>
              <td>Username</td>
              <td>Score</td>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player) => {
            // Check if the db entry's name attribute
            // is the user's username to make it look special
              if (player[0] === user.username) {
                return (
                  <tr id="specialRow">
                    {player.map((item) => (
                      <td>{item}</td>
                    ))}
                  </tr>
                );
              }
              return (
                <tr>
                  {player.map((item) => (
                    <td>{item}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <button type="button" id="leaderboardBtn" onClick={handleClick}>
        Toggle Leaderboard
      </button>
    </div>
  );
};

Leaderboard.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    spectator: PropTypes.bool.isRequired,
    player: PropTypes.string.isRequired,
  }).isRequired,
  socket: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default Leaderboard;
