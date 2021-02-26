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
# TODO: Keep state on server of whos turn it is
# Find a way to transmit board data to player once they login 
# and update their own board with that data
# maybe socket.emit('getboard'), socket.on('getboard') setBoard((prevBoard) => newBoard = prevBoard, map getboard data to update newBoard)
logged_in_users = []
user_count = 0
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
    if request.sid in active_rooms:
        new_rooms = []
        for room in active_rooms:
            if room != request.sid:
                new_rooms.append(room)
                
        # Remove the entry in logged_in_users
        # with the disconnected socket id
        new_logged_in_users = []
        for room in new_rooms:
            for user in logged_in_users:
                if user['room_id'] == room:
                    new_logged_in_users.append(user)
        
        logged_in_users = new_logged_in_users
        active_rooms = new_rooms
    
    print('User disconnected!')
    socketio.emit('getLoggedInUsers', logged_in_users, broadcast=True, include_self=False)

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
def on_get_board():
    # Privately send the current board information to the user
    # that just joined
    global board
    global isXNext
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
    
    print(logged_in_users)
   
   # Send the calculated user info privately to the recently logged in client
   # request.sid gets the id of the sender client, and sends the data back
   # to their 'room', which only the sender is apart of
    socketio.emit('login', user_info, room=request.sid)

@socketio.on('logout')
def on_logout(data):
    global logged_in_users
    # Delete the entry of the logged out user
    # according to their user id
    user_id = data['user_id']
    new_logged_in_users = []
    for user in logged_in_users:
        if user['user_id'] != user_id:
            new_logged_in_users.append(user)
    
    logged_in_users = new_logged_in_users
    
    #del logged_in_users[user_id]
    print('LOGGED IN USERS: ' + str(logged_in_users))
    # Broadcast an updated logged_in_users to all clients once
    # a player has logged out
    socketio.emit('getLoggedInUsers', logged_in_users, broadcast=True, include_self=True)

@socketio.on('getLoggedInUsers')
def on_get_users():
    global logged_in_users
    socketio.emit('getLoggedInUsers', logged_in_users, broadcast=True, include_self=True)

socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)