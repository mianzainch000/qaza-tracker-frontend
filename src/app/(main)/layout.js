import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
// import MakroohBanner from "@/components/MakroohBanner";

const Layout = ({ children }) => {
    const cookieStore = cookies();
    const firstName = cookieStore.get("firstName")?.value || null;
    const lastName = cookieStore.get("lastName")?.value || null;

    return (
        <div className="app-container">
            <Navbar initialFirstName={firstName} initialLastName={lastName} />
            <main className="content-wrapper">
                <div className="inner-content">
                    {/* <MakroohBanner /> */}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
