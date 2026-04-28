import { Outlet } from "react-router-dom";

function BlankLayout() {
    return (
        <div>
            <Outlet />
        </div>
    );
}

export { BlankLayout };