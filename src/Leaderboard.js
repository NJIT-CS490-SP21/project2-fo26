import React from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const Leaderboard = (props) => {
    const [show, setShow] = useState(false);
    const [leaderboard, setLeaders] = useState([]);
    
    useEffect(() => {
        // Ask server for updated leaderboard once
        // a game ends
        props.socket.on('winner', () => {
            props.socket.emit('getLeaders')
        });
    }, []);
    
    useEffect(() => {
        props.socket.on('getLeaders', (data) => {
            setLeaders(data['allUsers']);
        });
    }, []);
    
    useEffect(() => {
        props.socket.on('getLeadersByName', (data) => {
            setLeaders(data['allUsers']);
        });
    }, []);
    
    const handleClick = () => {
        setShow((prevState) => !prevState)
        props.socket.emit('getLeaders');
    }
    
    const handleSortByName = () => {
        props.socket.emit('getLeadersByName');
    }
    
    const handleSortByScore = () => {
        props.socket.emit('getLeaders');
    }
    
    if (show) {
        return (
            <div id="leaderDiv">
                <button id="leaderboardBtn" onClick={handleClick}>
                    Toggle Leaderboard</button>
                <div id="sortButtons">
                    <br/><button onClick={handleSortByName}>Sort by Name</button>
                    <br/><button onClick={handleSortByScore}>Sort by Score</button>
                </div>
                <table id="leaderboard">
                    <thead><tr><td>Username</td><td>Score</td></tr></thead>
                    <tbody>
                    {leaderboard.map((player) =>
                        // Check if the db entry's name attribute
                        // is the user's username to make it look special
                        player[0] == props.user.username ?
                            <tr id="specialRow">{player.map((item) => <td>{item}</td>)}</tr>
                            : <tr>{player.map((item) => <td>{item}</td>)}</tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    }
    else {
        return (
            <div>
                <button id="leaderboardBtn" onClick={handleClick}>
                    Toggle Leaderboard</button>
            </div>
        );
    }
}