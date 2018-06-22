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
import {addComment, getComments, saveComment, addComments, addChildListener, getCacheData, followUser} from "../../actions/comments";
import querystring from 'query-string';
import NoFriends from '../NoFriends';
import Styles from "./style.scss";
import { storyTextDecode, htmlDecode, sortFriendList, formatDate, formatTime } from '../../utility';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// import '../../shared/font-awesome.min.css'

const styles = theme => ({
  button: {
    // margin: theme.spacing.unit,
    padding: 0,
    minWidth: 64,
    fontSize: 0.8125,
    minHeight: 32,
  },
});

class CommentsIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      timeStamp: Date.now(),
      currentMsg: "",
      comments: [],
      story: {},
      loadCheck: [],
      myProfileBaseUrl: "https://stories.neargroup.me/ab/myprofile.html?channelid=",
      otherProfileBaseUrl: "https://stories.neargroup.me/ab/myprofile.html?channelid=",
      authId: ""
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
    this.setState({authId: authId})
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

  followCommentUser(e, followUser) {
    e.preventDefault()
    console.log(this.props.me.channelId , " following-- ",  followUser.id);
    let query = {
      "type": followUser.isfollowing ? "Unfollow" : "Follow",
      "followingChannelId" : this.props.me.channelId,
      "followedChannelId" : followUser.id
    }

    this.props.followUser(query)
  }

  render() {
    console.log("coments in state= ", this.state);
    const AvtarUrl = 'https://img.neargroup.me/project/forcesize/50x50/profile_';
    // onError={this.handleImg.bind(this, friend.channelId)}
    //containerElement={<Link to="/chat" />}
    // {Number(ucc[friend.meetingId]) > 0 && (<Chip style={{float: 'left', fontSize: 15, backgroundColor: '#00E676'}}>{ucc[friend.meetingId]}</Chip>) }
    let {story, comments, showVulgar, myProfileBaseUrl, authId} = this.state
    let {loading, me} = this.props
    // story.storyText = "#DailyRants | Boy - 20 | 19 KM Kung mababasa mo to GUMAMELA mag reply ka pls iba Kasi napindot ko eh- E,Dodong, Hindi ko ma replyan. Eto Yung lumalabas oh \" This user is busy chatting with someone, please try again later.\" I think you hit the\"block\" button lol \uD83D\uDE02. Paano na to?"
    if(Object.keys(story).length > 0) {

      console.log('render story text= ',
      story.storyText)
      console.log("#DailyRants | Boy - 20 | 19 KM Kung mababasa mo to GUMAMELA mag reply ka pls iba Kasi napindot ko eh- E,Dodong, Hindi ko ma replyan. Eto Yung lumalabas oh \" This user is busy chatting with someone, please try again later.\" I think you hit the\"block\" button lol \uD83D\uDE02. Paano na to?"
      );
      console.log(storyTextDecode(story.storyText))
      console.log(story.storyText)
      console.log(story.storyText.replace(/\n/g, 'U+23CE')  )

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
                leftAvatar={<a href={story.creator.id == this.props.me.channelId ? myProfileBaseUrl + me.userAuth : myProfileBaseUrl + story.creator.userAuth + "&channelid2=" + this.state.authId+ "&hYFyh=GVhfhH"}>
                  <Avatar src={story.creator.imageUrl} onError={this.handleImg.bind(this, story.creator.id)} /></a>}

                onClick={() => {console.log("list item click")}}

                primaryText={<b style={{whiteSpace: 'pre-line', color: 'white', fontSize: 20}}>
                      <Twemoji text={htmlDecode(story.creator.name)} />
                        {story.creator.isfollowing != null && (<Button variant="outlined" style={{padding: 2, float: 'right', fontSize: 10}} size="small" color="primary"
                        onClick={e => this.followCommentUser(e, story.creator)} >
                           {story.creator.isfollowing ? "unfollow" : "follow" }
                        </Button>)}
                      </b>}

                secondaryText={
      						<p style={{whiteSpace: 'pre-line', fontSize: 16, height: 'auto'}}><b> {/** <Twemoji text={htmlDecode(story.storyText)} />  <Twemoji text={ **/} {storyTextDecode(story.storyText)} {/** } /> **/} </b></p>
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
                leftAvatar={<a href={item.from.id == me.channelId ? myProfileBaseUrl + me.userAuth : myProfileBaseUrl + item.from.userAuth + "&channelid2=" + this.state.authId+ "&hYFyh=GVhfhH"}>
                    <Avatar src={item.from.imageUrl} onError={this.handleImg.bind(this, item.from.id)} /> </a>}
                onClick={() => {console.log("list item click")}}
                primaryText={<b style={{whiteSpace: 'pre-line', fontSize: 18}}><Twemoji text={htmlDecode(item.from.name)} />
                {item.from.isfollowing != null && (<span style={{padding: 0, margin: 0, color:"#ff5e3a", fontWeight: 'normal', float: 'right', fontSize: 14}}
                onClick={e => this.followCommentUser(e, item.from)} > {item.from.isfollowing ? "unfollow" : "follow" }
                </span>)}
                </b>}

                secondaryText={
      						<div style={{whiteSpace: 'normal', height: 'auto', margin: "0px !important"}}>
                  {
                    item.type == "wow" &&
                    <p style={{whiteSpace: 'pre-line', margin: 0}}><FontAwesome className={Styles.lastTime} name="heart"  style={{color: 'red'}}/> liked this story.</p>
                  }
                  {
                    item.type != "wow" &&
                    <p style={{whiteSpace: 'pre-line', margin: 0}}><Twemoji text={ storyTextDecode(item.comment) } /></p>

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
  					<ActionSend color={'#ff1fac'} /> {/** cyan500 **/}
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
    followUser: query => {
      dispatch(followUser(query))
    }
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CommentsIndex))

// rightIcon={
//   (<div style={{float: 'right', top: 0}}>
//   <Button variant="outlined" size="small" color="primary" className={this.props.classes.button}
//         onClick={e => this.followCommentUser(story.creator.id)} >
//     follow
//   </Button>
//   {/**
//     <button name="follow" onClick={e => this.followCommentUser(story.creator.id)} />
//   <p className={Styles.lastTime}>
//        Number(item.likes) > 0 && <span>{item.likes}</span>
//   </p>
//   **/}
//   </div>)
// }
