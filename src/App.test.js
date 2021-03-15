import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';
import DisplayUsers from './DisplayUsers';

afterEach(cleanup)

test('that newly joined players are displayed', () => {
    const allUsers = [{'player':'X','username':'Bob', 'spectator': false},
                      {'player':'O','username':'Gary', 'spectator': false},
                      {'username':'Tim', 'spectator': true}];

    const {result} = render(<DisplayUsers allUsers={allUsers}/>);
    const displayUsersElement = screen.getByTestId("displayUsers");
    // Text is stored without whitespace for some reason
    expect(displayUsersElement).toHaveTextContent("PlayerX:Bob");
    expect(displayUsersElement).toHaveTextContent("PlayerO:Gary");
    expect(displayUsersElement).toHaveTextContent("Spectator:Tim");
    // Add a new user and force the "result" to re-render
    allUsers.push({'username':'Rob', 'spectator': true});
    render(<DisplayUsers allUsers={allUsers}/>, {result})
    expect(screen.getAllByTestId("displayUsers")[1]).toHaveTextContent("Spectator:Rob");
});
