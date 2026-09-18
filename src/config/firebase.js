    const FIREBASE_CONFIG = {
      apiKey:            "AIzaSyDxRlytnV4RnHksjhErotD9fsLGxg4J5g4",
      authDomain:        "finance-berdua.firebaseapp.com",
      databaseURL:       "https://finance-berdua-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId:         "finance-berdua",
      storageBucket:     "finance-berdua.firebasestorage.app",
      messagingSenderId: "974859670020",
      appId:             "1:974859670020:web:b99a6a204fa8698a43db51",
    };
    firebase.initializeApp(FIREBASE_CONFIG);
    const auth = firebase.auth();
    const db = firebase.database();
