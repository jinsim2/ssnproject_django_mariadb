import { Outlet } from "react-router-dom";
import { AdminHeader, AdminSidebar } from "@/components/admin";

function AdminLayout() {
    return (
        <div className="admin-layout bg-gray-50 min-h-screen">
            {/* 1. PC용 사이드바 (모바일에선 숨김: hidden xl:block)
             여기서 fixed 위치를 잡아준다.   */}
            <div className="hidden xl:block fixed top-0 left-0 z-50">
                <AdminSidebar />
            </div>

            {/* 2. 컨텐츠 영역
             ml-[300px] -> xl:ml-[300px] (PC에서만 여백)
             ml-0 (모바일에선 여백 없음, 기본값) */}
            <div className="ml-0 xl:ml-[300px] transition-all duration-300">
                {/* 헤더 */}
                <AdminHeader />

                {/* 본문 (헤더 높이(70px)만큼 띄움) */}
                <div className="pt-[70px]">
                    <main className="container mx-auto p-8">
                        {/* 각 하위 페이지(AdminHome, AdminUsers 등)가 여기에 들어온다. */}
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export { AdminLayout };