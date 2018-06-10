import axios from 'axios';
import Store from '../reducers/store';

export function showLoader() {
    return {
        type: 'LOADER_FRNDS',
        payload: true
    };
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
      console.log('in saveComment action response = ', response);
        return {
            type: 'BLANK',
            payload: response
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
