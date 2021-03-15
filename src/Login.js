import React, { useRef } from 'react';
import PropTypes from 'prop-types';

const LogInControl = (props) => {
  const handleLogIn = (usernameIn) => {
    // Send the server the player's desired username,
    // and get the player's id, spectator status, and
    // possible assigned letter (X or O) back
    props.socket.emit('login', { username: usernameIn });
    props.socket.on('login', (data) => {
      props.setLoggedIn(true);
      props.setUser(data);
      props.socket.emit('getLoggedInUsers');
    });
  };

  const handleLogOut = () => {
    props.setLoggedIn(false);
    // Notify the server that this
    // user is logging out so their
    // entry can be deleted from the online players
    // list
    props.socket.emit('logout', props.user);
  };

  let Greeting;

  if (props.isLoggedIn) {
    Greeting = (
      <div id="logout">
        <h1>
          Username:
          {props.user.username}
        </h1>
        <button type="button" onClick={handleLogOut}>Log out</button>
      </div>
    );
  } else {
    Greeting = <NotLoggedIn handleLogIn={handleLogIn} />;
  }

  // Have a seperate greeting for logged in/out users,
  // but use the same board otherwise there will be issues in
  // syncing the board once a logged out users signs in
  return Greeting;
};

const NotLoggedIn = ({ handleLogIn }) => {
  const inputRef = useRef();

  const onLogInClick = () => {
    if (inputRef.current.value !== '') {
      const username = inputRef.current.value;
      handleLogIn(username);
    }
  };

  return (
    <div id="login">
      <h1>Enter your username: </h1>
      <input placeholder="Enter your username" ref={inputRef} type="text" />
      <button type="button" onClick={onLogInClick}>Log in</button>
      <h2>Logging in may take a few seconds...</h2>
    </div>
  );
};

NotLoggedIn.propTypes = {
  handleLogIn: PropTypes.func.isRequired,
};

export default LogInControl;
