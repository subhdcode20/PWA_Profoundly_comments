import React, { Component } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { Twemoji } from "react-emoji-render";
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import Divider from 'material-ui/Divider';
import ListItem from 'material-ui/List/ListItem';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Timestamp from "react-timestamp";
import TextField from "material-ui/TextField";
import ActionSend from "material-ui/svg-icons/content/send";
import { cyan500 } from "material-ui/styles/colors";
import {addComment, getComments, saveComment, addComments} from "../../actions/comments";
import querystring from 'query-string';

import Styles from "./style.scss";
import { htmlDecode, sortFriendList, formatDate, formatTime } from '../../utility';

class CommentsIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      timeStamp: Date.now(),
      currentMsg: "",
      comments: [],
      story: {},
      loadCheck: []
    }
    this.handleCommentChange = this.handleCommentChange.bind(this)
    this.processChat = this.processChat.bind(this)
    this.sendComment = this.sendComment.bind(this)
    this.startListening = this.startListening.bind(this)
    this.handleChildAdd = this.handleChildAdd.bind(this)
    this.handleImg = this.handleImg.bind(this)
  }

  componentWillMount() {
    const searchText = this.props.route.location.search;
    var storyId = "", authId = ""
    if(searchText && searchText.trim != ""){
        // const searchParams = searchText.split('=');
        // if(searchParams.length > 2) this.setState({ error: true });
        // storyId = searchParams.pop();

        const searchParams = querystring.parse(searchText)
        storyId = searchParams.storyId
        authId = searchParams.authId
        console.log("searchParams: ", JSON.stringify(storyId), JSON.stringify(authId));
        localStorage.setItem('PC_PWA_STORYID', JSON.stringify(storyId));
        localStorage.setItem('PC_PWA_AUTHID', JSON.stringify(authId))
        // TODO: GET authId from url and set localStorage and use that in getComments api
    } else {
        try{
            storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'));
            authId = JSON.parse(localStorage.getItem('PC_PWA_AUTHID'));
        }catch(e){}
    }
    var cacheComments = localStorage.getItem(`PC_PWA_COMMENTS_${storyId}`) != null ? JSON.parse(localStorage.getItem(`PC_PWA_COMMENTS_${storyId}`)) : []
    var story_me = localStorage.getItem('PC_PWA_STORY_ME') != null ? JSON.parse(localStorage.getItem('PC_PWA_STORY_ME')).story : {}
    console.log('cache data in will mount= ', cacheComments, story_me);
    // if(cacheComments == null || cacheComments == undefined) {
    //   cacheComments = []
    // } else {
    //   cacheComments = JSON.parse(cacheComments)
    // }
    console.log('state in will mount = ', this.state);
    this.setState({storyId: storyId,story: story_me, comments: cacheComments}, () => {
      console.log("will mount setState= ", this.state);
    })
    // TODO: set story from cache
  }

  componentDidMount() {
    if(document.getElementById('loading')) document.getElementById('loading').remove();
    const storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))
    const authId = JSON.parse(localStorage.getItem('PC_PWA_AUTHID'))
    console.log("getComments params = ", storyId, authId);
    this.props.getComments(storyId, authId)

    this.startListening(storyId)
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps = ", nextProps);
    let {comments, story} = nextProps
    if(comments != null && comments != undefined) {
      this.setState({comments})
    }
    if(story != null && story != undefined) {
      this.setState({story})
    }
  }

  startListening(storyId) {
    console.log("in startListening ", storyId);
    firebase
      .database()
      .ref(`/rooms/${storyId}`)
      .on('child_added', snapshot => this.handleChildAdd(snapshot));
  }

  handleChildAdd(snapshot, lastChat) {
    const msg = snapshot.val();
    console.log('handleChildAdd = ', snapshot, msg, this.state, this.props);
		const msgId = snapshot.key;
		console.log('msg in handleChildAdd= ', msg);
		msg.id = msgId;
    // (lastChat && lastChat.id && lastChat.id === msgId) ||
		if (
			(msg.from.channelId === this.props.me.channelId &&
			parseInt(msg.timeStamp, 10) > this.state.timeStamp)
		) {
      console.log("DONT--- set and store chat on handleChildAdd");
			return true;
		} else {
			console.log("set and store chat on handleChildAdd");
			this.setComment(msg);
			this.storeComment(msg);
		}
  }

  handleCommentChange(e) {
    let text = e.target.value
    this.setState({currentMsg: text})
  }

  sendComment(e) {
    console.log("send comment: ", this.state.currentMsg, this.props);
    let msg = this.state.currentMsg.trim();
    this.setState({currentMsg: ''});
    let {me, story} = this.props
    // TODO: replace storyId from store
    let storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))  //this.state.story.storyId
    let cmntObj = {
      comment: msg,
      storyId: story.storyId,
      from: {
    		channelId: me.channelId, //"1799237930126421",
        imageUrl: me.imageUrl,  //"https://img.neargroup.me/project/50x50/profile_1799237930126421",
    		name: me.name  //"Subham Dey"
    	},
      timeStamp: Date.now()
    }
    console.log("go to addComments = ", cmntObj);
    this.props.addComments(cmntObj)

    this.processChat(cmntObj);
    // TODO: implement this
    // if(navigator.onLine){
		// 	this.processChat(commentObj);
		// }else {
		// 	this.cacheSentChat(commentObj);
		// }

  }
  setComment(msg) {
    console.log("msg in setComment= ",msg);
		this.props.addComments(msg)
	}

	storeComment(msg) {
    console.log("msg in ", msg);
    let storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))
		try {
			const { data } = this.props;
			const comments = JSON.parse(localStorage.getItem(`PC_PWA_COMMENTS_${msg.storyId}`)) || [];
      console.log("comments in localStorage in storeComment= ", comments);
			comments.push(msg);
			localStorage.setItem(
				`PC_PWA_COMMENTS_${storyId}`,
				JSON.stringify(comments)
			);
		}catch(e){}
	}

  processChat(commentObj) {
		// TODO: REPLACE with data from store
    // const {stories, storyId, me} = this.props
    let storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))   //this.state.story.storyId
    console.log("in processChat ", commentObj, storyId);

		firebase
			.database()
			.ref(`/rooms/${storyId}`)
			.push(commentObj).then(res => {
				commentObj.id = res.key;
				if (commentObj.id) {
          console.log("got firebase commnent id: ", commentObj.id);
    // TODO: implement getLastMsg
					this.storeComment(commentObj);
				}
				console.log('getLastMsg in processChat= ', storyId, commentObj);
				// this.props.getLastMsg(storyIdd, commentObj)
			});
		try {
			this.refs["autoFocus"].select();
      this.props.saveComment({...commentObj, storyId})

		} catch (e) {
      console.log("saveComment catch error= ", e);
    }

		// if (navigator.onLine && !(isOtherOnline && isOtherOnline[data.channelId])) { //
		// 	console.log("sendPush= ", {
		// 		toChannelId: data.channelId,
		// 		fromChannelId: fromId,
		// 		msg: chatObj.msg  //this.state.message.substring(0,200)
		// 	});
		// 	this.props.sendPush({
		// 		toChannelId: data.channelId,
		// 		fromChannelId: fromId,
		// 		msg: chatObj.msg  //this.state.message.substring(0,200)
		// 	});
		// }
  }

  cacheSentChat(commentObj) {
    // TODO: replace storyId from store
    let storyId = this.state.story.storyId
		console.log("in cacheSentChat ", commentObj);
		const { data, fromId, isOtherOnline } = this.props;
		let offlineComments = localStorage.getItem(`PC_PWA_OFFLINE_COMMENTS`);
		let myOfflineComments = [];
		if(offlineComments) {
			offlineComments = JSON.parse(offlineComments);
			myOfflineComments = offlineComments[commentObj.storyId] || [];
		} else {
			offlineComments = {};
		}
		myOfflineComments.push(commentObj);
		offlineComments[data.meetingId] = myOfflineComments;
		localStorage.setItem(`PC_PWA_OFFLINE_COMMENTS`, JSON.stringify(offlineComments));
	}

  handleImg(id, e) {
    console.log("in handleImg -- ", id, e, e.target.src);
		try {
			// to prevent infinite loop if fallback avtar even fails
			if(!this.state.loadCheck.includes(id)) {
				this.setState(prev => {
					const loadCheck = [ ...loadCheck ];
					loadCheck.push(id);
					return { loadCheck }
				})
        console.log("setting target source to Avatar");
				e.target.src = AVTAR;
			}

		}catch(e){}
	}

  render() {
    console.log("coments in state= ", this.state);
    const AvtarUrl = 'https://img.neargroup.me/project/forcesize/50x50/profile_';
    // onError={this.handleImg.bind(this, friend.channelId)}
    //containerElement={<Link to="/chat" />}
    // {Number(ucc[friend.meetingId]) > 0 && (<Chip style={{float: 'left', fontSize: 15, backgroundColor: '#00E676'}}>{ucc[friend.meetingId]}</Chip>) }
    let {story, comments} = this.state


    return (
      <div className={Styles.ComentsWindow}>
        <div className={Styles.ChatBox}>
          {
            Object.keys(this.state.story).length > 0 &&
            (<div>
            <List style={{padding: 0}}>
              <Divider inset component="li" />
              <ListItem
                leftAvatar={<Avatar src={story.creator.imageUrl} onError={this.handleImg.bind(this, story.creator.id)} />}
                onClick={() => {console.log("list item click")}}
                primaryText={<Twemoji text={htmlDecode(story.creator.name)} />}
                rightIcon={
                  (<div style={{float: 'right', width: '26%'}}>
                  <p className={Styles.lastTime}>
                    {/** Number(item.likes) > 0 && <span>{item.likes}</span> **/}
                  </p>
                  </div>)
                }
                secondaryText={
      						<p style={{whiteSpace: 'normal', fontSize: 12, height: 'auto'}}>{story.storyText}</p>
      					}
              />
            </List>
          </div>)
        }
        <div>
        {
          comments.map(item => (
            <List style={{padding: 0}}>
              <Divider inset component="li" />
              <ListItem
                key={item.timeStamp}
                leftAvatar={<Avatar src={item.from.imageUrl} onError={this.handleImg.bind(this, item.from.channelId)} />}
                onClick={() => {console.log("list item click")}}
                primaryText={<Twemoji text={htmlDecode(item.from.name)} />}

                secondaryText={
      						<div style={{whiteSpace: 'normal', fontSize: 12, height: 'auto'}}>
                  {item.type == "wow" ? "liked this story." : "commented:"} {item.type != "like" && item.comment}
                  </div>
      					}
              />
            </List>
          ))
          }
        </div>
        </div>
        <div className={Styles.actionBtns}>
  				<TextField
  					onChange={this.handleCommentChange}
  					value={this.state.currentMsg}
  					fullWidth={true}
  					hintText="Type a comment..."
  					multiLine={true}
  					underlineStyle={{display: 'none'}}
  					onKeyPress={ev => {
  						if (ev.key === "Enter" && ev.shiftKey) {
  							this.sendComment();
  							ev.preventDefault();
  						}
  					}}
  					ref="autoFocus"
  				/>
  				<a onClick={this.sendComment}>
  					<ActionSend color={cyan500} />
  				</a>
  			</div>
      </div>

    )
  }

}

