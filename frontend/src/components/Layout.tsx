import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
interface LayoutProps {
    showSidebar?: boolean;
    children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
    return (
        <div className="min-h-screen">
            <div className="flex">
                {props.showSidebar && <Sidebar />}
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    {props.children}
                </div>
            </div>
        </div>
    );  
};

export default Layout;