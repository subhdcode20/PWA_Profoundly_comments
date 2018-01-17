import React, { Component } from "react";
import { connect } from 'react-redux';

import { Twemoji } from "react-emoji-render";
import Avatar from "material-ui/Avatar";
import TextField from "material-ui/TextField";
import ActionSend from "material-ui/svg-icons/content/send";
import RefreshIndicator from "material-ui/RefreshIndicator";
import { cyan500 } from "material-ui/styles/colors";
import { getLastMsg } from '../../actions/friends';

import Header from "../Header";

import Styles from "./style.scss";

let myFirebase;
let writeFirebase = {};
let lastChat = {};
let isOnline;
let lastSeen;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      chats: [],
      loading: true,
      isOtherOnline: false,
      sentTime: Date.now()
    };
    this.handleMsg = this.handleMsg.bind(this);
    this.sendPlz = this.sendPlz.bind(this);
    this.startListening = this.startListening.bind(this);
  }

  componentDidMount() {
    const { data, fromId } = this.props;
    const cachedChats = localStorage.getItem(`NG_PWA_CHAT_${data.meetingId}`);
    if (cachedChats && cachedChats.length > 0) {
      const chatsRetrieved = JSON.parse(cachedChats);
      lastChat = chatsRetrieved[chatsRetrieved.length - 1];
      this.setState({
        chats: chatsRetrieved,
        loading: false
      });
      myFirebase = firebase
        .database()
        .ref(`/rooms/${data.meetingId}`)
        .orderByKey()
        .startAt(lastChat.id);
    } else {
      myFirebase = firebase.database().ref(`/rooms/${data.meetingId}`);
    }

    const connectFirebase = new Firebase(
      `https://test-neargroup.firebaseio.com/`
    );
    writeFirebase = {
      chat: connectFirebase.child("rooms").child(data.meetingId),
      isOnline: connectFirebase.child("isOnline").child(fromId),
      isOtherOnline: firebase.database().ref(`/isOnline/${data.channelId}`),
      lastSeen: connectFirebase.child("lastSeen").child(data.meetingId)
    };
    writeFirebase.isOnline.set({ online: true });
    this.startListening();
  }

  componentDidUpdate() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  handleMsg(prop, message) {
    this.setState({
      message
    });
  }

  sendPlz() {
    const { data, fromId } = this.props;
    if (this.state.message.trim() === "") return false;
    this.setState({
      message: ""
    });
    const chatObj = {
      fromId,
      toId: data.channelId,
      msg: this.state.message,
      sentTime: Date.now(),
      arrivedAt: Firebase.ServerValue.TIMESTAMP
    };
    writeFirebase.chat.push(chatObj).then(res => {
      chatObj.id = res.key();
      if (chatObj.id) {
        this.setChat(chatObj);
    }
	  this.props.getLastMsg(this.props.data.meetingId, chatObj)
    });
    try {
      this.refs["autoFocus"].select();
    } catch (e) {}

    if (!this.state.isOtherOnline) {
      this.props.sendPush({
        toChannelId: data.channelId,
        fromChannelId: fromId,
        msg: this.state.message.substring(0,200)
      });
    }
  }

  startListening() {
    //intercepts for any new message from firebase with check of lastchatId
    myFirebase.on("child_added", snapshot => {
      const msg = snapshot.val();
      const msgId = snapshot.key;
      msg.id = msgId;
      if (
        (lastChat.id && lastChat.id === msgId) ||
        (msg.fromId === this.props.fromId &&
          parseInt(msg.sentTime, 10) > this.state.sentTime)
      ) {
        return true;
      } else {
        this.setChat(msg);
      }
    });
    myFirebase.on("value", snapshot => {
      this.setState({ loading: false });
    });

    //manage self online and last seen
    writeFirebase.isOnline.onDisconnect().set({ online: false });
    writeFirebase.lastSeen.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

    //check if other participant is online
    writeFirebase.isOtherOnline.on("child_changed", snapshot => {
      const isOtherOnline = snapshot.val();
      this.setState({ isOtherOnline });
    });
  }

  setChat(msg) {
    this.setState((prevState, props) => {
      const chats = [...prevState.chats];
      chats.push(msg);
      localStorage.setItem(
        `NG_PWA_CHAT_${props.data.meetingId}`,
        JSON.stringify(chats)
      );
      return { chats, loading: false };
    });
  }

  formatTime(t) {
    const dateObj = new Date(t);
    const tym = dateObj.toLocaleTimeString();
    return `${tym.substring(0, 5)} ${tym.substr(tym.length - 2)}`;
  }

  formatDate(t) {
    const dateObj = new Date(t);
    return dateObj.toDateString().substr(4);
  }

  render() {
    const { data, fromId } = this.props;
    const AvtarUrl = `https://img.neargroup.me/project/forcesize/50x50/profile_${
      data.imageUrl
    }`;
    return (
      <div>
        <Header
          name={data.name}
          avtar={AvtarUrl}
          action={this.props.toggleScreen}
        />
        {this.state.loading && (
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status="loading"
            className={Styles.refresh}
          />
        )}
        <div className={Styles.ChatBox}>
          {this.state.chats.map((chat, index) => {
            let newDay = "";
            if (index === 0) {
              newDay = this.formatDate(chat.sentTime);
            } else {
              const newDate = this.formatDate(chat.sentTime);
              const oldDate = this.formatDate(
                this.state.chats[index - 1].sentTime
              );
              if (newDate !== oldDate) {
                newDay = newDate;
              }
            }
            return <div key={index} className={chat.fromId == fromId ? Styles.self : ""}>
                {newDay && <div className={Styles.newDay}>
                    {newDay}
                  </div>}
                <span className={Styles.chatlet}>
                  <Twemoji text={chat.msg} />
                </span>
                <span className={Styles.time}>
                  {this.formatTime(chat.sentTime)}
                </span>
              </div>;
          })}
        </div>
        <div className={Styles.actionBtns}>
          <TextField
            onChange={this.handleMsg}
            value={this.state.message}
            fullWidth={true}
            hintText="Message"
            multiLine={true}
            onKeyPress={ev => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                this.sendPlz();
                ev.preventDefault();
              }
            }}
            ref="autoFocus"
          />
          <a onClick={this.sendPlz}>
            <ActionSend color={cyan500} />
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
      getLastMsg: (id, msg) => {
          dispatch(getLastMsg(id, msg));
      }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);