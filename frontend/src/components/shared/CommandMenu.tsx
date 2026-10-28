import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Home,
  PlusCircle,
  Users,
  ScrollText,
  FolderOpen,
  Moon,
  Sun,
  Search,
  LogOut,
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
import { useTheme } from "next-themes";
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
    const list: CommandItem[] = [
      {
        id: "nav-home",
        title: "Home & Dashboard",
        category: "Navigation",
        icon: Home,
        perform: () => navigate("/home"),
      },
      {
        id: "nav-my-requests",
        title: "My Requests",
        category: "Navigation",
        icon: FileText,
        perform: () => navigate("/requests/my"),
      },
      {
        id: "nav-new-request",
        title: "Request a Document",
        category: "Navigation",
        icon: PlusCircle,
        shortcut: "N",
        perform: () => navigate("/requests/new"),
      },
      {
        id: "nav-documents",
        title: "Document Types Catalog",
        category: "Navigation",
        icon: FolderOpen,
        perform: () => navigate("/documents"),
      },
    ];

    if (user?.role === "admin" || user?.role === "staff") {
      list.push({
        id: "nav-assigned-requests",
        title: "Assigned Requests Workspace",
        category: "Navigation",
        icon: FileText,
        perform: () => navigate("/requests/assigned"),
      });
      list.push({
        id: "nav-all-requests",
        title: "All Requests Registry",
        category: "Navigation",
        icon: ScrollText,
        perform: () => navigate("/requests/all"),
      });
    }

    if (user?.role === "admin") {
      list.push({
        id: "nav-accounts",
        title: "Accounts Directory",
        category: "Navigation",
        icon: Users,
        perform: () => navigate("/accounts"),
      });
      list.push({
        id: "nav-logs",
        title: "System Logs & Audit",
        category: "Navigation",
        icon: ScrollText,
        perform: () => navigate("/logs"),
      });
    }

    // Actions
    list.push({
      id: "action-toggle-theme",
      title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      category: "Actions",
      icon: theme === "dark" ? Sun : Moon,
      shortcut: "T",
      perform: () => setTheme(theme === "dark" ? "light" : "dark"),
    });

    list.push({
      id: "action-logout",
      title: "Sign Out",
      category: "Actions",
      icon: LogOut,
      perform: () => void logout(),
    });

    return list;
  }, [user?.role, theme, setTheme, navigate, logout]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const term = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term),
    );
  }, [items, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    setQuery("");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden shadow-2xl rounded-2xl border bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Menu</DialogTitle>
        </DialogHeader>

        <div className="flex items-center border-b px-3.5 py-2.5 gap-2.5">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            placeholder="Type a command or search page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 border-none shadow-none text-sm focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
          />
          <Kbd className="h-5 px-1.5 font-mono text-[10px]">
            {isMac ? "⌘K" : "Ctrl+K"}
          </Kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              No matching commands or pages found.
            </p>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted/70",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[10px] tracking-wider uppercase font-semibold",
                        isSelected
                          ? "text-primary-foreground/75"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <Kbd
                        className={cn(
                          "h-4 min-w-4 px-1 text-[10px] font-mono",
                          isSelected && "bg-primary-foreground/20 text-primary-foreground",
                        )}
                      >
                        {item.shortcut}
                      </Kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <Kbd className="h-4 px-1 text-[10px]">↑</Kbd>
            <Kbd className="h-4 px-1 text-[10px]">↓</Kbd>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Select:</span>
              <Kbd className="h-4 px-1 text-[10px]">↵</Kbd>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Close:</span>
              <Kbd className="h-4 px-1 text-[10px]">esc</Kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandMenu;
