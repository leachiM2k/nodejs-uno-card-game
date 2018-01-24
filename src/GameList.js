import React from 'react';

const GameList = (props) => {
    const { games, onDetails, onStartNew } = props;

    return (
        <div>
            <h1>Uno</h1>
            <ul>
                {games && games.map((item, index) =>
                    <li key={index}>
                        <a href={'/game?hash=' + item} onClick={(event) => {
                            event.preventDefault();
                            onDetails(item)
                        }}>
                            {item}
                        </a>
                    </li>
                )}
            </ul>
            <button onClick={onStartNew}>Create a new game</button>
        </div>
    );
};

export default GameList;