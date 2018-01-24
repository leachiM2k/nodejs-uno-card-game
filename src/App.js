import React, {Component} from 'react';
import GameList from './GameList';
import GameDetail from './GameDetail';
import CurrentPlayer from './CurrentPlayer';

let storedState = localStorage.getItem('uno');

class App extends Component {
    constructor(props) {
        super(props);

        let initialState = {
            games: [],
            detailGame: null,
            currentPlayer: null,
        };

        if (storedState) {
            try {
                initialState = JSON.parse(storedState);
            } catch (e) {
            }
        }

        this.state = initialState;
    }

    componentWillMount() {
        this.refreshRunningGames();
        if(this.state.detailGame) {
            this.showGameDetail(this.state.detailGame.hash);
        }
    }

    componentDidUpdate() {
        localStorage.setItem('uno', JSON.stringify(this.state));
    }

    async refreshRunningGames() {
        const res = await fetch('http://localhost:8081/');
        const json = await res.json();
        this.setState({ games: json.games });
    }

    createNewGame = async () => {
        const res = await fetch('http://localhost:8081/', { method: 'POST' });
        const json = await res.json();
        await this.refreshRunningGames();
    };

    showGameDetail = async (hash) => {
        const res = await fetch('http://localhost:8081/' + hash);
        const json = await res.json();
        this.setState({ detailGame: { hash, gameState: json.gameState } });
    };

    joinGame = async () => {
        const playerName = prompt('Nickname?');
        const res = await fetch(`http://localhost:8081/${this.state.detailGame.hash}/player/${playerName}`, { method: 'POST' });
        const json = await res.json();
        this.setState({ currentPlayer: json.player });
        await this.showGameDetail(this.state.detailGame.hash);
    };

    startGame = async () => {
        const res = await fetch(`http://localhost:8081/${this.state.detailGame.hash}/start`, { method: 'POST' });
        const json = await res.json();
        await this.showGameDetail(this.state.detailGame.hash);
    };

    renderList() {
        if (this.state.detailGame) {
            return;
        }
        return <GameList games={this.state.games} onDetails={this.showGameDetail} onStartNew={this.createNewGame}/>;
    }

    renderGameDetails() {
        if (!this.state.detailGame) {
            return;
        }
        return <GameDetail game={this.state.detailGame.gameState} onJoin={this.joinGame} onStartGame={this.startGame}/>;
    }

    renderPlayerDetails() {
        if (!this.state.currentPlayer) {
            return;
        }

        return <CurrentPlayer player={this.state.currentPlayer}/>;
    }

    render() {
        return (
            <div>
                {this.renderList()}
                {this.renderGameDetails()}
                {this.renderPlayerDetails()}
            </div>
        );
    }
}

export default App;
