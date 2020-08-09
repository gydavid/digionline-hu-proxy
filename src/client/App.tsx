import React, { Component } from 'react';
import './bootstrap.scss';
import ReactPlayer from 'react-player';
import './App.scss';
import Splash from './components/Splash';
import axios from 'axios';

class App extends Component {
  state: any;

  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      selected: null,
    };
    this.chooseChannel = this.chooseChannel.bind(this);
    this.getChannelList = this.getChannelList.bind(this);
  }

  async componentDidMount() {
    await this.getChannelList();
  }

  async getChannelList() {
    const res = await axios.get('/channels.json');
    this.setState({ channels: res.data });
  }

  chooseChannel(channel) {
    this.setState({
      selected: channel,
    });
  }

  render() {
    const channels = this.state.channels.map((ch) => (
      <div
        key={ch.id}
        className={`channel ${this.state.selected === ch ? 'active' : ''}`}
        onClick={() => this.chooseChannel(ch)}
      >
        <div className="logo">
          <img src={ch.logo} />
        </div>
        <div className="name">
          <span>{ch.name}</span>
        </div>
      </div>
    ));

    return (
      <div className="vh-100 container-fluid">
        <div className="row vh-100 no-gutters">
          <div className="col-sm-5 col-md-4 col-lg-3 vh-100 channels overflow-auto">{channels}</div>
          <div className="col-sm-7 col-md-8 col-lg-9 vh-100 video">
            <ReactPlayer
              className="player-wrapper"
              url={this.state.selected ? this.state.selected.url : ''}
              controls
              playing
              width="100%"
              height="100%"
              onClick={(e) => e.preventDefault()}
            />
            {this.state.selected === null ? <Splash /> : null}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
