import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Supabase 클라이언트 싱글톤.
 * 스키마(docs/PRODUCT_PLAN.md §5) 구성 후 `npm run type-gen`으로 src/database.types.ts를 생성하고
 * `createClient<Database>(...)` 형태로 타입을 연결한다.
 */
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
