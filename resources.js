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
        databaseURL: "https://nanoplay-platform-default-rtdb.europe-west1.firebasedatabase.app",
        storageBucket: "nanoplay-platform.appspot.com",
        messagingSenderId: "478037672867",
        appId: "1:478037672867:web:799be2947cbc2dffc31016",
        measurementId: "G-X5YC4X97CZ",
    };

    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    var currentUser = {
        uid: null,
        username: null
    };

    var userChangeListeners = [];

    exports.errorCodes = {
        UNKNOWN: 0,
        ACCOUNT_SUSPENDED: 1,
        PRIVATE_TOKEN_CHANGED: 2,
        UNABLE_TO_SET: 3
    };

    exports.userSettings = {
        USERNAME: "users/{uid}/username"
    };

    function triggerUserChangeListeners(isSignedIn, isNewUser) {
        for (var i = 0; i < userChangeListeners.length; i++){
            userChangeListeners[i](isSignedIn, isNewUser);
        }
    }

    exports.authenticateWithSubnodal = function(public, private) {
        return new Promise(function(resolve, reject) {
            function authenticateFirstTimeUser() {
                firebase.auth().createUserWithEmailAndPassword(public + "@accounts.subnodal.com", private).then(function() {
                    resolve(true);
                }).catch(function(error) {
                    reject({message: error, code: exports.errorCodes.UNKNOWN});
                });
            }

            firebase.auth().signInWithEmailAndPassword(public + "@accounts.subnodal.com", private).then(function() {
                resolve(false);
            }).catch(function(error) {
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
                        reject({message: error.message, code: exports.errorCodes.UNKNOWN});
                        break;
                }
            })
        });
    };

    exports.applyUserSetting = function(setting, value) {
        return new Promise(function(resolve, reject) {
            firebase.database().ref(setting.replace(/{uid}/g, currentUser.uid)).set(value).then(resolve).catch(function(error) {
                reject({message: error.message, code: exports.errorCodes.UNABLE_TO_SET})
            });
        });
    };

    exports.getCurrentUser = function() {
        return currentUser;
    };

    exports.registerUserChangeListener = function(callback) {
        userChangeListeners.push(callback);
    };

    exports.syncAppToCloud = function(code, manifest) {
        if (typeof(manifest.id) != "string" || manifest.id.trim() == "") {
            throw new Error("Manifest has no app ID");
        }

        return firebase.database().ref("users/" + currentUser.uid + "/apps/" + manifest.id).set({
            code: code,
            manifest: manifest
        });
    };

    exports.getAppFromCloud = function(id) {
        if (typeof(id) != "string" || id.trim() == "") {
            throw new Error("Manifest has no app ID");
        }

        return new Promise(function(resolve, reject) {
            firebase.database().ref("users/" + currentUser.uid + "/apps/" + id).once("value", function(snapshot) {
                if (snapshot.val() == null) {
                    reject("No app with the specified app ID could not be found");

                    return;
                }

                resolve(snapshot.val());
            }).catch(function(error) {
                reject(error);
            });
        });
    };

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser.uid = user.uid;

            firebase.database().ref("users/" + currentUser.uid + "/username").on("value", function(snapshot) {
                currentUser.username = snapshot.val();

                triggerUserChangeListeners(true, currentUser.username == null);
            });
        } else {
            currentUser.uid = null;
            currentUser.username = null;

            triggerUserChangeListeners(false, false);
        }
    });
});