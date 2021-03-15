'''
Module to test unmocked server side functions
'''
import unittest
import os
import sys

sys.path.append(os.path.abspath('../..'))
from app import get_user_info, remove_logged_out_user, get_game_status

NUMBER_OF_PLAYERS = 'numPlayers'
EXPECTED = 'expected'
USER_ID = 'userId'
DATA = "data"

class GetUserInfoTest(unittest.TestCase):
    '''
    Test that the server returns the correct
    new player information based on how many already
    active players there are
    '''
    def setUp(self):
        self.test_cases = [
            {
                NUMBER_OF_PLAYERS: 0,
                EXPECTED: {'spectator': False, 'player': 'X'}
            },
            {
                NUMBER_OF_PLAYERS: 1,
                EXPECTED: {'spectator': False, 'player': 'O'}
            },
            {
                NUMBER_OF_PLAYERS: 5,
                EXPECTED: {'spectator': True}
            },
        ]

    def test_success(self):
        '''
        Test the success of get_user_info() on the above test cases
        '''
        for case in self.test_cases:
            actual_result = get_user_info(case[NUMBER_OF_PLAYERS])
            expected_result = case[EXPECTED]
            print(expected_result)
            print(actual_result)
            self.assertEqual(len(actual_result), len(expected_result))
            self.assertDictEqual(actual_result, expected_result)


class LogOutUserTest(unittest.TestCase):
    '''
    Test that the server removes the logged out user
    from a list of currently logged in users correctly
    '''
    def setUp(self):
        self.logged_in_users = [{'user_id': 'xAtqc42f', 'player': 'X', 'spectator': False},
                                {'user_id': 'fdSxfw24', 'player': 'O', 'spectator': False},
                                {'user_id': 'Nxzsou5I', 'spectator': True}]

        self.test_cases = [
            {
                USER_ID: 'xAtqc42f',
                EXPECTED: [{'user_id': 'fdSxfw24', 'player': 'O', 'spectator': False},
                           {'user_id': 'Nxzsou5I', 'spectator': True}]
            },
            {
                USER_ID: 'fdSxfw24',
                EXPECTED: [{'user_id': 'xAtqc42f', 'player': 'X', 'spectator': False},
                           {'user_id': 'Nxzsou5I', 'spectator': True}]
            },
            {
                USER_ID: 'Nxzsou5I',
                EXPECTED: [{'user_id': 'xAtqc42f', 'player': 'X', 'spectator': False},
                           {'user_id': 'fdSxfw24', 'player': 'O', 'spectator': False}]
            }
        ]

    def test_success(self):
        '''
        Test the success of remove_logged_out_user() on the above test cases
        '''
        for case in self.test_cases:
            actual_result = remove_logged_out_user(self.logged_in_users, case[USER_ID])
            expected_result = case[EXPECTED]
            print(expected_result)
            print(actual_result)
            self.assertEqual(len(actual_result), len(expected_result))
            self.assertListEqual(actual_result, expected_result)


class GetEndOfGameStatusTest(unittest.TestCase):
    '''
    Test that the server correctly returns the username
    of the winner and loser if there wasn't a draw
    '''
    def setUp(self):
        self.logged_in_users = [{'username':'Bill231', 'player': 'X', 'spectator': False},
                                {'username': 'Tom650', 'player': 'O', 'spectator': False},
                                {'username': 'Player4', 'spectator': True}]

        self.test_cases = [
            {
                DATA: {'status': 'win', 'player': 'X'},
                EXPECTED: {'is_winner': True, 'winner': 'Bill231', 'loser': 'Tom650'}
            },
            {
                DATA: {'status': 'win', 'player': 'O'},
                EXPECTED: {'is_winner': True, 'winner': 'Tom650', 'loser': 'Bill231'}
            },
            {
                DATA: {'status': 'draw'},
                EXPECTED: {'is_winner': False}
            }
        ]

    def test_success(self):
        '''
        Test the success of get_game_status() on the above test cases
        '''
        for case in self.test_cases:
            actual_result = get_game_status(case[DATA], self.logged_in_users)
            expected_result = case[EXPECTED]
            print(expected_result)
            print(actual_result)
            self.assertEqual(len(actual_result), len(expected_result))
            self.assertDictEqual(actual_result, expected_result)


if __name__ == '__main__':
    unittest.main()
