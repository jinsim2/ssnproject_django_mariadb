import { Button } from "../ui";
import { ChevronRight } from "lucide-react";

interface props {
    isSidebarOpen: boolean;
    handleSidebarToggle: () => void;
}

function SidebarToggleButton({ isSidebarOpen, handleSidebarToggle }: props) {
    return (
        <div
            className={`fixed left-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 items-center ${isSidebarOpen ? "translate-x-72.25" : "translate-x-0"
                }`}
        >
            <Button
                variant={"outline"}
                className="rounded-none border-1-0 py-2 pr-2 pl-1"
                onClick={handleSidebarToggle}
            >
                <ChevronRight
                    className={`transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""
                        }`}
                />
            </Button>
        </div>
    );
}

export { SidebarToggleButton };