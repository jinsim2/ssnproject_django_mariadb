import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui";
import Logo from "@/assets/images/common/logo.svg";
import WelfareLogo from "@/assets/images/common/welfare-logo.png";

function AppFooter() {
    // 패밀리 사이트 이동 핸들러
    const handleValueChange = (url: string) => {
        if (url) window.open(url, "_blank");
    };

    return (
        <footer className="w-full flex items-center justify-center bg-[#1F3643]">
            {/* flex-col lg:flex-row: 1024px 미만에서는 새로 배치 */}
            <div className="max-w-[1440px] flex flex-col lg:flex-row justify-between gap-6 px-6 lg:px-12">
                {/* 좌측 기업 정보: w-full로 꽉 채우다가 lg 화면부터 flex-[2] 적용 */}
                <div className="flex flex-col gap-8 md:gap-10 p-6 lg:flex-[2]">
                    {/* 상단 링크 바 */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white font-bold">
                        <span className="cursor-pointer hover:opacity-80 transition-opacity">
                            교육원 소개
                        </span>
                        <span className="cursor-pointer hover:opacity-80 transition-opacity">
                            이용약관
                        </span>
                        <span className="text-blue-400 cursor-pointer hover:opacity-80 transition-opacity">
                            개인정보처리방침
                        </span>
                    </div>

                    {/* 기업 정보 */}
                    <div className="flex flex-col gap-3 md:gap-2 text-[13px] md:text-[14px] leading-relaxed">
                        <div className="text-white font-semibold mb-1 text-sm">
                            <p>(주) 웰페어코리아</p>
                        </div>
                        {/* 
               [반응형 배치 로직]
               1. flex-wrap: 공간이 부족하면 자동으로 다음 줄로 내립니다.
               2. text-[10px]: 긴 주소가 한 줄에 나오도록 기본 글씨를 작게 시작합니다.
               3. md:text-base: 중간 화면 이상에서는 크게 키웁니다.
            */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-base text-white">
                            {/* 항목 1: 주소 */}
                            <div className="flex gap-1 shrink-0">
                                {" "}
                                {/* shrink-0: 공간 부족해도 찌그러짐 방지 */}
                                <span className="text-white/50">주소</span>
                                <span>
                                    (08511) 서울시 금천구 벚꽃로 254 월드메르디앙1차 1101-1호
                                    옥교6실 33 1층 (102호)
                                </span>
                            </div>
                            {/* 항목 2: 고객센터 */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">고객센터</span>
                                <span>1544-2381</span>
                            </div>
                            {/* 항목 3: 대표 */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">대표</span>
                                <span>유상우</span>
                            </div>
                            {/* 항목 4: 사업자등록번호 */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">사업자등록번호</span>
                                <span>2024-서울금천-1949호</span>
                            </div>
                            {/* 항목 5: 통신판매업신고번호 */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">통신판매업신고번호</span>
                                <span>2024-서울금천-1949호</span>
                            </div>
                            {/* 항목 6: 원격평생교육시설신고 */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">원격평생교육시설신고</span>
                                <span>제 1076호</span>
                            </div>
                            {/* 항목 7: 개인정보 보호책임자 */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">개인정보 보호책임자</span>
                                <span>유상우</span>
                            </div>
                            {/* 항목 8: E-mail */}
                            <div className="flex gap-1 shrink-0">
                                <span className="text-white/50">E-mail</span>
                                <span>welfarekorea@welfarekorea.com</span>
                            </div>
                        </div>
                    </div>

                    {/* 카피라이트 */}
                    <p className="text-white/50">
                        © 2025 웰페어코리아. All rights reserved.
                    </p>
                </div>

                {/* 우측 기관 로고 및 패밀리 사이트: w-full로 꽉 채우다가 lg 화면부터 본래 크기 유지 */}
                <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[200px]">
                    <div className="flex flex-col gap-2">
                        <h4 className="scroll-m-20 text-base font-semibold tracking-tight text-white">
                            주관기관
                        </h4>
                        <div className="fex flex-col">
                            {/* 1. 흰색 배경 및 테두리 컨테이너 */}
                            <div className="bg-white border-y border-gray-300 py-2 px-4 flex justify-center rounded-t-lg">
                                <img
                                    src={Logo}
                                    alt="주관기관 로고"
                                    className="max-w-full h-auto object-contain"
                                    style={{ maxWidth: "200px" }}
                                />
                            </div>
                            <div className="bg-white border-b border-gray-300 py-2 px-4 flex justify-center rounded-b-lg">
                                <img
                                    src={WelfareLogo}
                                    alt="주관기관 로고"
                                    className="max-w-full h-auto object-contain"
                                    style={{ maxWidth: "200px" }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="scroll-m-20 text-base font-semibold tracking-tight text-white">
                            운영기관
                        </h4>
                        <div className="bg-white border-b border-gray-300 py-2 px-4 flex justify-center rounded-lg">
                            <img
                                src={WelfareLogo}
                                alt="운영기관 로고"
                                className="max-w-full h-auto object-contain"
                                style={{ maxWidth: "200px" }}
                            />
                        </div>
                    </div>
                    {/* 패밀리 사이트 Select (Shadcn UI) */}
                    <div className="w-full my-1 mb-3">
                        <Select onValueChange={handleValueChange}>
                            <SelectTrigger className="w-full border-white/30 bg-[#1F3643]/10 text-white font-semibold tracking-tight h-14 [&>span]:text-white">
                                <SelectValue placeholder="관련 사이트 바로가기" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="https://cafe.naver.com/joyfam4">
                                    웰페어코리아 카페
                                </SelectItem>
                                <SelectItem value="http://www.nile.or.kr">
                                    국가평생교육진흥원
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export { AppFooter };