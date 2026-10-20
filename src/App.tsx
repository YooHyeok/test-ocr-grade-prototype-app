import RootRoute from "@/root-route";

/**
 * 애플리케이션 루트 컴포넌트.
 * 전역 Provider(세션, 모달 등)는 이 위치에서 RootRoute를 감싸도록 추가한다.
 * @returns {JSX.Element}
 */
export default function App() {
  return <RootRoute />;
}
