import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Bell,
  Building2,
  ClipboardList,
  FileInputIcon,
  FolderCog,
  Home,
  LayoutDashboard,
  LogOut,
  Logs,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Sun,
  UserCog,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { useAuth } from "@/hooks/useAuth";
import {
  canAccessAccounts,
  getStaffWorkspaceLink,
  REQUESTER_ROLES,
  STAFF_ROLES,
} from "@/lib/navigation/role-access";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions";
  icon: React.ElementType;
  shortcut?: string;
  perform: () => void;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-menu", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-menu", handleCustomOpen);
    };
  }, []);

  const items: CommandItem[] = useMemo(() => {
    if (!user) return [];

    const list: CommandItem[] = [];

    if (REQUESTER_ROLES.includes(user.role)) {
      list.push(
        {
          id: "nav-home",
          title: "Home",
          category: "Navigation",
          icon: Home,
          shortcut: "H",
          perform: () => navigate("/home"),
        },
        {
          id: "nav-my-requests",
          title: "My Requests",
          category: "Navigation",
          icon: FileInputIcon,
          shortcut: "M",
          perform: () => navigate("/my-request"),
        },
        {
          id: "nav-new-request",
          title: "Request a Document",
          category: "Navigation",
          icon: PlusCircle,
          shortcut: "N",
          perform: () => navigate("/new-request"),
        },
      );
    }

    if (STAFF_ROLES.includes(user.role)) {
      list.push(
        {
          id: "nav-dashboard",
          title: "Overview Dashboard",
          category: "Navigation",
          icon: LayoutDashboard,
          shortcut: "D",
          perform: () => navigate("/dashboard"),
        },
        {
          id: "nav-assigned-requests",
          title: "Assigned Requests Workspace",
          category: "Navigation",
          icon: ClipboardList,
          perform: () => navigate("/assigned-request"),
        },
        {
          id: "nav-all-requests",
          title: "All Requests Registry",
          category: "Navigation",
          icon: Archive,
          perform: () => navigate("/all-request"),
        },
      );

      const workspaceLink = getStaffWorkspaceLink(user);
      if (workspaceLink) {
        list.push({
          id: "nav-sectors",
          title: workspaceLink.title,
          category: "Navigation",
          icon: Building2,
          perform: () => navigate(workspaceLink.url),
        });
      }

      list.push({
        id: "nav-document-manager",
        title: "Document Manager & Catalog",
        category: "Navigation",
        icon: FolderCog,
        perform: () => navigate("/document-manager"),
      });
    }

    if (canAccessAccounts(user)) {
      list.push({
        id: "nav-accounts",
        title: "Accounts Directory",
        category: "Navigation",
        icon: UserCog,
        perform: () => navigate("/accounts"),
      });
    }

    if (user.role === "admin") {
      list.push({
        id: "nav-logs",
        title: "System Logs & Audit Trail",
        category: "Navigation",
        icon: Logs,
        perform: () => navigate("/logs"),
      });
    }

    list.push({
      id: "nav-notifications",
      title: "Notifications",
      category: "Navigation",
      icon: Bell,
      perform: () => navigate("/notifications"),
    });

    // Actions
    list.push({
      id: "action-settings",
      title:
        user?.role === "admin"
          ? "Configure System & Term Settings"
          : "Account Settings & Profile",
      category: "Actions",
      icon: Settings,
      shortcut: "S",
      perform: () => window.dispatchEvent(new CustomEvent("open-settings")),
    });

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    list.push({
      id: "action-toggle-theme",
      title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
      category: "Actions",
      icon: isDark ? Sun : Moon,
      shortcut: "T",
      perform: () => setTheme(isDark ? "light" : "dark"),
    });

    list.push({
      id: "action-logout",
      title: "Sign Out",
      category: "Actions",
      icon: LogOut,
      perform: () => void logout(),
    });

    return list;
  }, [user, theme, setTheme, navigate, logout]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const term = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term),
    );
  }, [items, query]);

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setSelectedIndex(0);
  };

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    updateQuery("");
    item.perform();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) handleSelect(current);
    }
  };

  const categories = ["Navigation", "Actions"] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-2rem)] sm:max-w-xl p-0 overflow-hidden shadow-2xl rounded-2xl border bg-card ring-1 ring-border/50 outline-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Jump Command Menu</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center border-b px-3.5 py-3 gap-3">
          <Search className="size-4.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <Input
            autoFocus
            placeholder="Type a command or jump to page..."
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              type="button"
              onClick={() => updateQuery("")}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <Kbd className="h-5 px-1.5 font-mono text-[10px] shrink-0">
              {isMac ? "⌘K" : "Ctrl+K"}
            </Kbd>
          )}
        </div>

        {/* Results List Grouped with Spacing */}
        <div className="max-h-[min(380px,55vh)] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="size-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">
                No matching results found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                No commands or pages matching &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const groupItems = filteredItems.filter(
                  (item) => item.category === cat,
                );
                if (groupItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="px-3 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      {cat}
                    </div>
                    <div className="space-y-0.5">
                      {groupItems.map((item) => {
                        const globalIndex = filteredItems.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                              isSelected
                                ? "bg-primary/10 text-primary font-medium shadow-2xs"
                                : "text-foreground hover:bg-muted/60",
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                                  isSelected
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "bg-muted/70 text-muted-foreground",
                                )}
                              >
                                <Icon className="size-3.5" aria-hidden="true" />
                              </span>
                              <span className="truncate">{item.title}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.shortcut && (
                                <Kbd
                                  className={cn(
                                    "h-4.5 min-w-4.5 px-1 font-mono text-[10px]",
                                    isSelected
                                      ? "border-primary/20 bg-background text-primary"
                                      : "bg-muted/50 text-muted-foreground",
                                  )}
                                >
                                  {item.shortcut}
                                </Kbd>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between border-t bg-muted/30 px-3.5 py-2 text-[11px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1.5">
            <span>Navigate</span>
            <Kbd className="h-4 px-1 text-[10px]">↑</Kbd>
            <Kbd className="h-4 px-1 text-[10px]">↓</Kbd>
            <span className="mx-1 text-border">|</span>
            <span>Select</span>
            <Kbd className="h-4 px-1 text-[10px]">↵</Kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Close</span>
            <Kbd className="h-4 px-1 text-[10px]">Esc</Kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandMenu;
