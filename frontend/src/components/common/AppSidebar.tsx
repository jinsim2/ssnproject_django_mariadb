import { useAuthStore } from "@/stores/useAuthStore";

// components/auth의 컴포넌트 가져오기
import { SidebarLogin, SidebarMyInfo } from "@/components/auth";

function AppSidebar() {
  const { isAuthenticated } = useAuthStore(); // 전역 상태에서 '로그인 여부'만 쏙 빼옴

  // 로그인 상태에 따라 메시지 동적 결정
  const serverMessage = isAuthenticated ? "연결 성공" : "연결 실패";

  return (
    <aside className="min-w-60 w-60 flex flex-col gap-1 m-6 h-[calc(100vh-8rem)]">
      {/* 핵심 로직: 조건부 렌더링 - 콘텐츠 영역만 스크롤되도록 감싸기 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isAuthenticated ? <SidebarMyInfo /> : <SidebarLogin />}
      </div>

      {/* 서버 연결 확인 - 실제 운영환경에서는 삭제 */}
      <div className="pt-4"></div>
      <div className={`mt-auto shrink-0 p-2 rounded-lg font-bold text-xs text-center ${isAuthenticated ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        [서버 테스트] {serverMessage}
      </div>
    </aside>
  );
}

export { AppSidebar };
