import React from 'react';

const GameDetail = (props) => {
    const { game, onJoin, onStartGame } = props;

    return (
        <div>
            <h1>Uno - Game Detail</h1>
            <p>
                {game.gameStarted ? "Game started" : "Game not started"}
            </p>
            <p>
                Card Count: {game.cardCount}
            </p>

            {game.actualCard &&
            <p>
                Current Card: {game.actualCard.amount} {game.actualCard.color}
            </p>
            }

            {game.direction &&
            <p>
                Richtung: {game.direction}
            </p>
            }

            <div>
                Players:
                <br/>
                {
                    game.players.length === 0 ? "No players yet" :
                        <ol>
                            {game.players[game.direction === 'ascending' ? 'map' : 'reverse'](i => i).map((player, index) =>
                                <li key={index}>
                                    {player.name}
                                    {player.name === game.actualPlayer && " is on move"}
                                </li>)}
                        </ol>
                }
            </div>

            {!game.gameStarted && <button onClick={onJoin}>Join the game</button>}
            {!game.gameStarted && game.players.length > 1 && <button onClick={onStartGame}>Let the game begin</button>}
        </div>
    );
};

export default GameDetail;