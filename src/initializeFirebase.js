export default function initialize() {
    const config = {
        apiKey: FIREBASE_APIKEY,
        authDomain: FIREBASE_AUTHDOMAIN,
        databaseURL: FIREBASE_DATABASE_URL,
        projectId: FIREBASE_PROJECT_ID,
        // storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGING_ID
    };
    try{
        firebase.initializeApp(config);
    }catch(e){}
}
