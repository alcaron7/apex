import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useCan } from '@/hooks/use-permissions';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const can = useCan;

  const filteredItems = items
    .filter(item => !item.permission || can(item.permission))
    .map(item => {
      const children = item.children?.filter(
        child => !child.permission || can(child.permission)
      ) || [];

      return {
        ...item,
        children,
      };
    })
    .filter(
      item =>
        !item.children ||
        item.children.length > 0 ||
        (!item.permission || can(item.permission))
    );

  const toggleOpen = (title: string) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarMenu>
        {filteredItems.map(item => {
          const isActive = item.href === page.url;
          const isOpen = openItems[item.title];

          if (item.children?.length) {
            return (
              <div key={item.title}>
                <SidebarMenuItem>
                  <button
                    onClick={() => toggleOpen(item.title)}
                    className={`flex items-center w-full gap-2 px-3 py-2 text-sm font-medium rounded-md transition hover:bg-muted/30 ${
                      isActive ? 'bg-muted' : ''
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                </SidebarMenuItem>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  {item.children.map(child => (
                    <SidebarMenuItem key={child.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={child.href === page.url}
                        tooltip={{ children: child.title }}
                      >
                        <Link
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-2 pl-9 text-sm rounded-md"
                          prefetch
                        >
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.title }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md"
                  prefetch
                >
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

