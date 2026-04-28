// src/components/home/MainCalendar.tsx
import { useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react"; // SVG 아이콘 대신 CSS 배경 이미지 스타일을 흉내내거나 아이콘 사용
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
} from "date-fns";
import { ko } from "date-fns/locale";

function MainCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // 전체 날짜 배열 생성
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // 주 단위로 쪼개기 (CSS flex 구조에 맞추기 위함)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

    return (
        // .datepicker 스타일
        <div className="w-full h-full bg-white rounded-[10px] shadow-sm flex flex-col border overflow-hidden">
            {/* .datepicker-top */}
            <div className="flex justify-between items-center h-[47px] px-3 shrink-0 border-b-0">
                {/* .month-selector */}
                <div className="flex items-center gap-2">
                    {/* .btn-arr */}
                    <div className="flex w-auto h-[25px] rounded-[5px] overflow-hidden bg-[#EBF1F6]">
                        {/* .arrow (왼쪽) */}
                        <button
                            onClick={prevMonth}
                            className="w-[25px] h-[25px] flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            <span className="sr-only">이전 달</span>
                            {/* 이미지 대신 간단한 ASCII or SVG 사용 추천. 여기선 텍스트로 대체 */}
                            <span className="text-gray-600 text-[10px]">◀</span>
                        </button>
                        {/* .arrow.right (오른쪽) */}
                        <button
                            onClick={nextMonth}
                            className="w-[25px] h-[25px] flex items-center justify-center border-l border-[#e0e6ea] hover:bg-gray-200 transition-colors"
                        >
                            <span className="sr-only">다음 달</span>
                            <span className="text-gray-600 text-[10px]">▶</span>
                        </button>
                    </div>

                    {/* .month-name */}
                    <span className="text-[16px] font-semibold text-[#222] leading-none ml-1">
                        {format(currentDate, "yyyy년 M월", { locale: ko })}
                    </span>
                </div>

                {/* .today */}
                <button
                    onClick={goToday}
                    className="w-[54px] h-[24px] text-[12px] font-normal text-white leading-none bg-primary rounded-[5px] uppercase hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    TODAY
                </button>
            </div>

            {/* .datepicker-calendar */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
                {/* .days (요일 헤더) */}
                <div className="w-full h-[25px] bg-[#F3F6F9] grid grid-cols-7 shrink-0">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="flex justify-center items-center text-[12px] font-semibold text-[#222] leading-none"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* .dates (날짜 영역) - 주(Week) 단위 Flex */}
                <div className="flex flex-col w-full flex-1 border-t border-[#eee]">
                    {weeks.map((week, weekIdx) => (
                        // .week
                        <div
                            key={weekIdx}
                            className="flex-1 grid grid-cols-7 w-full border-b border-[#eee] last:border-b-0"
                        >
                            {week.map((day, dayIdx) => {
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isSelected = isSameDay(day, selectedDate);
                                const isTodayDate = isToday(day);

                                return (
                                    // .date
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                      relative w-full h-full block p-[3px] bg-white border-r border-[#eee] last:border-r-0
                      hover:bg-gray-50 transition-colors text-left
                    `}
                                    >
                                        {/* .date-num */}
                                        <span
                                            className={`
                        flex justify-center items-center w-[24px] h-[24px] text-[12px] leading-none rounded-full
                        ${!isCurrentMonth ? "text-[#bbb]" : "text-[#222]"}
                        ${isSelected ? "bg-primary text-white font-bold" : ""}
                        ${isTodayDate && !isSelected
                                                    ? "text-primary font-bold"
                                                    : ""
                                                }
                      `}
                                        >
                                            {format(day, "d")}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export { MainCalendar };