import { create } from "zustand";

interface PublicInterviewAuthState {
  token: string | null;
  interviewId: string | null;
  contactEmail: string | null;
  isAuthenticated: boolean;

  setAuth: (token: string, interviewId: string, contactEmail: string) => void;
  clearAuth: () => void;
  loadAuthFromSession: (interviewId: string) => void;
}

export const usePublicInterviewAuthStore = create<PublicInterviewAuthState>(
  (set) => ({
    token: null,
    interviewId: null,
    contactEmail: null,
    isAuthenticated: false,

    setAuth: (token: string, interviewId: string, contactEmail: string) => {
      // Store token in sessionStorage
      sessionStorage.setItem(`vantage_interview_token_${interviewId}`, token);

      set({
        token,
        interviewId,
        contactEmail,
        isAuthenticated: true,
      });
    },

    clearAuth: () => {
      const state = usePublicInterviewAuthStore.getState();
      if (state.interviewId) {
        sessionStorage.removeItem(
          `vantage_interview_token_${state.interviewId}`
        );
      }

      set({
        token: null,
        interviewId: null,
        contactEmail: null,
        isAuthenticated: false,
      });
    },

    loadAuthFromSession: (interviewId: string) => {
      const token = sessionStorage.getItem(
        `vantage_interview_token_${interviewId}`
      );

      if (token) {
        set({
          token,
          interviewId,
          contactEmail: null, // We don't store email in sessionStorage
          isAuthenticated: true,
        });
      }
    },
  })
);
