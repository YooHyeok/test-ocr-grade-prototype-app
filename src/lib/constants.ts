/** TanStack Query 캐시 키 */
export const QUERY_KEYS = {
  profile: {
    all: ["profile"],
    byId: (userId: string) => ["profile", "byId", userId],
  },
};
