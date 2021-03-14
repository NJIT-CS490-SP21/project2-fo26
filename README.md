Milestone 1 Readme is [here](https://github.com/NJIT-CS490-SP21/project2-fo26/commit/88ba2fee7bd5b4e29b89eaf994876997fafe423c?short_path=b335630#diff-b335630551682c19a781afebcf4d07bf978fb1f8ac04c6bf87428ed5106870f5).

# MILESTONE 3 HEROKU LINK: https://rocky-waters-81320.herokuapp.com/

## Accessing via Heroku

This app is hosted on Heroku and can be accessed at https://dry-beyond-98222.herokuapp.com/

## Deploying This App Locally

### Requirements

Before deploying this app locally, the following Python packages must be installed:

- Flask
- flask-socketio
- flask_cors
- flask_sqlalchemy
- psycopg2

These packages can be individually installed within a command line interface by using the command `pip install PACKAGE_NAME_HERE`.
Node.js and NPM are also required, which can be downloaded [here](https://nodejs.org/en/).<br/>
PostgreSQL must also be installed, which can be downloaded [here](https://www.postgresql.org/download/). After installing PostgreSQL, a database must also be created which can be done by following this [tutorial](https://www.tutorialspoint.com/postgresql/postgresql_create_database.htm). Note the information used to create your PostgreSQL database, as it will be needed later in this guide. If you plan to host your own version of this app on Heroku, you can instead follow this [guide](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup).

### Local Deployment Steps

The following steps should be carried out within a Linux terminal.

1. Clone this repository by entering the command `git clone https://github.com/NJIT-CS490-SP21/project2-fo26.git`
2. Navigate to the project folder by using the command `cd project2-fo26`
3. Create an env file with the command `touch .env` and open this file with your preferred text editor. Note that this file will be hidden due to the dot prefix.
4. Inside the env file, type in `export DATABASE_URL='YOUR_DATABASE_URL_HERE'`. This URL should be in the form `postgres://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]`, without the brackets.
5. Save and close the .env file and return to the terminal with the project folder open.
6. Execute the command `npm install` in the project folder.
7. Next, execute the command `python app.py` to start the Flask server.
8. Open a new terminal window and in it run the command `cd project2-fo26`
9. Still in the new terminal window, now run the command `npm run start`
10. Preview the webpage by clicking on one of the links provided by the previous command.

## Additional Features

1. A feauture I might implement is having options to display rankings in the past week vs. all time. The all time rankings feature is the one currently implemented, so I would only have to create the past week rankings functionality. To implement this, I would first have to add a `datetime` column called `created` to the `Player` model in the `app.py` file. Next, I would have to import `datetime` into my `app.py` file. With this, I can use the `datetime.datetime().now()` function as a parameter when I insert a record into the `Player` model in functions like `on_login` and `on_winner`. This will provide a record of when a row was created. Next, I can create a function named `get_past_week_leaders()` in `app.py` to be called when `@socket.on('getPastWeekLeaders')` is triggered. This function can compute the current datetime, and subtract a week from it and save this `datetime` object into a variable called `pastWeek`. Next, I can use my SQlAlchemy object to call`.session.query(Player.username, Player.score).filter_by(Player.created >= pastWeek).order_by(Player.score.desc()).all()` to retrieve the desired rows. Next, I could create a React component similar to the current `Leaderboard` component, that simply emits `getPastWeekLeaders` instead of `getLeaders`.
2. Another leaderboard feature I can implement is searching for a specific user. In order to do this, I would add an `<input>` element into the `Leaderboard` component in `Leaderboard.js`. I would also assign a ref called `inputRef` to the input element using React's `useRef()` function. There would also have to be a `<button>` element that has its on click function set to a function that can be called `handleGetUser()`. This `handleGetUser()` function will check whether the `inputRef.current.value` is empty, and emit the `getLeaders` socket event if it isn't, along with the its value, with the key being 'userInput'. Once this socket event is emitted, the `on_get_leaders` function in `app.py` can simply check if the data is non-empty. In the case that it is non-empty, the function can return the rows retrieved using `db.session.query(Player.username, Player.score).filter_by(Player.username = data['userInput'])`, where `db` is the SQLAlchemy object.`

## Technical Issues

1. One technical issue I had was creating a SQLAlchemy object and model. After looking at class materials, I knew how to go about setting up an SQLAlchemy object in Python to access my remote PostgreSQL database. However, I initially had issues with importing the `models.py` file to construct a model named `Player`to store player data. This prompted the error message `ImportError: cannot import name 'Player'`. After pasting this message into Google, I found this page (https://stackoverflow.com/questions/9252543/importerror-cannot-import-name-x) that suggested a circular import issue. Since I followed the example code, I was initially confused as to why this was happening. My thought process was since the `models.py` file only contains one small block of code, it wouldn't ruin the readibility of my code to include it in `app.py` instead. I expected that this would fix the issue as an import wouldn't be used, which it did.
2. Another technical issue was figuring out how to properly display the leaderboard data in a table. I was able to start the process of solving this problem by reading the provided HTML table documentation (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table). I started by creating a new React component to handle displaying this table, which I named `Leaderboard` and put in the `Leaderboard.js` file. Next, I looked at the structure of a table element to get an idea of how to construct a table using player data. I decided that the table body would consist of a `<tr>` element for each player with `<td>` elements for the player's username and score. With player data stored in descending score order in the `leaderboard` state in `Leaderboard.js` accomplished beforehand, all I had to do now was transform this data into a table. I searched something along the lines of "Displaying array as an HTML table in React" and found this post (https://stackoverflow.com/questions/55829210/how-to-display-array-data-into-tables-in-reactjs). This post gave me the idea to use a double `map()` function on the data in the `leaderboard` state to generate `<tr>` elements and their inner `<td>` elements, which worked perfectly to solve my problem.
