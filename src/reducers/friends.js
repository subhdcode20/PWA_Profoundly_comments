export default function ng(state = [], action) {

	const tempState = { ...state };
	let friends;
	let me;
	let lastChats = {};
	let botChats = {};

	switch(action.type) {
		case 'LOADER_FRNDS':
			return { ...tempState, isLoading: true }
			break;
		case 'FRIENDS_LIST':
			let isError = true;
			let isLoading = true;
			if(
				action.payload &&
				action.payload.status &&
				action.payload.data &&
				action.payload.status >= 200 && action.payload.status < 300
			) {
				isError = false;
				friends = action.payload.data.friends;
				me = action.payload.data.me;

				if(friends && friends.length > 0) localStorage.setItem('NG_PWA_friendsList', JSON.stringify(action.payload.data) );
				isLoading = false;
			}

			return { ...tempState, friends, me, isLoading, timestamp: Date.now(), lastChats, noReload: true }
			break;

		case 'SENT':
			return { ...tempState }
			break;

		case 'LAST_MSG':
			lastChats = { ...tempState.lastChats };
			lastChats[action.payload.id] = action.payload.msg;
			localStorage.setItem('NG_PWA_LAST_MSG', JSON.stringify(lastChats));
			return { ...tempState, lastChats }
			break;

		case 'FRIENDS_LIST_CACHE':
			try {
				const fromCache = localStorage.getItem('NG_PWA_friendsList');
				const data = JSON.parse(fromCache);
				me = data.me;
				friends = data.friends;
				lastChats = JSON.parse(localStorage.getItem('NG_PWA_LAST_MSG'));
				botChats = JSON.parse(localStorage.getItem('NG_PWA_BOT_CHATS'));
			}catch(e){}

			return { ...tempState, friends, me, lastChats, botChats, isLoading: false }
			break;

		case 'SET_MEETING':
			const friendData = [ ...tempState.friends ];
			const meetingId = action.payload;
			const meetingData = friendData.find(friend => friend.meetingId == meetingId);
			return { ...tempState, meetingData }
			break;

		case 'BOT_CHAT':
			if(
				action.payload &&
				action.payload.status &&
				action.payload.data &&
				typeof action.payload.data === 'object' &&
				action.payload.status >= 200 && action.payload.status < 300
			) {
				const newChats = action.payload.data;
				const cacheBotChats = JSON.parse(localStorage.getItem('NG_PWA_BOT_CHATS')) || {};
				botChats = Object.assign(cacheBotChats, newChats);
				localStorage.setItem('NG_PWA_BOT_CHATS', JSON.stringify(botChats) );
			}
			return { ...tempState, botChats}

			break;

		default:
			return tempState;
	}
}
