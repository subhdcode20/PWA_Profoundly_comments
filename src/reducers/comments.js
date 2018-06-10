export default function ng(state = [], action) {

	const tempState = { ...state };
	let comments = [];
	let me={
		channelId:"1799237930126421",
		imageUrl:"https://img.neargroup.me/project/50x50/profile_1799237930126421",
		name:"Subham Dey"
	} ;
	let lastChats = {};
	let botChats = {};
	let unreadChatCounts = {};

	switch(action.type) {
		case 'LOADER_FRNDS':
			return { ...state, isLoading: true }
			break;
		case 'COMMENTS_LIST':
			console.log("COMMENTS_LIST - ", action.payload);
			let isError = true;
			let isLoading = true;
			let newComments = []
			let comments
			let story
			if(
				action.payload &&
				action.payload.status &&
				action.payload.data &&
				action.payload.status >= 200 && action.payload.status < 300
			) {
				console.log('COMMENTS_LIST ok');
				isError = false;
				comments = [];
				if( action.payload.data.comments && action.payload.data.comments.length > 0) {
					let apiComments = action.payload.data.comments
					let newComment = {}
					apiComments.forEach(comment => {
						newComment["comment"] = comment.comment
						newComment["timeStamp"] = comment.time
						newComment["from"] = {
							"imageUrl": comment.from.commenterPic,
							"id": comment.from.commentingChannelId,
							"name": comment.from.commenterUserName,
						}
						newComment["type"] = comment.from.type
						comments.push(newComment)
						newComment = {}
					})

				}
				story = {}
				if( action.payload.data.story) {
					story["storyText"] = action.payload.data.story.story
					story["storyId"] = action.payload.data.story.storyId
					story["creator"] = {
						"name": action.payload.data.story.creator.creatorName,
						"id": action.payload.data.story.creator.creatorChannelId,
						"imageUrl": action.payload.data.story.creator.creatorPic
					}
					story["wowCount"] = action.payload.data.story.wowCount
					story["storyTime"] = action.payload.data.story.storyTime
				}
				me = {};
				if(action.payload.data.currentUser) {
					me.channelId = action.payload.data.currentUser.currentUserChannelId
					me.imageUrl = action.payload.data.currentUser.currentUserPic
					me.name = action.payload.data.currentUser.currentUserName
				}

				console.log("api to pwa data= ", comments, story, me);
				// const goMemories = action.payload.data.goMemories;
				// const goChats = action.payload.data.goChats;
				// const notifyAgain = action.payload.data.notifyAgain;
				// const genericKeys = action.payload.data.keys || [];
				// try {
				// 	if (notifyAgain && notifyAgain === 'plzRestoreNotification') {
				// 		localStorage.removeItem('NG_PWA_NOTIFICATION');
				// 		window.location.reload();
				// 	}
				// 	if (goMemories && goMemories === 'letTheMemoriesGo') {
				// 		localStorage.clear();
				// 		window.location.reload();
				// 	}
				// 	if (genericKeys && genericKeys.length !== 0) {
				// 		genericKeys.forEach(x => localStorage.removeItem(x));
				// 		window.location.reload();
				// 	}
				// 	if (goChats && goChats === 'letTheChatsGo') {
				// 		for (let i in localStorage) {
				// 			if (localStorage.hasOwnProperty(i)) {
				// 				if (i.indexOf('NG_PWA_CHAT_') > -1) localStorage.removeItem(i);
				// 			}
				// 		}
				// 		window.location.reload();
				// 	}
        //
				// }catch(e){}

				// newFriends = friends
				// let friendsCache = localStorage.getItem('NG_PWA_friendsList')
				// console.log("friendsCache= ", friendsCache, friends);
				// if(friendsCache != null && friendsCache != undefined && friendsCache != []
				// 	&& friends != undefined && friends != null && friends.length > 0) {
				// 	friendsCache = JSON.parse(friendsCache)
				// 	console.log("friendsCache ok ");
				// 	newFriends = friends.map(friend => {
				// 		console.log("friend= ", friend);
				// 		let foundInCache = false
				// 		friendsCache.friends.forEach(item => {
				// 			if(friend.meetingId == item.meetingId) {
				// 				foundInCache = true
				// 			}
				// 		})
				// 		console.log("foundInCache= ", foundInCache);
				// 		if(foundInCache != true) {
				// 			return {...friend, newfriend: true}
				// 		} else {
				// 			return friend
				// 		}
				// 	})
				// }
				// console.log("newFriends= ", newFriends);
				// let unreadChatCounts
				// if(localStorage.getItem('NG_PWA_UNREAD_COUNTS') == null || localStorage.getItem('NG_PWA_UNREAD_COUNTS') == undefined ) {
				// 	console.log("NG_PWA_UNREAD_COUNTS not in localStorage= ", localStorage.getItem('NG_PWA_UNREAD_COUNTS'));
				// 	let friendsUnread = {}
				// 	friends.forEach(item => {
				// 		friendsUnread[item.meetingId] = 0
				// 	})
				// 	console.log('NG_PWA_UNREAD_COUNTS new in localStorage= ', friendsUnread);
				// 	localStorage.setItem('NG_PWA_UNREAD_COUNTS', JSON.stringify(friendsUnread))
				// 	unreadChatCounts = friendsUnread
				// } else {
				// 	unreadChatCounts = JSON.parse(localStorage.getItem('NG_PWA_UNREAD_COUNTS'))
				// 	console.log("unreadChatCounts in  localstorage= ", unreadChatCounts);
				// }
				// console.log("final new friend= ", newFriends);

				// if(comments && comments.length > 0)
				localStorage.setItem('PC_PWA_STORY_ME', JSON.stringify({story, comments, me}) );
				isLoading = false;
			}
			console.log("unreadChatCounts in FRIENDS_LIST= ", unreadChatCounts);
			return { ...state, story, comments, me, isLoading, timestamp: Date.now(), noReload: true } //unreadChatCounts
			break;

		case 'ADD_COMMENTS':
			console.log("ADD_COMMENTS : ", action.payload, state, state.comments);
			const myComment = action.payload.comment
			// const currentStoryId = action.payload.storyId
			// const from = action.payload.from
			// const timeStamp = action.payload.timeStamp

			const allComments = state.comments || []
			console.log('allComments in ADD_COMMENTS= ', allComments);
			// const myStory = allStories[currentStoryId] ? [ ...allStories[currentStoryId] ] : []
			allComments.push(myComment)
			// allStories[currentStoryId] = myStory
			return {...state, comments: allComments}


			// const myMeetingId = action.payload.meetingId;
			// const myMsg = action.payload.msg;
			// const allChats = { ...tempState.chats };
			// const myChats = allChats[myMeetingId] ? [ ...allChats[myMeetingId] ] : [];
			// myChats.push(myMsg);
			// allChats[myMeetingId] = myChats;
			// return { ...tempState, chats: allChats };
			break;
		case "BLANK":
			return	{...state}
			break;

		default: return state
    }

}
