"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.useAuth = void 0;
var react_1 = require("react");
var auth_1 = require("firebase/auth");
var firebaseConfig_1 = require("../firebaseConfig");
var AuthContext = (0, react_1.createContext)({ currentUser: null, loading: true });
var useAuth = function () {
    return (0, react_1.useContext)(AuthContext);
};
exports.useAuth = useAuth;
var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(null), currentUser = _b[0], setCurrentUser = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    (0, react_1.useEffect)(function () {
        var unsubscribe = (0, auth_1.onAuthStateChanged)(firebaseConfig_1.auth, function (user) {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    var value = {
        currentUser: currentUser,
        loading: loading,
    };
    return (<AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>);
};
exports.AuthProvider = AuthProvider;
