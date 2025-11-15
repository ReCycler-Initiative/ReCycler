"use client";
import TitleBarService from "@/components/title-bar-service";
import UserSettings from "@/components/user-settings";

export default function Page() {
  return (
    <>
      <TitleBarService />
      <main>
        <UserSettings />
      </main>
    </>
  );
}
