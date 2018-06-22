import axios from 'axios';
import Store from '../reducers/store';

export function showLoader() {
    return {
        type: 'LOADER_FRNDS',
        payload: true
    };
}

export const followUser = (data) => {
  console.log('followUser ');
  Store.dispatch(showLoader());
  return axios({
      method: 'POST',
      url: `${API}followOnComment`,
      data
  })
  .then( response => {
    console.log('in followOnComment action response = ', response);
      return {
          type: 'FOLLOW_USER',
          payload: { data: response, query: data}
      }
  })
  .catch( error => {
    console.log('in followOnComment action error = ', error);
      return {
          type: 'FOLLOW_USER',
          payload: { data: 0, error }
      }
  });
}

export const getCacheData = (storyId) => {
  if(storyId === "") return {
    type: 'BLANK',
  }
  var cacheComments = localStorage.getItem(`PC_PWA_COMMENTS_${storyId}`) != null ? JSON.parse(localStorage.getItem(`PC_PWA_COMMENTS_${storyId}`)) : []
  // var cacheStory = localStorage.getItem('PC_PWA_STORY_ME') != null ? JSON.parse(localStorage.getItem('PC_PWA_STORY_ME')).story : {}
  var cacheStory = localStorage.getItem(`PC_PWA_STORY_${storyId}`) != null ? JSON.parse(localStorage.getItem(`PC_PWA_STORY_${storyId}`)) : {}
  var cacheMe = localStorage.getItem('PC_PWA_STORY_ME') != null ? JSON.parse(localStorage.getItem('PC_PWA_STORY_ME')).me : {}
  console.log('cache data in getCacheData= ', storyId, cacheComments, cacheStory, cacheMe);

  return {
    type: "CACHE_DATA",
    payload: {cacheComments, cacheStory, cacheMe}
  }
}

export const getComments = (storyId, authId) => {
    const startTime = localStorage.getItem(`PC_PWA_START`) || Date.now();
    Store.dispatch(showLoader());
    return axios({
        method: 'GET',
        url: `${API}getComments?authId=${authId}&storyId=${storyId}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then( response => {
      console.log('in getComments action response = ', response);
        return {
            type: 'COMMENTS_LIST',
            payload: response
        }
    })
    .catch( error => {
      console.log('in getComments action error = ', error);
        return {
            type: 'COMMENTS_LIST',
            payload: { data: 0, error }
        }
    });
}

export const saveComment = (data) => {
  console.log("saveComment data= ", data);
    const startTime = localStorage.getItem(`PC_PWA_START`) || Date.now();
    // Store.dispatch(showLoader());
    data["time"] = data.timeStamp
    return axios({
        method: 'POST',
        url: `${API}saveComment`,
        data
    })
    .then( response => {
      console.log('in saveComment action response = ', response.data);

      if(response.data.isVulgar) {
        return {
          type: 'REMOVE_VULGAR_COMMENT',
          payload: {storyId: data.storyId, timeStamp: response.data.timestamp}
        }
      } else {
        return {
          type: 'BLANK',
          payload: response
        }
      }

    })
    .catch( error => {
      console.log('in saveComments action error = ', error);
        return {
            type: 'BLANK',
            payload: { data: 0, error }
        }
    });
}

export const addComments = (comment) => {
  console.log("addComments= ", comment);
    return {
        type: 'ADD_COMMENTS',
        payload: {comment}
    }
}

export const addChildListener = meetingId => {
    return {
        type: 'ADD_CHILD_LISTENER',
        payload: meetingId
    }
}
