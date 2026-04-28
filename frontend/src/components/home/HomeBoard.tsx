import { useState } from "react";
// 더보기 버튼 아이콘 (선택사항)
import { Plus } from "lucide-react";

// 1. 탭 목록 정의
const TABS = [
    { id: "notice", label: "공지사항" },
    { id: "inquiry", label: "1:1 문의" },
    { id: "faq", label: "자주묻는질문" },
];

// 2. 탭별 데이터 정의 (나중에는 API 데이터로 대체 가능)
const BOARD_DATA = {
    notice: [
        // 공지사항
        { id: 1, subject: "2026년 1월 직무능력향상 교육 안내", date: "2026.1.06" },
        { id: 2, subject: "2026년 1월 법정 교육 안내", date: "2026.1.05" },
        { id: 3, subject: "시스템 점검 안내", date: "2026.1.01" }, // 예시 데이터 추가
        { id: 4, subject: "신규 강좌 개설 소식", date: "2025.12.28" },
    ],
    inquiry: [
        // 1:1 문의
        { id: 1, subject: "등록된 문의가 없습니다.", date: "" },
    ],
    faq: [
        // 자주 묻는 질문
        {
            id: 1,
            subject: "[회원가입] 회원가입은 누가 할 수 있나요?",
            date: "2026.1.1",
        },
        { id: 2, subject: "[수료증] 수료증 발급은 언제 되나요?", date: "2026.1.2" },
    ],
};

function HomeBoard() {
    const [activeTab, setActiveTab] = useState("notice");

    // 현재 활성화된 탭의 데이터 가져오기 (최대 4개까지만 표시 예시)
    const currentData = BOARD_DATA[activeTab as keyof typeof BOARD_DATA] || [];

    return (
        <div className="w-full h-full bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
            {/* 상단: 탭 메뉴 + 더보기 버튼 */}
            <div className="flex items-center justify-between px-4 mt-4 border-b">
                <ul className="flex gap-6">
                    {TABS.map((tab) => (
                        <li
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                pb-3 cursor-pointer text-sm font-semibold transition-colors relative
                ${activeTab === tab.id
                                    ? "text-primary border-b-2 border-primary" // 활성 상태
                                    : "text-muted-foreground hover:text-foreground" // 비활성 상태
                                }
              `}
                        >
                            {tab.label}
                        </li>
                    ))}
                </ul>
                <button
                    className="mb-2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="더보기"
                >
                    <Plus className="w-4 h-4" /> {/* 또는 텍스트 "+" */}
                </button>
            </div>

            {/* 컨텐츠: 게시글 목록 */}
            <div className="flex-1 p-4 min-h-0 overflow-y-auto">
                <ul className="flex flex-col gap-3">
                    {currentData.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between group cursor-pointer"
                        >
                            <span className="text-sm text-foreground truncate group-hover:underline group-hover:text-primary transition-colors flex-1 pr-4">
                                {item.subject}
                            </span>
                            {item.date && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {item.date}
                                </span>
                            )}
                        </li>
                    ))}
                    {/* 데이터가 없을 경우 처리 */}
                    {currentData.length === 0 && (
                        <li className="text-center text-sm text-muted-foreground py-4">
                            게시글이 없습니다.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export { HomeBoard };