import { manuals } from "@/constants/manual.constants";

function MainManual() {
    return (
        // .bottom
        // border: 1px solid #e9e9e9 -> border border-[#e9e9e9]
        // background: #F9F9F9 -> bg-[#F9F9F9]
        // border-radius: 10rem -> rounded-[10px]
        // height: 100% (부모 영역 채우기)
        <div className="w-full h-full border border-[#e9e9e9] bg-[#F9F9F9] rounded-[10px] box-border overflow-hidden">
            {/* .list-link */}
            {/* display: grid, grid-template-columns: repeat(4, 1fr) */}
            <ul className="grid grid-cols-4 w-full h-full">
                {manuals.map((item, index) => (
                    // li
                    // height: 38rem -> h-[38px] (또는 h-full로 균등 분할)
                    // border-bottom: 1px solid #e9e9e9
                    // border-right: 1px solid #e9e9e9
                    <li
                        key={item.id}
                        className={`
              w-full border-r border-b border-[#e9e9e9] box-border text-center
              
              /* 4번째 요소마다 (4n) 오른쪽 테두리 제거 */
              last:border-r-0 [&:nth-child(4n)]:border-r-0

              /* 5번째 요소부터 (n+5) 아래쪽 테두리 제거 */
              /* 여기서는 8개 고정이므로 마지막 줄(5~8)의 border-b 제거 */
              ${index >= 4 ? "border-b-0" : ""}
            `}
                    >
                        {/* a 태그 */}
                        {/* display: flex, justify-center, align-items: center, padding: 5rem */}
                        <a
                            href={item.link}
                            className="flex justify-center items-center w-full h-full p-[5px] hover:bg-gray-100 transition-colors"
                        >
                            {/* span */}
                            {/* font-size: 14rem */}
                            <span className="text-[14px] text-gray-700">{item.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export { MainManual };