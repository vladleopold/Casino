"use client";

import { Suspense, useEffect, useState } from "react";
import { DomInspector } from "./dom-inspector";
import { Header } from "./header";
import { SiteSectionNav } from "./site-section-nav";
import { Sidebar } from "./sidebar";

export function LayoutShell({ 
  children,
  route 
}: { 
  children: React.ReactNode;
  route?: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleOpenMenu = () => setIsSidebarOpen(true);
    window.addEventListener("open-sidebar", handleOpenMenu);
    return () => window.removeEventListener("open-sidebar", handleOpenMenu);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </Suspense>
      <div className="slotcity-layout-shell">
        <Suspense fallback={null}>
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            route={route}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SiteSectionNav route={route} />
        </Suspense>
        <DomInspector />
        {children}
      </div>
    </>
  );
}