const mapStateToProps = state => {
	return {
		me: (state.comments.me && state.comments.me) || '',
    story: state.comments.story || {},
    comments: state.comments.comments
	}
}

const mapDispatchToProps = dispatch => {
	return {
    getComments: (storyId, authId) => {
      dispatch(getComments(storyId, authId))
    },
    saveComment: (data) => {
      dispatch(saveComment(data))
    },
		addComments: (cmtObj) => {
      dispatch(addComments(cmtObj))
    }
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentsIndex)

// rightIcon={
//   (
//     <div style={{float: 'right', width: '15%', textAlign: 'center'}}>
//       <FontAwesome className={Styles.lastTime} name="heart" />
//       <br />
//     {/**
//       <span>&#9825;</span>
//     **/}
//       <span className={Styles.lastTime} style={{fontSize: 10}}>
//         {Number(item.likes) > 0 && <span>{item.likes}</span>}
//         {/** <span style={{float: 'left', fontSize: 15, color: '#4CAF50'}}>{Number(ucc[friend.meetingId]) > 0 && ucc[friend.meetingId]}</span> **/}
//         {/** <span style={{float: 'right', color: Number(ucc[friend.meetingId]) > 0 ? '#00E676' : '' }}>{this.handleLastTime(friend.lastTime)}</span>) **/}
//       </span>
//     </div>
//   )
// }
