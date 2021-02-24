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
user_count = 0

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
    print('User disconnected!')


@socketio.on('move')
def on_move(data):
    print(str(data))
    socketio.emit('move', data, broadcast=True, include_self=False)


@socketio.on('login')
def on_login(data):
    global logged_in_users
    global user_count
    user_count += 1
    user_info = {'user_id': user_count}
    # Get the count of players currently online
    num_players = len(logged_in_users)
    
    if num_players < 3:
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
    logged_in_users.append(user_info)
    
    print(logged_in_users)
   
   # Send the calculated user info privately to the recently logged in client
   # request.sid gets the id of the sender client, and sends the data back
   # to their 'room', which only the sender is apart of
    socketio.emit('login', user_info, room=request.sid)
    
socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)