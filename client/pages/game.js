import React from 'react';
import Link from 'next/link';
import 'isomorphic-fetch';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameHash: props.url.query.hash
    }
  }

  render () {
    return (
      <div>
        <h1>Running Game</h1>
        <h2>Players</h2>
      </div>
    );
  }
};