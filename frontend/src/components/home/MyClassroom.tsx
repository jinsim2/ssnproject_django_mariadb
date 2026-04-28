import { ChevronRight } from "lucide-react"; // 아이콘 사용을 위해 import
import MyclassroomImage from "@/assets/images/common/ic-classroom.svg";
import { Link } from "react-router-dom";

function MyClassroom() {
    return (
        // .main-classroom
        // width: 204rem -> w-full (반응형을 위해 부모에 맞춤)
        // background: #1B98FF -> bg-[#1B98FF]
        // border-radius: 10rem -> rounded-[10px]
        // z-index: 1 -> relative z-10 (필요한 경우)
        <div className="w-full h-full bg-[#1B98FF] rounded-[10px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            {/* a 태그 (링크) */}
            {/* display: block, height: 100%, padding: 12rem 15rem */}
            <Link
                to={"/my-classroom"}
                className="block w-full h-full p-[15px] relative z-20 no-underline"
            >
                {/* em (소제목) */}
                {/* margin-bottom: 7rem, fontSize: 13rem, fontWeight: 500, color: #fff */}
                <div className="inline-block mb-[7px] text-[13px] font-medium text-white leading-none tracking-wide">
                    My Classroom
                </div>
                {/* h3 (대제목) */}
                {/* fontSize: 26rem, fontWeight: 700, color: #fff */}
                <h3 className="block text-[26px] font-bold text-white leading-none mb-1">
                    나의강의실
                </h3>
                {/* .btn-more (버튼 영역) */}
                {/* margin-top: 5rem */}
                <div className="mt-[5px] inline-flex">
                    {/* span (버튼 텍스트) */}
                    {/* fontSize: 14rem, padding-right: 23rem(였지만 flex로 구조 변경) */}
                    <span className="relative flex items-center text-[14px] font-normal text-white">
                        강의실 입장하기
                        {/* span:before (화살표 아이콘) 대체 */}
                        {/* width: 17rem, height: 17rem, background: #fff, color: #1B98FF */}
                        {/* CSS의 가상요소(before) 대신 실제 태그로 구현하여 제어하기 쉽게 만듦 */}
                        <span className="ml-[6px] w-[17px] h-[17px] bg-white rounded-full flex items-center justify-center text-[#1B98FF]">
                            {/* 아이콘 크기 조절 (stroke-[4]로 굵게) */}
                            <ChevronRight className="w-[10px] h-[10px] stroke-[4]" />
                        </span>
                    </span>
                </div>
            </Link>
            {/* .img (배경 이미지 영역) */}
            {/* position: absolute, right: 5rem, bottom: 5rem, height: 60rem */}
            <div className="absolute right-[5px] bottom-[5px] h-[90px] z-10">
                <img src={MyclassroomImage} alt="My Classroom" className="w-28 h-28" />
            </div>
        </div>
    );
}

export { MyClassroom };