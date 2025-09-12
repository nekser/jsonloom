"use client";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Menu as MenuIcon } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useIsMobile } from "./hooks/useMediaQuery";
import { useOpsStore, State } from "../store/operations";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function Header() {
  const isMobile = useIsMobile();
  const undo = useOpsStore((s: State) => s.undo);
  const redo = useOpsStore((s: State) => s.redo);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-12 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
      <div className="font-semibold mr-auto">JSON Transformation Tool</div>
      {!isMobile ? (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <MenuIcon className="h-5 w-5" />
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => { undo(); setMenuOpen(false); }}>Undo</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { redo(); setMenuOpen(false); }}>Redo</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </header>
  );
}
