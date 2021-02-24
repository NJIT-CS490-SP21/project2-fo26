import React from 'react';
import { Board } from './Board.js'
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io();
export const LogInControl = () => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    
    useEffect(() => {
        socket.on('login', (data) => {
            // Show the user the board once
            // the server sends back their user data
            setLoggedIn(true);
            setUser(data);
            console.log(data);
        });
    }, []);
    
    const handleLogIn = (username) => {
        // Send the server the player's desired username,
        // and get the player's id, spectator status, and
        // possible assigned letter (X or O) back
        socket.emit('login', {
            username: username
        });
        
        // TODO: FIX THIS
        socket.emit('getBoard', {})
    }
    
    const handleLogOut = () => {
        setLoggedIn(false);
        // Notify the server that this
        // user is logging out so their
        // entry can be deleted from the online players
        // list
        socket.emit('logout', user);
    }
    
    if (isLoggedIn) {
        return (
            <div>
                <h1>Hi {user['username']}</h1>
                {user['spectator'] ? <h1>You're spectating</h1> : <h1>You're player {user['player']}</h1>}
                <Board user={user}/>
                <button onClick={handleLogOut}>Log out</button>
            </div>
        );
    }
    else {
        return (
            <NotLoggedIn handleLogIn={handleLogIn}/>
        );
    }
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
        <div>
            <h1>Enter your username: </h1>
            <input ref={inputRef} type="text"/>
            <button onClick={onLogInClick}>Log in</button>
        </div>
    );
}