"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, MessageSquare, Settings, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notification {
  id: string
  type: "message" | "system" | "update"
  title: string
  description: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface ChatNotificationDropdownProps {
  notifications: Notification[]
  onMarkAsReadAction: (notificationId: string) => void
  onMarkAllAsReadAction: () => void
}

export default function ChatNotificationDropdown({
  notifications,
  onMarkAsReadAction,
  onMarkAllAsReadAction,
}: ChatNotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4" />
      case "system":
        return <Settings className="w-4 h-4" />
      case "update":
        return <User className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return "text-blue-500"
      case "system":
        return "text-yellow-500"
      case "update":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsReadAction} className="text-xs">
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 cursor-pointer space-y-1 ${!notification.read ? "bg-accent/50" : ""}`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsReadAction(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${getTypeColor(notification.type)}`}>{getIcon(notification.type)}</div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
