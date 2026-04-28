import CsImage from "@/assets/images/common/ic-cs.svg";

function CustomerCenter() {
    return (
        // .main-cs
        // width: calc(100% - 219rem) -> w-full (반응형이므로 부모 그리드에 맞춤)
        // background: #FFB031 -> bg-[#FFB031]
        // border-radius: 10rem -> rounded-[10px]
        // padding: 10rem 15rem -> p-[15px] (상하좌우 넉넉하게 적용)
        // height: 100% -> h-full (높이를 꽉 채움)
        <div className="w-full h-full bg-[#FFB031] rounded-[10px] relative p-[15px] overflow-hidden flex flex-col justify-center">
            {/* .txt */}
            {/* z-index: 1 -> relative z-10 */}
            <div className="relative z-10">
                {/* em (소제목) */}
                {/* margin-bottom: 5rem, fontSize: 13rem, fontWeight: 600, color: #fff */}
                <div className="inline-block mb-[5px] text-[13px] font-semibold text-white leading-none">
                    고객센터
                </div>

                {/* h3 (전화번호) */}
                {/* fontSize: 35rem, fontWeight: 800, color: #fff */}
                <h3 className="block text-[35px] font-extrabold text-white leading-none mb-1">
                    1544-2381
                </h3>

                {/* .info-list */}
                {/* margin-top: 10rem -> mt-[10px] */}
                <ul className="mt-[10px] flex flex-col gap-[5px]">
                    {/* li */}
                    {/* font-size: 14rem, font-weight: 400, color: #fff */}
                    <li className="text-[14px] font-normal text-white leading-tight">
                        운영시간 09:00 ~ 17:00 (점심시간 12:00 ~ 13:00)
                    </li>
                    <li className="text-[14px] font-normal text-white leading-tight">
                        주말 및 공휴일 휴무
                    </li>
                    <li className="text-[14px] font-normal text-white leading-tight">
                        welfarekorea@welfarekorea.com
                    </li>
                </ul>
            </div>

            {/* .img (이미지 영역) */}
            {/* position: absolute, right: 8rem, top: 8rem, height: 70rem */}
            {/* 우측 상단 배치 */}
            <div className="absolute right-[8px] top-[8px] h-[70px] z-10 opacity-90">
                <img
                    src={CsImage}
                    alt="고객센터"
                    className="w-[70px] h-[70px] text-white/30"
                />
            </div>
        </div>
    );
}
export { CustomerCenter };