import React from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();
export const Leaderboard = (props) => {
    const [show, setShow] = useState(false)
    const [leaderboard, setLeaders] = useState([])
    
    const handleClick = () => {
        setShow((prevState) => !prevState)
        if (show) {
            socket.emit('getLeaders');
            socket.on('getLeaders', (data) => {
                setLeaders(data['allUsers'])
            })
        }
    }
    
    if (show) {
        return (
            <div id="leaderDiv">
                <button onClick={handleClick}>
                    Toggle Leaderboard</button>
                <table id="leaderboard">
                <thead><tr><td>Username</td><td>Score</td></tr></thead>
                    {leaderboard.map((player) =>
                        // Check if the db entry's name attribute
                        // is the user's username to make it look special
                        player[0] == props.user.username ?
                            <tr id="specialRow">{player.map((item) => <td>{item}</td>)}</tr>
                            : <tr>{player.map((item) => <td>{item}</td>)}</tr>
                    )}
                    </table>
            </div>
        );
    }
    else {
        return (
            <div>
                <button onClick={handleClick}>
                    Toggle Leaderboard</button>
            </div>
        );
    }
}