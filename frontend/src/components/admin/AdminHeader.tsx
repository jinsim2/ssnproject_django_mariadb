import { Link } from "react-router-dom";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminMenuData } from "@/constants/adminMenu.constants";
import type { subMenuItem } from "@/constants/adminMenu.constants";
import { AdminSidebar } from "./AdminSidebar"
import Logo from "@/assets/images/common/logo.svg"

// ─────────────────────────────────────────────────
// 2차 메뉴의 아이템 1개를 렌더링하는 서브 컴포넌트
// 3차 하위 항목(subItems)이 있는지 여부에 따라 구조를 분기합니다.
// ─────────────────────────────────────────────────
function SubMenuItem({ item }: { item: subMenuItem }) {
    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (hasSubItems) {
        // ── 3차 메뉴가 존재하는 경우: 오른쪽에 서브 드롭다운 렌더링 ──
        return (
            <li className="group/sub relative">
                <div className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm text-[#444]",
                    "cursor-default hover:bg-accent hover:text-accent-foreground transition-colors"
                )}>
                    <span>{item.name}</span>
                    <span className="text-gray-400 ml-2">›</span>
                </div>
                {/* 3차 메뉴: 오른쪽으로 펼쳐짐 */}
                <ul className="absolute left-full top-0 hidden group-hover/sub:block w-48 bg-white border border-gray-100 rounded-md shadow-lg z-50 p-1">
                    {item.subItems!.map((child) => (
                        <li key={child.id}>
                            <NavigationMenuLink asChild>
                                <Link
                                    to={child.href}
                                    className={cn(
                                        "block select-none rounded-md px-3 py-2 text-sm text-[#444]",
                                        "hover:bg-accent hover:text-blue-600 transition-colors"
                                    )}
                                >
                                    {child.name}
                                </Link>
                            </NavigationMenuLink>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }

    // ── 3차 메뉴가 없는 경우: 바로 링크로 이동 ──
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    to={item.href ?? "#"}
                    className={cn(
                        "block select-none rounded-md px-3 py-2 text-sm text-[#444]",
                        "hover:bg-accent hover:text-blue-600 transition-colors"
                    )}
                >
                    {item.name}
                </Link>
            </NavigationMenuLink>
        </li>
    );
}

// ─────────────────────────────────────────────────
// 메인 AdminHeader 컴포넌트
// ─────────────────────────────────────────────────
function AdminHeader() {
    return (
        /*
            left-[300px] -> xl:left-[300px] (데스크탑에서만 300px 여백)
            xl:w-[calc(100%-300px)]:  전체 너비에서 300px 뺌(스크롤바 생김 방지)
            left-0 (모바일, 랩탑은 처음부터)
            너비도 마찬가지로 xl: 기준 분기
        */
        <header className="fixed top-0 left-0 xl:left-[300px] w-full xl:w-[calc(100%-300px)] h-[70px] bg-white border-b border-gray-200 z-50 px-8 flex items-center justify-between shadow-sm">
            {/* 모바일용 햄버거 버튼(PC에선 숨김: xl:hidden) */}
            <div className="xl:hidden mr-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="p-2">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    {/* 사이드바가 열리는 내용 */}
                    <SheetContent side="left" className="p-0 w-[300px]">
                        {/* 접근성을 위한 Title (숨김 처리 가능) */}
                        <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                        {/* AdminSidebar 재사용! (className으로 스타일 미세조정 가능) */}
                        <AdminSidebar className="w-full border-none" />
                    </SheetContent>
                </Sheet>
            </div>

            {/* 로고 영역
            <h1 className="flex-shrink-0 mr-8">
                <Link to="/admin">
                    <span className="text-xl font-bold text-blue-600">Admin</span>
                </Link>
            </h1> */}

            {/* [추가] 모바일 전용 중앙 로고 */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 min-[1150px]:hidden">
                <Link to="/admin">
                    <img src={Logo} alt="Logo" className="w-[200px] h-auto" />
                </Link>
            </div>

            {/* GNB 네비게이션 */}
            {/* justify-end 설정 때문에 창이 좁아지면 왼쪽(사이드바 쪽)으로 밀려나며 덮어쓰게 됩니다.
                이를 justify-start 로 바꾸고 가로 스크롤(overflow-x-auto)은 드롭다운을 잘리게 하므로 제거합니다. */}
            <NavigationMenu viewport={false} className="hidden xl:flex flex-1 min-w-0 mx-4 justify-start">
                <NavigationMenuList className="flex-1 flex justify-start gap-1">
                    {AdminMenuData.map((menu) => {
                        // ── 케이스 1: items가 비어있는 직접 링크 메뉴 (예: 대시보드) ──
                        if (!menu.items || menu.items.length === 0) {
                            return (
                                <NavigationMenuItem key={menu.id}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to={menu.href ?? "/admin"}
                                            className={cn(
                                                "inline-flex items-center justify-center px-4 py-2 rounded-md text-[13px] xl:text-[15px] 2xl:text-[17px] font-medium text-[#222] whitespace-nowrap",
                                                "hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                            )}
                                        >
                                            {menu.title}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        }

                        // ── 케이스 2: items가 있는 드롭다운 메뉴 ──
                        return (
                            <NavigationMenuItem key={menu.id} className="relative">
                                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-50 text-[15px] font-medium text-[#222] data-[state=open]:text-blue-600 [&>svg]:hidden px-2 text-[13px] xl:text-[15px] 2xl:text-[17px] whitespace-nowrap">
                                    {menu.title}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[180px] p-1 bg-white rounded-md shadow-lg border border-gray-100">
                                        <ul className="grid gap-0.5">
                                            {menu.items.map((subItem) => (
                                                <SubMenuItem key={subItem.id} item={subItem} />
                                            ))}
                                        </ul>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>

            {/* 우측 영역 (추후 로그인 유저 정보 또는 로그아웃 버튼으로 교체) */}
            <div className="flex-shrink-0 ml-8 w-16" />
        </header>
    );
}

export { AdminHeader };
