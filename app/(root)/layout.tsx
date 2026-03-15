import { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";
import RightSidebar from "@/components/navigation/RightSidebar";
import { auth } from "@/auth";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <main className="background-light850_dark100 relative">
      <Navbar session={session} />

      <div className="flex">
        <LeftSidebar session={session} />

        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>

        <RightSidebar />
      </div>
    </main>
  );
};

export default RootLayout;
