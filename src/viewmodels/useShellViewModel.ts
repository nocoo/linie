import { useState } from "react";

export function useShellViewModel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("atlas");

  return {
    sidebarOpen,
    chatOpen,
    activeSection,
    setSidebarOpen,
    setChatOpen,
    setActiveSection,
  };
}

export type ShellViewModel = ReturnType<typeof useShellViewModel>;
