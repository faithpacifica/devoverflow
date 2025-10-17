import { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";
import RightSidebar from "@/components/navigation/RightSidebar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <Navbar />
      <div className="flex">
        <LeftSidebar />

        <section className="flex-1">{children}</section>

        <RightSidebar />
      </div>
    </main>
  );
};

export default RootLayout;
