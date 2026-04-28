import { useEffect, useState } from "react";
import { client } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { UserRoundPen } from "lucide-react";
import LOGO from "@/assets/images/common/logo.svg";
import Home from "@/assets/images/common/home.svg";
import HomeColor from "@/assets/images/common/home-color.svg";
import Logout from "@/assets/images/common/logout.svg";
import LogoutColor from "@/assets/images/common/logout-color.svg";
import { useAuthStore } from "@/stores/useAuthStore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui";
import { AdminMenuData } from "@/constants/adminMenu.constants";


function AdminSidebar({ className }: { className?: string }) {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();

    // 1. 동시 접속자 숫자를 담을 그릇(State) 만들기
    const [concurrentCount, setConcurrentCount] = useState<number>(0);

    // 2. 컴포넌트가 켜질 때 & 1분마다 API 호출하기
    useEffect(() => {
        const fetchConcurrentUsers = async () => {
            try {
                // 백엔드에 15분 이내 활동한 접속자 수 물어보기
                const response = await client.get("/api/accounts/concurrent-users/");
                setConcurrentCount(response.data.concurrent_users);
            } catch (error) {
                console.error("동시 접속자 에러: ", error);
            }
        };

        // 로그인이 되어있을 때만 호출
        if (user) {
            fetchConcurrentUsers(); // 처음 화면 뜰 때 한 번 실행

            // 1분(60초 * 1000ms = 60000ms)에 한 번씩 숫자를 가져오도록 '타이머' 설정
            const intervalId = setInterval(fetchConcurrentUsers, 60000);

            // 사이드바가 화면에서 사라지면 타이머도 깔끔하게 지우기(메모리 누수 방지)
            return () => clearInterval(intervalId);
        }
    }, [user]);

    const handleLogout = () => {
        logout();        // 전역 상태 초기화 + 토큰 제거
        navigate('/');  // 홈화면(로그인 전 사이드바 상태로 자동 변경)
    };

    return (
        <aside
            className={cn(
                "w-[300px] h-full bg-[#f9f9f9] border-r border-[#eee] overflow-y-auto px-[20px] py-[30px]",
                className
            )}
        >
            {/* 상단 로고 및 버튼 영역 */}
            <div className="mb-[30px]">
                <div className="w-[210px] h-[40px] mx-auto mb-[25px]">
                    <Link to="/">
                        <img src={LOGO} alt="Logo" className="h-full object-contain" />
                    </Link>
                </div>

                <ul className="grid grid-cols-3 gap-[7px]">
                    <li>
                        <Link
                            to="/"
                            className="flex items-center justify-center py-[5px] bg-white border border-[#ddd] rounded-[5px] text-[#333] hover:border-blue-500 hover:text-blue-500 transition-all group"
                        >
                            <img
                                src={Home}
                                alt="Home"
                                className="w-5 h-5 group-hover:hidden"
                            />
                            <img
                                src={HomeColor}
                                alt="Home"
                                className="w-5 h-5 hidden group-hover:block"
                            />
                            <span className="text-[12px] font-semibold">홈페이지</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/"
                            className="flex items-center justify-center py-[5px] bg-white border border-[#ddd] rounded-[5px] text-[#333] hover:border-blue-500 hover:text-blue-500 transition-all group"
                        >
                            <UserRoundPen className="w-5 h-5 group-hover:stroke-blue-500" />
                            <span className="text-[12px] font-semibold">정보수정</span>
                        </Link>
                    </li>
                    <li>
                        {/* 로그아웃: Link 대신 button 사용 */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center py-[5px] bg-white border border-[#ddd] rounded-[5px] text-[#333] hover:border-blue-500 hover:text-blue-500 transition-all group"
                        >
                            <img
                                src={Logout}
                                alt="Logout"
                                className="w-5 h-5 group-hover:hidden"
                            />
                            <img
                                src={LogoutColor}
                                alt="Logout"
                                className="w-5 h-5 hidden group-hover:block"
                            />
                            <span className="text-[12px] font-semibold">로그아웃</span>
                        </button>
                    </li>
                </ul>
            </div>

            {/* [신규 추가] 모바일 전용 메인 영역 */}
            {/* xl:hidden 클래스로 데스크탑에서는 숨기고 작은 모니터와 모바일에서만 보여준다. */}
            <div className="xl:hidden border-t border-dashed border-[#ddd] py-[20px]">
                <h3 className="mb-[10px] text-[16px] font-bold text-[#222]">
                    전체 메뉴
                </h3>

                {/* Shadcn Accordion 컴포넌트 사용 */}
                <Accordion type="single" collapsible className="w-full">
                    {AdminMenuData.map((menu) => {
                        return (
                            // 대시보드(id:0)는 하위 메뉴가 없으므로 링크로 처리하거나 생략
                            menu.id === 0 ? (
                                <div
                                    key={menu.id}
                                    className="py-4 font-medium hover:text-blue-500 transition-all"
                                >
                                    <Link to={"/admin"}>{menu.title}</Link>
                                </div>
                            ) : (
                                <AccordionItem
                                    key={menu.id}
                                    value={`item-${menu.id}`}
                                    className="border-b-0"
                                >
                                    <AccordionTrigger className="hover:no-underline py-2 text-[14px]">
                                        {menu.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="flex flex-col gap-3 pl-4 text-[13px] text-gray-600">
                                            {menu.items.map((subItem) => {
                                                return (
                                                    <li key={subItem.id}>
                                                        {subItem.subItems ? (
                                                            // 3단계 하위 메뉴(subItems)가 존재하는 경우
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-semibold text-gray-800">{subItem.name}</span>
                                                                <ul className="pl-3 mt-1 flex flex-col gap-1.5 border-l border-gray-200">
                                                                    {subItem.subItems.map((nestedItem) => (
                                                                        <li key={nestedItem.id} className="pl-2">
                                                                            <Link to={nestedItem.href} className="hover:text-blue-600 block">
                                                                                {nestedItem.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : (
                                                            // 독립적인 2단계 메뉴(href)만 존재하는 경우
                                                            <Link
                                                                to={subItem.href || "#"}
                                                                className="hover:text-blue-600 font-medium block"
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        );
                    })}
                </Accordion>
            </div>

            {/* 정보 박스들 */}
            <div className="border-t border-dashed border-[#ddd] py-[20px]">
                <h3 className="mb-[8px] text-[16px] font-bold text-[#222]">나의정보</h3>
                <ul className="flex flex-col gap-[3px] text-[13px]">
                    <li className="flex gap-2">
                        <em className="font-semibold text-[#333] not-italic w-[40px] shrink-0">
                            역할
                        </em>
                        <span className="text-[#666]">
                            {/* 관리자면 최고 관리자, 아니면(일반 강사 등) user_type 출력 */}
                            {user?.is_superuser ? '최고 관리자' : user?.user_type}
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <em className="font-semibold text-[#333] not-italic w-[40px] shrink-0">
                            이름
                        </em>
                        <span className="text-[#666]">
                            {user?.full_name || '이름 없음'}
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <em className="font-semibold text-[#333] not-italic w-[40px] shrink-0">
                            소속
                        </em>
                        <span className="text-[#666]">
                            {user?.company_name || '소속 정보 없음'}
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <em className="font-semibold text-[#333] not-italic shrink-0">
                            접속 IP
                        </em>
                        <span className="text-[#666]">
                            {user?.current_ip || 'IP 정보 없음'}
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <em className="font-semibold text-[#333] not-italic shrink-0">
                            최근 로그인 정보
                        </em>
                        <span className="text-[#666]">
                            {user?.last_login ? format(new Date(user.last_login), 'yyyy.MM.dd') : '로그인 기록 없음'}
                        </span>
                    </li>
                </ul>
            </div>

            <div className="border-t border-dashed border-[#ddd] py-[20px]">
                <h3 className="mb-[10px] text-[16px] font-bold text-[#222]">
                    동시 접속 정보(15분이내)
                </h3>
                <ul className="flex flex-col gap-[10px] text-[14px]">
                    <li className="flex gap-[8px]">
                        <span className="text-[#666]">
                            현재 동시 접속자 수: <strong className="text-blue-500">{concurrentCount}</strong>명
                        </span>
                    </li>
                </ul>
            </div>

            <div className="border-t border-dashed border-[#ddd] py-[20px]">
                <h3 className="mb-[5px] text-[16px] font-bold text-[#222]">
                    운영 문의
                </h3>
                <ul className="flex flex-col gap-[5px] text-[14px]">
                    <li className="flex gap-[8px]">
                        <em className="font-semibold text-[#333] not-italic">
                            웰페어 코리아
                        </em>
                    </li>
                    <li className="flex gap-[8px]">
                        <em className="font-semibold text-[#333] not-italic w-[50px] shrink-0">
                            E-mail
                        </em>
                        <span className="text-[#666]">welfarekorea@welfarekorea.com</span>
                    </li>
                    <li className="flex gap-[8px]">
                        <em className="font-semibold text-[#333] not-italic w-[50px] shrink-0">
                            Tel
                        </em>
                        <span className="text-[#666]">010.1234.5678</span>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export { AdminSidebar };
