"use client";

import { Search, Menu } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { GlobalSearch } from "../search/GlobalSearch";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
  };
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-50 shrink-0">
      {/* Left: Mobile menu + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[#52525b] hover:text-[#fafafa] hover:bg-[#141416] transition-colors border border-transparent hover:border-[#27272a]"
          aria-label="Otwórz menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Right: Search + notifications + user */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Global search — visible on md+ */}
        <div className="hidden md:block w-64">
          <GlobalSearch />
        </div>

        {/* Mobile search icon */}
        <button className="md:hidden p-2.5 rounded-xl text-[#52525b] hover:text-[#fafafa] hover:bg-[#141416] transition-colors border border-transparent hover:border-[#27272a]">
          <Search className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[#27272a]" />

        <NotificationsDropdown />

        <div className="h-5 w-px bg-[#27272a]" />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
