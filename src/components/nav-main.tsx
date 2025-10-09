"use client"

import { IconMail, type Icon } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onOpenCommandPalette,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  onOpenCommandPalette?: () => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                onClick={item.title === "Buscar" ? onOpenCommandPalette : undefined}
                className={item.title === "Buscar" ? "cursor-pointer" : ""}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.title === "Buscar" && (
                  <span className="text-[0.6rem] text-gray-400 ml-auto">CTRL + SPACE</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
