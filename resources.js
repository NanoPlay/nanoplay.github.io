/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.resources", function(exports) {
    var firebaseConfig = {
        apiKey: "AIzaSyDE0WI96lbx9mUXjN-ohNAWdBljrsB_B1A",
        authDomain: "nanoplay-platform.firebaseapp.com",
        projectId: "nanoplay-platform",
        storageBucket: "nanoplay-platform.appspot.com",
        messagingSenderId: "478037672867",
        appId: "1:478037672867:web:799be2947cbc2dffc31016",
        measurementId: "G-X5YC4X97CZ"
    };

    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    var currentUser = {
        uid: null
    };

    exports.errorCodes = {
        UNKNOWN: 0,
        ACCOUNT_SUSPENDED: 1,
        PRIVATE_TOKEN_CHANGED: 2
    };

    exports.authenticateWithSubnodal = function(public, private) {
        return new Promise(function(resolve, reject) {
            function authenticateFirstTimeUser() {
                firebase.auth().createUserWithEmailAndPassword(public + "@accounts.subnodal.com", private).then(resolve).catch(function(error) {
                    reject({message: error, code: exports.errorCodes.UNKNOWN});
                });
            }

            firebase.auth().signInWithEmailAndPassword(public + "@accounts.subnodal.com", private).then(resolve).catch(function(error) {
                switch (error.code) {
                    case "auth/invalid-email":
                        reject({message: "Public token is malformatted", code: exports.errorCodes.UNKNOWN});
                        break;
                    
                    case "auth/user-disabled":
                        reject({message: "This user account has been suspended", code: exports.errorCodes.ACCOUNT_SUSPENDED});
                        break;
                    
                    case "auth/user-not-found":
                        authenticateFirstTimeUser();
                        break;
                    
                    case "auth/wrong-password":
                        reject({message: "The private token was recently changed", code: exports.errorCodes.PRIVATE_TOKEN_CHANGED});
                        break;
                    
                    default:
                        reject({message: error.message, code: logic.errorCodes.UNKNOWN});
                        break;
                }
            })
        });
    };
});