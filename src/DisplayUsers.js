import React from 'react';
import PropTypes from 'prop-types';

const DisplayUsers = ({ allUsers }) => (
  <div id="displayUsers" data-testid="displayUsers">
    <h1>Players Online:</h1>
    {allUsers.map((user, index) => (
      <div key={index}>
        {user.spectator ? (
          <h2>
            Spectator:
            {user.username}
          </h2>
        ) : (
          <h2>
            Player
            {user.player}
            :
            {user.username}
          </h2>
        )}
      </div>
    ))}
  </div>
);

DisplayUsers.propTypes = {
  allUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DisplayUsers;
