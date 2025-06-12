import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    authMethod: null,
    phoneVerificationId: null,
    isPhoneVerificationStep: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            console.log('Setting user:', action.payload); // Debug log
            state.user = action.payload.user;
            state.authMethod = action.payload.authMethod;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
        clearUser: (state) => {
            console.log('Clearing user'); // Debug log
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.authMethod = null;
            state.phoneVerificationId = null;
            state.isPhoneVerificationStep = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        setPhoneVerificationId: (state, action) => {
            state.phoneVerificationId = action.payload;
            state.isPhoneVerificationStep = true;
            state.loading = false;
        },
        clearPhoneVerification: (state) => {
            state.phoneVerificationId = null;
            state.isPhoneVerificationStep = false;
        }
    }
});

export const {
    setUser,
    clearUser,
    setLoading,
    setError,
    clearError,
    setPhoneVerificationId,
    clearPhoneVerification
} = userSlice.actions;

export default userSlice.reducer;