// NextAuth.js API route handler
// This catch-all route handles all NextAuth.js requests:
// - /api/auth/signin (login page)
// - /api/auth/signout (logout)
// - /api/auth/session (get current session)
// - /api/auth/providers (list available providers)
// - etc.

import { handlers } from "@/lib/auth"

// Export GET and POST handlers from NextAuth config
export const { GET, POST } = handlers