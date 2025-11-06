"use client";
import TitleBarStartpage from "@/components/title-bar-startpage";
import UserSettings from "@/components/user-settings";

export default function Page() {
  return (
    <>
      <TitleBarStartpage />
      <main>
        <UserSettings />
      </main>
    </>
  );
}