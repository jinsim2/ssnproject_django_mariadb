import { Link } from "react-router-dom";
import IC_QUICK_HEADER from "@/assets/images/common/ic-quick-title.svg";
import IC_QUICK_01 from "@/assets/images/common/ic-quick01.svg";
import IC_QUICK_02 from "@/assets/images/common/ic-quick02.svg";
import IC_QUICK_03 from "@/assets/images/common/ic-quick03.svg";
import IC_QUICK_04 from "@/assets/images/common/ic-quick04.svg";
import IC_QUICK_HOME from "@/assets/images/common/ic-home.svg";

const QuickMenu = () => {
  // Desktop Menu Items (enoma.kr style)
  const desktopItems = [
    {
      label: "수료증출력",
      icon: (
        <img
          src={IC_QUICK_01}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/certificate",
    },
    {
      label: "나의강의실",
      icon: (
        <img
          src={IC_QUICK_02}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/my-classroom",
    },
    {
      label: "채널톡",
      icon: (
        <img
          src={IC_QUICK_03}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "#",
    },
    {
      label: "장바구니",
      icon: (
        <img
          src={IC_QUICK_04}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/cart",
    },
  ];

  // Mobile Menu Items
  const mobileItems = [
    {
      label: "수료증출력",
      icon: (
        <img
          src={IC_QUICK_01}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/certificate",
    },
    {
      label: "채널톡",
      icon: (
        <img
          src={IC_QUICK_03}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "#",
    },
    // Home button is handled separately in the center
    {
      label: "홈",
      icon: (
        <img
          src={IC_QUICK_HOME}
          alt="Quick Home"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/",
    },
    {
      label: "나의강의실",
      icon: (
        <img
          src={IC_QUICK_02}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/my-classroom",
    },
    {
      label: "장바구니",
      icon: (
        <img
          src={IC_QUICK_04}
          alt="Quick Menu Icon"
          className="w-[26px] h-[26px] cursor-pointer"
        />
      ),
      href: "/cart",
    },
  ];

  return (
    <>
      {/* 
        Desktop Version (> 1100px) 
        - Width: 82px
        - Header: Gradient #058cd8 -> #0065c3
        - Border radius: Left side only (10px)
        - Shadow: Custom standard
      */}
      <div className="hidden min-[1101px]:flex flex-col fixed right-0 top-1/2 -translate-y-1/2 z-50 m-[20px]">
        <div
          className="bg-white shadow-[0_3px_10px_rgba(0,0,0,0.05)] rounded-[10px] w-[82px] overflow-hidden"
          style={{ transition: "all 0.3s ease" }}
        >
          {/* Header */}
          <div className="h-[44px] bg-linear-to-br from-[#058cd8] to-[#0065c3] flex items-center justify-center">
            <img src={IC_QUICK_HEADER} alt="Quick Menu Header" />
          </div>

          {/* List */}
          <div className="flex flex-col">
            {desktopItems.map((item, index) => {
              const isLastItem = index === desktopItems.length - 1;
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={`
                  flex flex-col items-center justify-center h-[73px]
                  text-[#666666] hover:text-[#058cd8] hover:bg-gray-50 transition-colors
                  ${
                    !isLastItem ? "border-b border-dashed border-[#dddddd]" : ""
                  }
                `}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 
        Mobile Version (<= 1100px) 
        - Bottom fixed
        - Home button in center
      */}
      <div className="min-[1101px]:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#eeeeee] z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-between items-center h-[70px] px-4 sm:px-12 w-full max-w-[800px] mx-auto">
          {mobileItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="flex flex-col items-center gap-1 min-w-[50px] "
            >
              {item.icon}
              <span className="text-[11px] font-semibold text-[#666666]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export { QuickMenu };
