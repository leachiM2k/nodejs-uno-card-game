import React, {Component} from 'react';
import GameList from './GameList';
import GameDetail from './GameDetail';
import CurrentPlayer from './CurrentPlayer';

const Nes = require('nes');

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

        this.client = new Nes.Client('ws://localhost:8081');

        this.client.onError = (err) => {
            if (err.statusCode === 404) {
                this.setState({ detailGame: null });
            }
        };

        this.state = initialState;
    }

    async componentWillMount() {
        this.refreshRunningGames();
        if(this.state.detailGame) {
            this.client.subscribe('/game/' + this.state.detailGame.hash + '/subscription', this.receiveChange);
            this.showGameDetail(this.state.detailGame.hash);
        }
        if (this.state.currentPlayer) {
            this.refreshCurrentPlayer();
        }
        await this.client.connect();
    }

    componentDidUpdate(prevProps, prevState) {
        localStorage.setItem('uno', JSON.stringify(this.state));
        const prevHash = prevState.detailGame && prevState.detailGame.hash;
        const currHash = this.state.detailGame && this.state.detailGame.hash;
        if (currHash && prevHash !== currHash) {
            this.client.subscribe('/game/' + currHash + '/subscription', this.receiveChange);
        }
    }

    receiveChange = (update, flags) => {
        console.log('*************************** update, flags', update, flags);
        this.setState({ detailGame: { ...this.state.detailGame, gameState: update } });
    };

    async refreshRunningGames() {
        const res = await fetch('http://localhost:8081/');
        const json = await res.json();
        if (json.result !== "OK") {
            return;
        }
        this.setState({ games: json.games });
    }

    createNewGame = async () => {
        const res = await fetch('http://localhost:8081/', { method: 'POST' });
        const json = await res.json();
        if (json.result !== "OK") {
            return;
        }
        await this.refreshRunningGames();
    };

    showGameDetail = async (hash) => {
        const res = await fetch('http://localhost:8081/' + hash);
        const json = await res.json();
        let detailGame = null;
        if (json.result === "OK") {
            detailGame = { hash, gameState: json.gameState };
        }
        this.setState({ detailGame: detailGame });
    };

    refreshCurrentPlayer = async () => {
        const gameHash = this.state.detailGame && this.state.detailGame.hash;
        const playerHash = this.state.currentPlayer && this.state.currentPlayer.hash;
        const playerName = this.state.currentPlayer && this.state.currentPlayer.name;
        let currentPlayer = null;
        if (gameHash && playerHash && playerName) {
            const res = await fetch(`http://localhost:8081/${gameHash}/player/${playerName}?hash=${playerHash}`);
            const json = await res.json();
            if (json.result === "OK") {
                currentPlayer = json.player;
            }
            await this.showGameDetail(gameHash);
        }
        this.setState({ currentPlayer });
    };

    joinGame = async () => {
        const playerName = prompt('Nickname?');
        const res = await fetch(`http://localhost:8081/${this.state.detailGame.hash}/player/${playerName}`, { method: 'POST' });
        const json = await res.json();
        if (json.result !== "OK") {
            return;
        }
        this.setState({ currentPlayer: json.player });
        await this.showGameDetail(this.state.detailGame.hash);
    };

    startGame = async () => {
        const res = await fetch(`http://localhost:8081/${this.state.detailGame.hash}/start`, { method: 'POST' });
        const json = await res.json();
        if (json.result !== "OK") {
            return;
        }
        await this.showGameDetail(this.state.detailGame.hash);
    };

    playedCard = async (cardIndex) => {
        const gameHash = this.state.detailGame && this.state.detailGame.hash;
        const playerHash = this.state.currentPlayer && this.state.currentPlayer.hash;
        const playerName = this.state.currentPlayer && this.state.currentPlayer.name;
        const res = await fetch(`http://localhost:8081/${gameHash}/player/${playerName}/playCard/${cardIndex}?hash=${playerHash}`, { method: 'POST' });
        const json = await res.json();
        if (json.result !== "OK") {
            return;
        }
        await this.refreshCurrentPlayer();
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

        return <CurrentPlayer player={this.state.currentPlayer} onCardPlayed={this.playedCard}/>;
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
