import { AppFooter, AppHeader, QuickMenu } from "@/components/common"
import { Outlet } from "react-router-dom"

function MainLayout() {
    return (
        <div className="page">
            <AppHeader />
            {/* 새로운 스크롤 영역(전체 너비, 남은 높이 차지, 스크롤 가능) */}
            {/* QuickMenu의 높이가 모바일에서 약 70px 이므로 max-[110px]:pb-[80px] 클래스를
                추가하면, 1100px 이하 화면에서만 하단에 80 px의 여백이 생긴다. */}
            <div className="w-full flex-1 flex-col overflow-y-auto max-[1100px]:pb-[80px]">
                <div className="container">
                    <Outlet />
                    <AppFooter /> {/* container로 이동된 푸터는 내용과 함께 스크롤됨 */}
                </div>
            </div>
            <QuickMenu />
        </div>
    )
}

export { MainLayout }