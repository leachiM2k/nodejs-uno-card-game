import React from 'react';
import Link from 'next/link';
import 'isomorphic-fetch';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount() {
    this.refreshRunningGames();
  }

  async refreshRunningGames() {
    const res = await fetch('http://localhost:8081/');
    const json = await res.json();
    this.setState({games:json.games});
  }
  
  startGame = async () => {
    const res = await fetch('http://localhost:8081/', {method:'POST'});
    const json = await res.json();
    this.refreshRunningGames();
  };

  render () {
    return (
      <div>
        <h1>Uno</h1>
        <ul>
          {this.state.games && this.state.games.map((item,index) =>
          <li key={index}>
            <Link href={{ pathname: '/game', query: { hash: item } }}>
              <a>
                {item}
              </a>
            </Link>
          </li>)}
        </ul>
        <button onClick={this.startGame}>Start a new game</button>
      </div>
    );
  }
};