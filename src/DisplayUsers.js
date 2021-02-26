import React from 'react';

export const DisplayUsers = (props) => {
    return (
        <div>
        {
            props.allUsers.map((user) => 
                <div>
                    {user.spectator ? <h1>Spectator: {user.username}</h1> : <h1>Player {user.player}: {user.username}</h1>}
                </div>
            )
        }
        </div>
    )
}