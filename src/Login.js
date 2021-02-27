import React from 'react';
import { Board } from './Board.js'
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io();
export const LogInControl = (props) => {
    
    useEffect(() => {
        socket.on('login', (data) => {
            // Show the user the board once
            // the server sends back their user data
            props.setLoggedIn(true);
            props.setUser(data);
            //console.log(data);
            // Get a list of all currently logged in users
            // from the server after this client has successfully
            // logged in. Also, if the logged in player is going
            // to be O or X, reset the board
            if ('player' in data)
                socket.emit('getLoggedInUsers', {'resetBoard': true});
            else
                socket.emit('getLoggedInUsers', {})
        });
    }, []);
    
    const handleLogIn = (username) => {
        // Send the server the player's desired username,
        // and get the player's id, spectator status, and
        // possible assigned letter (X or O) back
        socket.emit('login', {
            username: username
        });
    }
    
    const handleLogOut = () => {
        props.setLoggedIn(false);
        // Notify the server that this
        // user is logging out so their
        // entry can be deleted from the online players
        // list
        socket.emit('logout', props.user);
    }
    
    let Greeting;
    
    if (props.isLoggedIn) {
        Greeting = (
            <div id="logout">
                <h1>Username: {props.user['username']}</h1>
                <button onClick={handleLogOut}>Log out</button>
            </div>
        );
    }
    else {
        Greeting = <NotLoggedIn handleLogIn={handleLogIn}/>;
    }
    
    // Have a seperate greeting for logged in/out users,
    // but use the same board otherwise there will be issues in
    // syncing the board once a logged out users signs in
    return Greeting;
}

const NotLoggedIn = (props) => {
    const inputRef = useRef();
    
    const onLogInClick = () => {
        if (inputRef.current.value !== '') {
            const username = inputRef.current.value;
            props.handleLogIn(username);
        }
    }
    
    return (
        <div id="login">
            <h1>Enter your username: </h1>
            <input ref={inputRef} type="text"/>
            <button onClick={onLogInClick}>Log in</button>
        </div>
    );
}