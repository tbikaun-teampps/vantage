// import { useAuthStore } from '@/stores/auth-store';

// declare global {
//   interface Window {
//     Canny: any;
//   }
// }

// export const cannyService = {
//   identify: () => {
//     const { user, profile } = useAuthStore.getState();
    
//     if (user && profile && window.Canny) {
//       console.log('Identifying user with Canny:', user.email);
//       window.Canny('identify', {
//         appID: '686b10727688d7b7990d0281',
//         user: {
//           email: user.email || '',
//           name: profile.full_name || user.email || '',
//           id: user.id,
//           avatarURL: user.user_metadata?.avatar_url || undefined,
//           created: new Date(user.created_at).toISOString(),
//         },
//       });
//     }
//   },

//   logout: () => {
//     if (window.Canny) {
//       window.Canny('logout');
//     }
//   }
// };