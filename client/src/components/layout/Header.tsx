import { Bell, Search, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees, documents, reports..."
            className="w-full bg-secondary pl-9 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        </Button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">Sarah Jenkins</p>
            <p className="text-xs text-muted-foreground">General Manager</p>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
