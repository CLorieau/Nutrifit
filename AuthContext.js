// AuthContext.js
import { createContext } from "react";

const AuthContext = createContext({
    token: null,
    user: null,
    setUser: () => {},
    signIn: async () => {},
    signOut: async () => {},
    loadingAuth: false,
});

export default AuthContext;
