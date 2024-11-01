// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuctionRoom from './components/AuctionRoom';
import OrganizerPanel from './components/OrganizerPanel';
import ParticipantLogin from './components/ParticipantLogin';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/organizer" component={OrganizerPanel} />
                <Route path="/participant/:token" component={AuctionRoom} />
                <Route path="/" component={ParticipantLogin} />
            </Switch>
        </Router>
    );
}

export default App;
