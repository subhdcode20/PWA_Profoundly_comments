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

		case 'CACHE_DATA':
			console.log('CACHE_DATA = ',action.payload);
			return {
				...state,
				comments: action.payload.cacheComments,
				story: action.payload.cacheStory,
				me: action.payload.cacheMe
			}

		case 'COMMENTS_LIST':
			console.log("COMMENTS_LIST - ", action.payload);
			let isError = true;
			let isLoading = true;
			let comments
			let {me} = state
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
							"isfollowing" : comment.from.commentingChannelId != me.channelId ? comment.from.isfollowing : null,
							"userAuth" : comment.from.userAuth
						}
						console.log("get data isfollowing comment: ", comment.from, me.channelId, newComment.from.isfollowing);
						// if(comment.from.id != me.channelId) {
						// 	newComment.from["isfollowing"] = comment.from.isfollowing
						// }
						newComment["type"] = comment.type
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
						"imageUrl": action.payload.data.story.creator.creatorPic,
						"isfollowing" : action.payload.data.story.creator.creatorChannelId != me.channelId ? action.payload.data.story.creator.isfollowing : null,
						"userAuth" : action.payload.data.story.creator.userAuth
					}
					console.log("get data isfollowing story: ", action.payload.data.story.creator, me.channelId, story.creator.isfollowing);
					story["wowCount"] = action.payload.data.story.wowCount
					story["storyTime"] = action.payload.data.story.storyTime
				}
				me = {};
				if(action.payload.data.currentUser) {
					me.channelId = action.payload.data.currentUser.currentUserChannelId
					me.imageUrl = action.payload.data.currentUser.currentUserPic
					me.name = action.payload.data.currentUser.currentUserName
					me.userAuth = action.payload.data.currentUser.currentUserAuth
				}

				console.log("api to pwa data= ", comments, story, me);

				localStorage.setItem('PC_PWA_STORY_ME', JSON.stringify({story, comments, me}) );
				localStorage.setItem(`PC_PWA_COMMENTS_${action.payload.data.story.storyId}`, JSON.stringify(comments))
				localStorage.setItem(`PC_PWA_STORY_${action.payload.data.story.storyId}`, JSON.stringify(story))

			}
			isLoading = false;
			console.log("loader remove = ", isLoading);
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
		case 'ADD_CHILD_LISTENER':
			console.log("ADD_CHILD_LISTENER - ", action.payload);
			const childListeners = state.childListeners ? [...state.childListeners] : [];
			if(!childListeners.includes(action.payload)) childListeners.push(action.payload);
			return { ...state, childListeners }
			break;
		case 'REMOVE_VULGAR_COMMENT':
			console.log("REMOVE_VULGAR_COMMENT - ", action.payload);
			let vulgarCmntTime = action.payload.timeStamp
		  let storyId = action.payload.storyId
			let prevcomments = state.comments;
			console.log("original prevcomments= ", prevcomments);
			let filterComments = prevcomments.filter(item => item.timeStamp != vulgarCmntTime)
			console.log("filter coments= ", filterComments);
			localStorage.setItem(`PC_PWA_COMMENTS_${storyId}`, filterComments)
			return {...state, comments: filterComments, showVulgar: true}

			break;

		case 'FOLLOW_USER':
				console.log("FOLLOW_USER - ", action.payload, state);
				let store = state
				let newComments = [], newStory = {}
				// let isError = true;
				isLoading = true;
				let query = action.payload.query
				// let newComments = []
				// let comments
				// let story
				if(
					action.payload &&
					action.payload.data.status &&
					action.payload.data &&
					action.payload.data.status >= 200 && action.payload.data.status < 300
				) {
					console.log('FOLLOW_USER ok store= ', store);

					let {comments, story, me} = store
					newStory= story
					newComments = comments
					console.log('newComments initial= ', newComments);
					newComments.forEach(comnt => {
						if(comnt.from.id == query.followedChannelId && query.followedChannelId != me.channelId) {
							console.log("found commenter -- ", query);
							if(query.type === 'Unfollow') comnt.from.isfollowing =  false;
							else if(query.type === 'Follow') comnt.from.isfollowing =  true;
						}
					})
					console.log('story initial= ', newStory);
					if(newStory.creator.id == query.followedChannelId && newStory.creator.id != me.channelId) {
						if(query.type === 'Unfollow') newStory.creator.isfollowing =  false;
						else if(query.type === 'Follow') newStory.creator.isfollowing =  true;
					}
					console.log('newStory after= ', newStory);
					console.log('newComments after= ', newComments);

					// isError = false;
					// comments = [];
					// if( action.payload.data.comments && action.payload.data.comments.length > 0) {
					// 	let apiComments = action.payload.data.comments
					// 	let newComment = {}
					// 	apiComments.forEach(comment => {
					// 		newComment["comment"] = comment.comment
					// 		newComment["timeStamp"] = comment.time
					// 		newComment["from"] = {
					// 			"imageUrl": comment.from.commenterPic,
					// 			"id": comment.from.commentingChannelId,
					// 			"name": comment.from.commenterUserName,
					// 		}
					// 		newComment["type"] = comment.type
					// 		comments.push(newComment)
					// 		newComment = {}
					// 	})
					//
					// }
					// story = {}
					// if( action.payload.data.story) {
					// 	story["storyText"] = action.payload.data.story.story
					// 	story["storyId"] = action.payload.data.story.storyId
					// 	story["creator"] = {
					// 		"name": action.payload.data.story.creator.creatorName,
					// 		"id": action.payload.data.story.creator.creatorChannelId,
					// 		"imageUrl": action.payload.data.story.creator.creatorPic
					// 	}
					// 	story["wowCount"] = action.payload.data.story.wowCount
					// 	story["storyTime"] = action.payload.data.story.storyTime
					// }
					// me = {};
					// if(action.payload.data.currentUser) {
					// 	me.channelId = action.payload.data.currentUser.currentUserChannelId
					// 	me.imageUrl = action.payload.data.currentUser.currentUserPic
					// 	me.name = action.payload.data.currentUser.currentUserName
					// }

					// console.log("api to pwa data= ", comments, story, me);

					// localStorage.setItem('PC_PWA_STORY_ME', JSON.stringify({story, comments, me}) );
					// localStorage.setItem(`PC_PWA_COMMENTS_${action.payload.data.story.storyId}`, JSON.stringify(comments))
					// localStorage.setItem(`PC_PWA_STORY_${action.payload.data.story.storyId}`, JSON.stringify(story))

				}
				isLoading = false;
				// console.log("loader remove = ", isLoading);
				// return { ...state, story, comments, me, isLoading, timestamp: Date.now(), noReload: true } //unreadChatCounts
				return { ...state, comments: newComments, story: newStory, isLoading}
				break;

		case "BLANK":
			return	{...state}
			break;

		default: return state
    }

}
