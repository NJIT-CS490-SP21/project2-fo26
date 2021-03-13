import unittest
import unittest.mock as mock
from unittest.mock import patch
import os
import sys

sys.path.append(os.path.abspath('../../'))
from app import Player, order_by_name, update_winner_score

DATABASE = 'database'
EXPECTED = 'expected'
WINNER = 'winner'
LOSER = 'loser'

class OrderLeaderBoardByNameTest(unittest.TestCase):
    ''' Verify that the database returns
    results ordered alphabetically by username '''
    def setUp(self):
        p1 = Player(username='Andy', score=340)
        p2 = Player(username='Bill', score=150)
        p3 = Player(username='Harold', score=175)
        p4 = Player(username='Walter', score=400)
        p5 = Player(username='Zeke', score=200)
        p6 = Player(username='123Kevin', score=300)
        
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
    
    
class UpdatePlayerScoreTest(unittest.TestCase):
    def setUp(self):
        p1 = Player(username='Andy', score=120)
        p2 = Player(username='Bill', score=104)
        p3 = Player(username='Zeke', score=200)
        self.test_cases = [
            {
                DATABASE: [p1,p2],
                WINNER: 'Andy',
                EXPECTED: [['Andy',121],['Bill',104]]
            },
            {
                DATABASE: [p1,p2],
                WINNER: 'Bill',
                EXPECTED: [['Andy',120],['Bill',105]]
            },
            {
                DATABASE: [p2,p3,p1],
                WINNER: 'Zeke',
                EXPECTED: [['Bill',104],['Andy',120],['Zeke',201]]
            }
        ]
        
        self.current_db_mock = []
    
    def mock_update_winner_score(self, t):
        return ['test','test']
        
    def mocked_db_session_commit(self):
        pass
    
    def test_success(self):
        for case in self.test_cases:
            self.current_db_mock = case[DATABASE]
            with patch('app.DB.session.query') as mocked_query:
                with patch('app.DB.session.commit', self.mocked_db_session_commit):
                    actual_result = update_winner_score(case[WINNER])
                    print(sys.path.append(os.path.abspath('../../')))
                    self.assertListEqual(actual_result, case[EXPECTED])
                    
if __name__ == '__main__':
    unittest.main()