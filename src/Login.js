import React from 'react';
import { Board } from './Board.js'
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io();
export const LogInControl = (props) => {
    const handleLogIn = (username) => {
        // Send the server the player's desired username,
        // and get the player's id, spectator status, and
        // possible assigned letter (X or O) back
        socket.emit('login', {'username': username});
        socket.on('login', (data) => {
            props.setLoggedIn(true);
            props.setUser(data);
            socket.emit('getLoggedInUsers')
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
            <h2>Logging in may take a few seconds...</h2>
        </div>
    );
}