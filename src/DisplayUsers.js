import React from 'react';

export const DisplayUsers = (props) => {
    return (
        <div id="displayUsers">
        <h1>Players Online:</h1>
        {
            props.allUsers.map((user) => 
                <div>
                    {user.spectator ? <h2>Spectator: {user.username}</h2> : <h2>Player {user.player}: {user.username}</h2>}
                </div>
            )
        }
        </div>
    )
}