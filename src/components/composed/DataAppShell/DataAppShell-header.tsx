"use client"

import React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DataAppShellHeader({ appIcon, breadcrumbs }: { appIcon?: React.ReactNode; appName?: string; onAppNameClick?: () => void; onHelpClick?: () => void; breadcrumbs?: { label: string; href?: string; onClick?: () => void }[] }) {

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 p-4">
        {/* Header: sidebar trigger, app icon + breadcrumb trail, help */}
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-3 ml-2" />
              {appIcon && <div className="shrink-0">{appIcon}</div>}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((item, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      return (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={item.href}
                                onClick={item.onClick}
                                className="cursor-pointer"
                              >
                                {item.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
      </div>
    </header>
  )
}
