import React from 'react';

const CurrentPlayer = (props) => {
    const { player, onCardPlayed } = props;

    return (
        <div>
            <p>You play as <b>{player.name}</b></p>
            <ul>
                {player.cards.map((card, index) =>
                    <li key={index}>
                        <a href={"/game/xxx/play/" + index} onClick={(event) => {
                            event.preventDefault();
                            onCardPlayed(index)
                        }}>
                            {card.amount} {card.color}
                        </a>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default CurrentPlayer;