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
import Snackbar from 'material-ui/Snackbar';
import { cyan500 } from "material-ui/styles/colors";
import {addComment, getComments, saveComment, addComments, addChildListener, getCacheData} from "../../actions/comments";
import querystring from 'query-string';
import NoFriends from '../NoFriends';
import Styles from "./style.scss";
import { storyTextDecode, htmlDecode, sortFriendList, formatDate, formatTime } from '../../utility';

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
    this.handleClose = this.handleClose.bind(this)
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

    }
    // else {
    //     try{
    //         storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'));
    //         authId = JSON.parse(localStorage.getItem('PC_PWA_AUTHID'));
    //     }catch(e){}
    // }

    // if(!navigator.onLine) {
      this.props.getCacheData(storyId)
    // }
  }

  componentDidMount() {
    if(document.getElementById('loading')) document.getElementById('loading').remove();
    const storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))
    const authId = JSON.parse(localStorage.getItem('PC_PWA_AUTHID'))
    console.log("getComments params = ", storyId, authId);
    console.log("navigator status= ", navigator.onLine);
    if(navigator.onLine) {
      console.log("navigator online -- get friendsss");
      this.props.getComments(storyId, authId)
    } else {
      console.log("navigator offline no get friends api");
    }

    // this.startListening(storyId)
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps = ", nextProps);
    const storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))

    let {comments, story, showVulgar, childListeners} = nextProps
    let newState = {}
    if(comments != null && comments != undefined) {
      // this.setState({comments})
      newState["comments"] = comments
    }
    if(story != null && story != undefined) {
      // this.setState({story})
      newState["story"] = story
    }
    if(showVulgar != null && showVulgar != undefined) {
      newState["showVulgar"] = showVulgar
    }

    this.setState(newState)

  	if (!childListeners.includes(storyId)) {

      let lastComment;
      if (comments && comments.length > 0) {
        lastComment = comments[comments.length - 1];
      }
      console.log("call startListening -- ", lastComment);
            // this.startListening(story.storyId, lastComment);
    } else {

    }

  }

  startListening(storyId, lastComment) {
    console.log("in startListening ", storyId, lastComment);
    	if (lastComment && lastComment.id) {
        firebase
          .database()
          .ref(`/rooms/${storyId}`)
          .on('child_added', snapshot => this.handleChildAdd(snapshot, lastComment));
      } else {
        firebase
          .database()
          .ref(`/rooms/${storyId}`)
          .on('child_added', snapshot => this.handleChildAdd(snapshot));
      }
      this.props.addChildListener(storyId);
  }

  handleChildAdd(snapshot, lastComment) {
    const msg = snapshot.val();
    console.log('handleChildAdd = ', snapshot, msg, this.state, this.props);
		const msgId = snapshot.key;
		console.log('msg in handleChildAdd= ', msg, lastComment);
		msg.id = msgId;
    // (lastComment && lastComment.id && lastComment.id === msgId) ||
		if (
      (lastComment && lastComment.id && lastComment.id === msgId) ||
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
    if(msg === '') return false
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

      // this.processChat(cmntObj);
      console.log("navigator status 2= ", navigator.onLine);

      if(navigator.onLine){
        console.log("navigator online -- process chat");
        this.processChat(cmntObj);
        //this.processChat(commentObj);
  		}else {
        console.log("navigator offline -- NO process chat");
  			// this.cacheSentChat(commentObj);
  		}

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
    let storyId = JSON.parse(localStorage.getItem('PC_PWA_STORYID'))  //this.state.story.storyId
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
			// if(!this.state.loadCheck.includes(id)) {
			// 	this.setState(prev => {
			// 		const loadCheck = [ ...loadCheck ];
			// 		loadCheck.push(id);
			// 		return { loadCheck }
			// 	})
      //   console.log("setting target source to Avatar");
			// 	e.target.src = AVTAR;
			// }

      e.target.src = AVTAR;

		}catch(e){}
	}

  handleClose() {
    this.setState({showVulgar: false})
  }

  render() {
    console.log("coments in state= ", this.state);
    const AvtarUrl = 'https://img.neargroup.me/project/forcesize/50x50/profile_';
    // onError={this.handleImg.bind(this, friend.channelId)}
    //containerElement={<Link to="/chat" />}
    // {Number(ucc[friend.meetingId]) > 0 && (<Chip style={{float: 'left', fontSize: 15, backgroundColor: '#00E676'}}>{ucc[friend.meetingId]}</Chip>) }
    let {story, comments, showVulgar} = this.state
    let {loading} = this.props
    // story.storyText = "#DailyRants | Boy - 20 | 19 KM Kung mababasa mo to GUMAMELA mag reply ka pls iba Kasi napindot ko eh- E,Dodong, Hindi ko ma replyan. Eto Yung lumalabas oh \" This user is busy chatting with someone, please try again later.\" I think you hit the\"block\" button lol \uD83D\uDE02. Paano na to?"
    if(Object.keys(story).length > 0) {

      console.log('render story text= ',
      story.storyText)
      console.log("#DailyRants | Boy - 20 | 19 KM Kung mababasa mo to GUMAMELA mag reply ka pls iba Kasi napindot ko eh- E,Dodong, Hindi ko ma replyan. Eto Yung lumalabas oh \" This user is busy chatting with someone, please try again later.\" I think you hit the\"block\" button lol \uD83D\uDE02. Paano na to?"
      );
      console.log(decodeURIComponent(JSON.parse('"' + story.storyText.replace(/\n/g, ' ') + '"')) )

    }

    return (
      <div className={Styles.ComentsWindow}>
        <div>
          {loading &&
            <div>

              <RefreshIndicator
                size={40}
                left={10}
                top={0}
                status="loading"
                className={Styles.refresh}
              />
            </div>
          }
          {
            showVulgar &&
            (<Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              open={this.state.showVulgar}
              autoHideDuration={6000}
              onClose={this.handleClose}
              ContentProps={{
                'aria-describedby': 'message-id',
              }}
              message={<span id="message-id">Vulgar messages are prohibited</span>}
            />)
          }
        </div>
        <div className={Styles.ChatBox}>
          {
            Object.keys(story).length > 0 &&
            (<div className={Styles.StoryHeader} style={{margin: 0}}>
            <List style={{padding: 0}}>
              <Divider inset component="li" />
              <ListItem
                leftAvatar={<Avatar src={story.creator.imageUrl} onError={this.handleImg.bind(this, story.creator.id)} />}
                onClick={() => {console.log("list item click")}}
                primaryText={<b style={{color: 'white'}}><Twemoji text={htmlDecode(story.creator.name)} /></b>}
                rightIcon={
                  (<div style={{float: 'right', width: '26%'}}>
                  <p className={Styles.lastTime}>
                    {/** Number(item.likes) > 0 && <span>{item.likes}</span> **/}
                  </p>
                  </div>)
                }
                secondaryText={
      						<p style={{whiteSpace: 'normal', fontSize: 12, height: 'auto'}}><b>{/** <Twemoji text={htmlDecode(story.storyText)} /> **/}  <Twemoji text={ storyTextDecode(story.storyText) } /> </b></p>
      					}
              />
            </List>
          </div>)
        }
        <div>
        {
          comments.length > 0 &&
          comments.map((item, index) => {
            console.log("render comment item= ", item, index);
            return (<List style={{padding: 0}}>
              {/** <Divider inset component="li" /> **/}
              <ListItem
                key={item.timeStamp}
                leftAvatar={<Avatar src={item.from.imageUrl} onError={this.handleImg.bind(this, item.from.id)} />}
                onClick={() => {console.log("list item click")}}
                primaryText={<Twemoji text={htmlDecode(item.from.name)} />}

                secondaryText={
      						<div style={{whiteSpace: 'normal', fontSize: 12, height: 'auto'}}>
                  {
                    item.type == "wow" &&
                    <p style={{margin: 0}}><FontAwesome className={Styles.lastTime} name="heart"  style={{color: 'red'}}/> liked this story.</p>
                  }
                  {
                    item.type != "wow" &&
                    <Twemoji text={ storyTextDecode(item.comment) } />

                  }
                  </div>
      					}
              />
            </List>)
          } )
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
// decodeURIComponent(JSON.parse('"' + item.comment.replace(/\"/g, '\\"') + '"') )
const mapStateToProps = state => {
	return {
		me: (state.comments.me && state.comments.me) || '',
    story: state.comments.story || {},
    comments: state.comments.comments,
    childListeners: state.comments.childListeners || [],
    showVulgar: state.comments.showVulgar || false,
    loading: state.comments.isLoading || false,
	}
}

const mapDispatchToProps = dispatch => {
	return {
    getCacheData: (storyId) => {
      dispatch(getCacheData(storyId))
    },
    getComments: (storyId, authId) => {
      dispatch(getComments(storyId, authId))
    },
    saveComment: (data) => {
      dispatch(saveComment(data))
    },
		addComments: (cmtObj) => {
      dispatch(addComments(cmtObj))
    },

		addChildListener: meetingId => {
			dispatch(addChildListener(meetingId));
		},
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
