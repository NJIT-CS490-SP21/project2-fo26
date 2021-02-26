import os
from flask import Flask, send_from_directory, json, session, request
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__, static_folder='./build/static')

cors = CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)

logged_in_users = []
# Keep a copy of the game board so that
# newly joined players will get the correct info
board = ['','','','','','','','','']
isXNext = True
active_rooms = []

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

# When a client connects from this Socket connection, this function is run
@socketio.on('connect')
def on_connect():
    print('User connected!')
    
# When a client disconnects from this Socket connection, this function is run
@socketio.on('disconnect')
def on_disconnect():
    global active_rooms
    global logged_in_users
    # Remove the disconnected client's socket id from
    # the list of active rooms aka socket ids
    res = {}
    disconnect_user = {}
    # Only execute if the user was logged in and had data sent
    # to the server
    if request.sid in active_rooms:
        # Find the disconnect user's data to
        # see if they were Player X or O
        for user in logged_in_users:
            if user['user_id'] == request.sid:
                disconnect_user = user
                
        new_rooms = []
        for room in active_rooms:
            if room != request.sid:
                new_rooms.append(room)
                
        # Remove the entry in logged_in_users
        # with the disconnected socket id
        new_logged_in_users = []
        for room in new_rooms:
            for user in logged_in_users:
                if user['user_id'] == room:
                    new_logged_in_users.append(user)
                    
        logged_in_users = new_logged_in_users
        active_rooms = new_rooms
        
        if 'player' in disconnect_user:
            res = {'loggedInUsers': logged_in_users, 'resetBoard': True}
        else:
            res = {'loggedInUsers': logged_in_users, 'resetBoard': False}
            
        socketio.emit('getLoggedInUsers', res, broadcast=True, include_self=False)
        
    print('User disconnected!')

@socketio.on('move')
def on_move(data):
    global isXNext
    # Update next turn information
    isXNext = not isXNext
    
    print(str(data))
    # Update the server's board info to include
    # the move just made
    board[data['index']] = data['player']
    socketio.emit('move', data, broadcast=True, include_self=False)


# Send the current board info to a newly logged in user
@socketio.on('getBoard')
def on_get_board(data):
    global board
    global isXNext
    
    if 'resetBoard' in data:
        if data['resetBoard']:
            # Reset turn and board information to initial states
            # if resetBoard is true
            board = ['','','','','','','','','']
            isXNext = True
        
    # Privately send the current board information to the user
    # that just joined on logins
    # On logouts, this information is treated as a broadcast to all
    # users
    boardObj = {'board': board, 'isXNext': isXNext}
        
    socketio.emit('getBoard', boardObj, room=request.sid)
    
    
@socketio.on('login')
def on_login(data):
    global logged_in_users
    global active_rooms
    
    # Make the user's unique id their socket id
    user_info = {'user_id': request.sid}
    # Get the count of players currently online
    num_players = len(logged_in_users)
    
    # Less than 2 because logged_in_users isn't updated
    # until after this if/else block, so its length is 1 behind
    if num_players < 2:
        # Player is not a spectator and will be assigned a letter
        # depending on when they joined
        user_info.update({'spectator': False})
        
        if num_players == 0:
            user_info.update({'player': 'X'})
        else:
            user_info.update({'player': 'O'})
            
    else:
        # Active player spots are taken
        user_info.update({'spectator': True})
        
    user_info.update(data)
    active_rooms.append(request.sid)
    logged_in_users.append(user_info)
   
   # Send the calculated user info privately to the recently logged in client
   # request.sid gets the id of the sender client, and sends the data back
   # to their 'room', which only the sender is apart of
    socketio.emit('login', user_info, room=request.sid)

@socketio.on('logout')
def on_logout(data):
    global logged_in_users
    global board
    # Delete the entry of the logged out user
    # according to their user id
    user_id = data['user_id']
    new_logged_in_users = []
    for user in logged_in_users:
        if user['user_id'] != user_id:
            new_logged_in_users.append(user)
    
    logged_in_users = new_logged_in_users
    res = {'loggedInUsers': logged_in_users, 'resetBoard': False}
    
    if 'player' in data:
        # A player logged out so the board must be reset
        res['resetBoard'] = True
        
    # Broadcast an updated logged_in_users to all clients once
    # a player has logged out
    socketio.emit('getLoggedInUsers', res, broadcast=True, include_self=False)

@socketio.on('getLoggedInUsers')
def on_get_users():
    global logged_in_users
    res = {'loggedInUsers': logged_in_users, 'resetBoard': False}
    
    socketio.emit('getLoggedInUsers', res, broadcast=True, include_self=True)

socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)
