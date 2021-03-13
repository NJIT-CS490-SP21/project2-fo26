'''
Flask backend server for a multiplayer Tic-Tac-Toe game.
'''
import os
from flask import Flask, send_from_directory, json, request
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

APP = Flask(__name__, static_folder='./build/static')

APP.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
DB = SQLAlchemy(APP)


class Player(DB.Model):
    '''
    Model of the Players Postgres table
    containing username and score attributes.
    '''
    id = DB.Column(DB.Integer, primary_key=True)
    username = DB.Column(DB.String(80), unique=True, nullable=False)
    score = DB.Column(DB.Integer, nullable=False)

    def __repr__(self):
        return '<Player %r>' % self.username

DB.create_all()

CORS_ = CORS(APP, resources={r"/*": {"origins": "*"}})

SOCKET_IO = SocketIO(APP,
                     cors_allowed_origins="*",
                     json=json,
                     manage_session=False)

LOGGED_IN_USERS = []


@APP.route('/', defaults={"filename": "index.html"})
@APP.route('/<path:filename>')
def index(filename):
    ''' Send the requested file
    to the user's browser '''
    return send_from_directory('./build', filename)


# When a client connects from this Socket connection, this function is run
@SOCKET_IO.on('connect')
def on_connect():
    ''' Print out a message when a user connects '''
    print('User connected!')


# When a client disconnects from this Socket connection, this function is run
@SOCKET_IO.on('disconnect')
def on_disconnect():
    ''' Remove the disconnected user from
    the logged in users list '''
    global LOGGED_IN_USERS
    # Remove the entry in logged_in_users
    # with the disconnected socket id
    new_logged_in_users = []
    for user in LOGGED_IN_USERS:
        if user['user_id'] != request.sid:
            new_logged_in_users.append(user)

    LOGGED_IN_USERS = new_logged_in_users

    print('User disconnected!')


@SOCKET_IO.on('move')
def on_move(data):
    ''' Emit a socketio message to all clients
    that a move has been made '''
    SOCKET_IO.emit('move', data, broadcast=True, include_self=False)


@SOCKET_IO.on('login')
def on_login(data):
    ''' Add a user to the logged in users list
    and send back their player status '''
    global LOGGED_IN_USERS

    # Get the count of players currently online
    num_players = len(LOGGED_IN_USERS)
    user_info = get_user_info(num_players)

    # Make the user's unique id their socket id
    user_info['user_id'] = request.sid
    user_info.update(data)
    LOGGED_IN_USERS.append(user_info)

    # Check if the username exists in the db
    exists = DB.session.query(
        Player.id).filter_by(username=data['username']).first()

    if not exists:
        # Create an entry in the db for the username
        player = Player(username=data['username'], score=100)
        DB.session.add(player)
        DB.session.commit()

    # Send the calculated user info privately to the recently logged in client
    # request.sid gets the id of the sender client, and sends the data back
    # to their 'room', which only the sender is apart of
    SOCKET_IO.emit('login', user_info, room=request.sid)


def get_user_info(num_players):
    ''' Retrieve the player information for the newly logged in user '''
    user_info = {}
    if num_players < 2:
        # Player is not a spectator and will be assigned a letter
        # depending on when they joined
        user_info['spectator'] = False

        if num_players == 0:
            user_info['player'] = 'X'
        else:
            user_info['player'] = 'O'
    else:
        user_info['spectator'] = True

    return user_info


@SOCKET_IO.on('logout')
def on_logout(data):
    ''' Remove a user from the
    logged in users list '''
    global LOGGED_IN_USERS
    # Delete the entry of the logged out user
    # according to their user id
    user_id = data['user_id']

    LOGGED_IN_USERS = remove_logged_out_user(LOGGED_IN_USERS, user_id)
    res = {'loggedInUsers': LOGGED_IN_USERS}

    # Broadcast an updated logged_in_users to all clients once
    # a player has logged out
    SOCKET_IO.emit('getLoggedInUsers', res, broadcast=True, include_self=False)

def remove_logged_out_user(logged_in_users, user_id):
    ''' Remove the logged out users from the list of active players '''
    new_logged_in_users = []
    for user in logged_in_users:
        if user['user_id'] != user_id:
            new_logged_in_users.append(user)

    return new_logged_in_users


@SOCKET_IO.on('getLoggedInUsers')
def on_get_users():
    ''' Return a socketio message containing
    a list of the logged in users '''
    global LOGGED_IN_USERS
    res = {'loggedInUsers': LOGGED_IN_USERS}

    SOCKET_IO.emit('getLoggedInUsers', res, broadcast=True, include_self=True)


@SOCKET_IO.on('winner')
def on_winner(data):
    ''' Update the players' score in the database
    and emit a socketio message to all clients
    with the game info '''
    global LOGGED_IN_USERS

    game_status = get_game_status(data, LOGGED_IN_USERS)

    if game_status['is_winner']:
        update_winner_score(game_status['winner'])
        update_loser_score(game_status['loser'])

    SOCKET_IO.emit('winner', data, broadcast=True, include_self=True)

def get_game_status(data, logged_in_users):
    ''' Helper function to retrieve the winner and losers'
    usernames if there wasn't a draw '''
    if data['status'] == 'win':
        if data['player'] == 'X':
            # Loser is O which is the second player in the users list
            winner = logged_in_users[0]['username']
            loser = logged_in_users[1]['username']
        else:
            winner = logged_in_users[1]['username']
            loser = logged_in_users[0]['username']

        return {'is_winner': True, 'winner': winner, 'loser': loser}
    return {'is_winner': False}


def update_winner_score(winner):
    ''' Helper function to increment the winner's score in db'''
    DB.session.query(Player).filter_by(username=winner).update(
        {Player.score: Player.score + 1})
    DB.session.commit()


def update_loser_score(loser):
    ''' Helper function to decrement the loser's score in db'''
    DB.session.query(Player).filter_by(username=loser).update(
        {Player.score: Player.score - 1})
    DB.session.commit()


@SOCKET_IO.on('resetGame')
def reset_game():
    ''' Emit a socketio message to all clients
    alerting them that the game should be reset '''
    SOCKET_IO.emit('resetGame', {}, broadcast=True, include_self=True)


@SOCKET_IO.on('getLeaders')
def get_leaders():
    ''' Emit a socketio message containig
    the list of logged in users '''
    res = {
        'allUsers':
        DB.session.query(Player.username,
                         Player.score).order_by(Player.score.desc()).all()
    }
    SOCKET_IO.emit('getLeaders', res, room=request.sid)


def order_by_score():
    ''' Helper function to query the database
    and return results ordered by score '''
    return DB.session.query(Player.username,
                            Player.score).order_by(Player.score.desc()).all()


@SOCKET_IO.on('getLeadersByName')
def get_leaders_by_name():
    ''' Emit a socketio message containig
    the list of logged in users sorted
    alphabetically by name'''
    res = {
        'allUsers':
        order_by_name()
    }
    SOCKET_IO.emit('getLeadersByName', res, room=request.sid)


def order_by_name():
    ''' Helper function to query the database
    and return results ordered by name '''
    return DB.session.query(Player.username,
                            Player.score).order_by(Player.username).all()


if __name__ == '__main__':
    SOCKET_IO.run(
        APP,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )
