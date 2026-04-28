import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import Logo from "@/assets/images/common/logo.svg";
import Certi from "@/assets/images/common/ic-certi.svg";
import Adm from "@/assets/images/common/ic-adm.svg";
import {
    Input,
    Button,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui";
import { Menu, Search } from "lucide-react";
import { menuData } from "@/constants/menu.constants";

function AppHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user } = useAuthStore();

    // 관리자이면서 로그인이 되어 있다면 바로 대시보드(/admin)로, 아니면 로그인 창(/adminlogin)으로
    const adminPath = (isAuthenticated && user?.is_admin) ? "/admin" : "/adminlogin";

    return (
        <header
            className="sticky top-0 z-50 w-full bg-white h-14 md:h-16 xl:h-20 border-b border-slate-200"
            onMouseLeave={() => setIsMenuOpen(false)}
        >
            {/* 
        [1. 배경판] 
        비주얼 담당. 헤더 전체 너비를 덮는 흰색 배경. 내용은 없음.
        (그리드 내용은 nav 안에 있음)
      */}
            <div
                className={`absolute top-full left-0 w-full bg-white border-b transition-all duration-300 ease-in-out -z-10 ${isMenuOpen
                    ? "h-[360px] opacity-100 border-t"
                    : "h-0 opacity-0 border-t-0"
                    }`}
            />

            {/* [2. 헤더 본문] */}
            <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto h-full px-2 sm:px-4 gap-x-2 relative z-20 bg-white">
                {/* [왼쪽 그룹] */}
                <div className="flex items-center gap-3 xl:gap-8 2xl:gap-16 h-full">
                    <div className="shrink-0 flex items-center">
                        <Link to="/">
                            <img src={Logo} alt="@Logo" className="h-6 md:h-7 xl:h-8" />
                        </Link>
                    </div>

                    <div className="relative hidden w-64 xl:w-72 2xl:w-96 xl:block">
                        <Input
                            placeholder="과정명을 입력해주세요."
                            className="pr-10 border-slate-200 bg-slate-50"
                        />
                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* [3. 네비게이션 & 그리드 메뉴] */}
                    {/* nav는 relative여야 내부 absolute 요소(그리드)의 기준점이 됨 */}
                    <nav
                        className="hidden min-[1100px]:block h-full relative"
                        onMouseEnter={() => setIsMenuOpen(true)}
                    >
                        {/* 메인 메뉴 타이틀 (상단) */}
                        {/* 너비를 700px(1100px구간) -> 740px(xl) -> 840px(2xl)로 점진적 확장 */}
                        <ul className="grid grid-cols-7 w-[700px] xl:w-[740px] 2xl:w-[840px] h-full">
                            {menuData.map((menu) => (
                                <li
                                    key={menu.id}
                                    className="group h-full flex flex-col items-center justify-center relative"
                                >
                                    <a
                                        href="*"
                                        className="flex items-center justify-center w-full h-full text-sm xl:text-base 2xl:text-lg font-bold text-slate-500 group-hover:text-blue-600 transition-colors relative"
                                    >
                                        {menu.title}
                                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* 하위 메뉴 그리드 (하단) */}
                        {/*
                            - nav 안에 존재하므로 nav의 시작점(left-0)과 정확히 일치함.
                            - 너비도 위 ul과 똑같이 맞춰서 컬럼이 수직으로 딱 맞음.
                        */}
                        <div
                            className={`absolute top-full left-0 grid grid-cols-7 w-[700px] xl:w-[740px] 2xl:w-[840px] border-x border-b border-slate-200 bg-white transition-all duration-300 ease-in-out origin-top overflow-hidden ${isMenuOpen
                                ? "h-[360px] opacity-100 visible scale-y-100 border-t" // 높이 대신 scale로 펼쳐지는 효과(선택사항)
                                : "opacity-0 invisible scale-y-0 border-t-0"
                                }`}
                        >
                            {menuData.map((menu) => (
                                <div
                                    key={menu.id}
                                    className="flex flex-col gap-3 py-8 px-1 border-r border-slate-100 h-full last:border-r-0"
                                >
                                    {menu.items.map((subItem) => (
                                        <a
                                            key={subItem.id}
                                            href="*"
                                            className="text-sm text-center text-slate-500 hover:text-blue-600 hover:font-bold hover:underline block py-1 break-keep transition-all"
                                        >
                                            {subItem.name}
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </nav>
                </div>

                {/* [오른쪽 그룹] - 기존 유지 */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="flex flex-row min-[1100px]:flex-col h-auto border py-2 px-3 gap-1"
                        >

                            <img src={Certi} alt="@Certi" className="w-6 h-6" />
                            <span className="text-xs hidden sm:inline">(구)수료증</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex flex-row min-[1100px]:flex-col h-auto border py-2 px-3 gap-1"
                            asChild
                        >
                            <Link to={adminPath}>
                                <img src={Adm} alt="@Adm" className="w-6 h-6" />
                                <span className="text-xs px-2 hidden sm:inline">관리자</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 min-[1100px]:hidden">
                        <Button variant="ghost" className="p-2">
                            <Search className="w-8 h-8" />
                        </Button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="p-2 cursor-pointer">
                                    <Menu className="w-8 h-8" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle className="text-left">메뉴</SheetTitle>
                                </SheetHeader>
                                {/* Shadcn Accordion 컴포넌트 사용 */}
                                <Accordion type="single" collapsible className="w-full mt-4">
                                    {menuData.map((item) => (
                                        <AccordionItem
                                            key={item.id}
                                            value={`header-item-${item.id}`}
                                            className="border-b-0"
                                        >
                                            {/* 대메뉴 (클릭 시 펼쳐짐) */}
                                            <AccordionTrigger className="text-lg font-medium hover:text-blue-500 hover:no-underline py-3 px-2">
                                                {item.title}
                                            </AccordionTrigger>

                                            {/* 하위 메뉴(펼쳐졌을 때 내용) */}
                                            <AccordionContent>
                                                <div className="flex flex-col gap-2 pl-4 py-2 bg-slate-50 rounded-md">
                                                    {item.items.map((subItem) => (
                                                        <Link
                                                            key={subItem.id}
                                                            to={subItem.href}
                                                            className="text-sm text-slate-600 hover:text-blue-600 py-2 px-2 block transition-colors"
                                                        >
                                                            - {subItem.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header >
    );
}

export { AppHeader };