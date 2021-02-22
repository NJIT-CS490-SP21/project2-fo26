import React from 'react';
import { Board } from './Board.js'

export const LogInControl = (props) => {
    const ToggleLogIn = () => {
        props.setLoggedIn((prevState) => !prevState);
    }
    
    if (props.isLoggedIn) {
        return (
            <div>
                <Board/>
                <button onClick={ToggleLogIn}>Logout</button>
            </div>
        );
    }
    else {
        return (
            <div>
                <input placeholder="Enter your username"/>
                <button onClick={ToggleLogIn}>Submit</button>
            </div>
        );
    }
}