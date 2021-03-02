import React from 'react';
import { useState, useEffect } from 'react';

export const Leaderboard = () => {
    const [showBoard, setStatus] = useState(false)
    
    if (showBoard) {
        return (
            <div>
                <button onClick={() => setStatus((prevState) => !prevState)}>
                    Toggle Leaderboard</button>
                SHOW BOARD
            </div>
        );
    }
    else {
        return (
            <div>
                <button onClick={() => setStatus((prevState) => !prevState)}>
                    Toggle Leaderboard</button>
                DON'T SHOW
            </div>
        );
    }
}