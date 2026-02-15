import { Bell, Search, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const currentUser = db.getCurrentUser();
  const activities = db.getRecentActivity();
  const unreadCount = activities.length; // For prototype, everything start as unread

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground">{unreadCount} new</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <DropdownMenuItem key={activity.id} className="flex flex-col items-start gap-1 p-3 cursor-default">
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{activity.avatar}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium">
                        {activity.user} <span className="font-normal text-muted-foreground">{activity.action}</span>
                      </p>
                    </div>
                    <p className="text-xs pl-8 font-semibold">{activity.target}</p>
                    <p className="text-[10px] pl-8 text-muted-foreground">{activity.time}</p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">No new notifications</div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.position}</p>
          </div>
          <Avatar>
            {currentUser.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
    </header>
  );
}
