import GradingPolicy from "@/components/settings/grading-policy";
import { GRADING_POLICIES } from "@/lib/mock-data";

/**
 * 설정 페이지.
 * @returns {JSX.Element}
 */
export default function SettingsPage() {
  return <GradingPolicy policies={GRADING_POLICIES} />;
}
