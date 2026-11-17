import { isMenuGroup } from "@/lib/menu";
import { useMenuEntries } from "@/hooks/use-menu-entries";
import NavGroup from "./nav-group";
import NavItem from "./nav-item";

/**
 * 현재 모드(선생님/학생)에 맞는 사이드바 메뉴 목록.
 * @returns {JSX.Element}
 */
export default function SidebarNav() {
  const entries = useMenuEntries();

  return (
    <nav className="mt-12 grid gap-1.5">
      {entries.map((entry) =>
        isMenuGroup(entry) ? (
          <NavGroup key={entry.label} group={entry} />
        ) : (
          <NavItem key={entry.to} item={entry} />
        ),
      )}
    </nav>
  );
}
