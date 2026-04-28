import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/components/ui";
import icUser from "@/assets/images/common/ic-user.svg";

function SidebarMyInfo() {
    const { user, logout } = useAuthStore();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
        toast.info("로그아웃되었습니다.");
    };

    if (!user) return null;

    return (
        <div className="w-full pb-6">
            {/* 내 정보 요약 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 mb-4">
                <div className="flex justify-center mb-4">
                    <img
                        src={icUser}
                        alt="User Icon"
                        className="w-16 h-16 bg-blue-500 rounded-full"
                    />
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex justify-between border-b pb-1">
                        <em className="font-semibold not-italic">회사(기관)명</em>
                        <span>{user.company_name || "-"}</span>
                    </li>
                    <li className="flex justify-between border-b pb-1">
                        <em className="font-semibold not-italic">ID</em>
                        <span>{user.login_id}</span>
                    </li>
                    <li className="flex justify-between border-b pb-1">
                        <em className="font-semibold not-italic">이름</em>
                        <span>{user.full_name}</span>
                    </li>
                    {/* 접속 IP는 백엔드에서 주지 않으면 일단 제외하거나 user 데이터에 추가 필요 */}
                </ul>

                {/* 로그아웃 버튼 */}
                <a
                    href="#"
                    onClick={handleLogout}
                    className="block w-full py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition-colors"
                >
                    로그아웃
                </a>

                {/* 버튼 리스트 */}
                <div className="flex gap-2 mt-2">
                    <Link
                        to="/classroom"
                        className="flex-1 py-2 bg-blue-500 text-white text-center text-xs rounded-lg hover:bg-blue-600"
                    >
                        나의 강의실
                    </Link>
                    <Link
                        to="/bookmark"
                        className="flex-1 py-2 bg-emerald-500 text-white text-center text-xs rounded-lg hover:bg-emerald-600"
                    >
                        즐겨찾기
                    </Link>
                </div>
            </div>

            {/* 사이드 메뉴 리스트 (학습관리 등) */}
            <div className="space-y-6">
                <div className="side-menu">
                    <h3 className="font-bold text-lg border-b-2 border-black pb-2 mb-2">
                        학습관리
                    </h3>
                    <ul className="space-y-1 pl-2">
                        <li>
                            <Link
                                to="#"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                통합학습내역
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="#"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                온라인학습내역
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="#"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                오프라인학습내역
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="#"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                수료증내역
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="side-menu">
                    <h3 className="font-bold text-lg border-b-2 border-black pb-2 mb-2">
                        활동관리
                    </h3>
                    <ul className="space-y-1 pl-2">
                        <li>
                            <Link
                                to="#"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                나의 수강후기
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="#"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                나의 학습질문
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="side-menu">
                    <h3 className="font-bold text-lg border-b-2 border-black pb-2 mb-2">
                        회원정보관리
                    </h3>
                    <ul className="space-y-1 pl-2">
                        <li>
                            <Link
                                to="/mypage/edit"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                회원정보 수정
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/mypage/withdraw"
                                className="text-gray-600 hover:text-blue-600 hover:underline"
                            >
                                회원탈퇴
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
export { SidebarMyInfo };
