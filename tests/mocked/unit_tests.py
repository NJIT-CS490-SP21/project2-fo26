import unittest
import unittest.mock as mock
from unittest.mock import patch
import os
import sys

sys.path.append(os.path.abspath('../../'))
from app import Player, order_by_name, order_by_score, check_user_exists

DATABASE = 'database'
EXPECTED = 'expected'
USERNAME = 'username'
WINNER = 'winner'
LOSER = 'loser'

# Player records
p1 = Player(username='Andy', score=340)
p2 = Player(username='Bill', score=150)
p3 = Player(username='Harold', score=175)
p4 = Player(username='Walter', score=400)
p5 = Player(username='Zeke', score=200)
p6 = Player(username='123Kevin', score=300)
    
class OrderLeaderBoardByNameTest(unittest.TestCase):
    ''' Verify that the database returns
    results ordered alphabetically by username '''
    def setUp(self):
        self.test_cases = [
            {
                DATABASE: [p5,p3,p2],
                EXPECTED: [['Bill',150],['Harold',175],['Zeke',200]] 
            },
            {
                DATABASE: [p5,p3,p1,p4],
                EXPECTED: [['Andy',340],['Harold',175],['Walter',400],['Zeke',200]]
            },
            {
                DATABASE: [p1,p2,p3,p6],
                EXPECTED: [['123Kevin',300],['Andy',340],['Bill',150],['Harold',175]]
            }
        ]
        
        self.current_db_mock = []

    def mocked_query_order_by_name(self):
        players = []
        for player in self.current_db_mock:
            players.append([player.username, player.score])
        # Sort by first item in each sub-list (username)
        return sorted(players)
        
    def test_success(self):
        for case in self.test_cases:
            # Set the db mock to the current test
            # case specified db contents
            self.current_db_mock = case[DATABASE]
            with patch('app.DB.session.query') as mocked_query:
                # Add 'return_value' since query() and order_by() calls
                # have parameters
                mocked_query.return_value.order_by.return_value.all \
                    = self.mocked_query_order_by_name
                
                actual_result = order_by_name()
                expected_result = case[EXPECTED]
                
                self.assertListEqual(actual_result, expected_result)
                self.assertEqual(len(actual_result), len(expected_result))



class OrderLeaderBoardByScoreTest(unittest.TestCase):
    ''' Verify that the database returns
    results ordered each player's score '''
    def setUp(self):
        self.test_cases = [
            {
                DATABASE: [p5,p3,p2],
                EXPECTED: [['Zeke',200],['Harold',175],['Bill',150]]
            },
            {
                DATABASE: [p5,p3,p1,p4],
                EXPECTED: [['Walter',400],['Andy',340],['Zeke',200],['Harold',175]]
            },
            {
                DATABASE: [p1,p2,p3,p6],
                EXPECTED: [['Andy',340],['123Kevin',300],['Harold',175],['Bill',150]]
            }
        ]
        
        self.current_db_mock = []
    
    def mocked_query_order_by_score(self):
        players = []
        for player in self.current_db_mock:
            players.append([player.username, player.score])
        # Sort by second item in each sub-list (score)
        return sorted(players, key=lambda x: x[1], reverse=True)
        
    def test_success(self):
        for case in self.test_cases:
            # Set the db mock to the current test
            # case specified db contents
            self.current_db_mock = case[DATABASE]
            with patch('app.DB.session.query') as mocked_query:
                # Add 'return_value' since query() and order_by() calls
                # have parameters
                mocked_query.return_value.order_by.return_value.all \
                    = self.mocked_query_order_by_score
                
                actual_result = order_by_score()
                expected_result = case[EXPECTED]
                
                self.assertListEqual(actual_result, expected_result)
                self.assertEqual(len(actual_result), len(expected_result))


class CheckIfUserExistsTest(unittest.TestCase):
    ''' Test if the server can check if a user exists within the database '''
    def setUp(self):
        self.test_cases = [
            {
                DATABASE: [p1,p2,p3],
                USERNAME: 'Zeke',
                EXPECTED: False
            },
            {
                DATABASE: [p5,p3,p1,p4],
                USERNAME: 'Andy',
                EXPECTED: True
            },
            {
                DATABASE: [p1,p2,p3,p4,p5],
                USERNAME: '123Kevin',
                EXPECTED: False
            }
        ]
        self.current_db_mock = []

    def mock_query_all(self):
        return self.current_db_mock
    
    def test_success(self):
        for case in self.test_cases:
            self.current_db_mock = case[DATABASE]
            with patch('app.Player.query') as mock_query:
                # Makes Player.query().all() return self.current_db_mock
                # so that all_players in app.py uses the mock db and not
                # the real one
                mock_query.all = self.mock_query_all
                actual_result = check_user_exists(case[USERNAME])
                expected_result = case[EXPECTED]
                
                self.assertEqual(actual_result, expected_result)

if __name__ == '__main__':
    unittest.main()