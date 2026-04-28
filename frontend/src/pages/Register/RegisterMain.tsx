import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/common/logo.svg";

function RegisterMain() {
  const navigate = useNavigate();

  // 회원가입 페이지 이동 핸들러
  // 페이지 이동 시 location.state에 memberType을 저장
  const handleJoinClick = (type: string) => {
    // state로 type 전달
    navigate("/register/step1", { state: { memberType: type } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full py-20 bg-white">
      <div className="w-full max-w-[1000px] px-4">
        {/* 타이틀 영역 */}
        <div className="text-center mb-10">
          <h3 className="text-4xl font-bold text-[#333]">회원가입</h3>
        </div>

        {/* 회원 유형 선택 박스 */}
        <div className="w-full max-w-[1000px] mx-auto border border-[#eee] rounded-[20px] bg-[#fbfbfb] px-[50px] py-[70px] box-border">
          {/* 로고 영역 */}
          <div className="flex justify-center h-[50px] mb-5">
            <img src={logo} alt="로고" className="h-full" />
          </div>

          {/* 안내 문구 */}
          <div className="text-center mb-10">
            {/* <h4 className="block text-[30px] font-bold text-[#333] leading-none mb-3">사회복지 온라인 교육원...</h4> */}
            <p className="block mt-3 text-base font-normal text-[#666] leading-relaxed break-keep">
              회원구분에 따라 가입절차에 차이가 있으니 <br />
              반드시 본인에 해당하는 경우를 선택해 주시기 바랍니다.
            </p>
          </div>

          {/* 회원 유형 리스트 */}
          <ul className="w-[500px] mx-auto flex flex-col gap-3">
            {[
              { label: "일반회원(14세 미만 포함)", value: "general" },
              {
                label: "일반회원(기관/시설소속)(14세 미만 포함)",
                value: "institution_staff",
              },
              { label: "외국인 회원", value: "foreign" },
              { label: "강사", value: "instructor" },
            ].map((item, index) => (
              <li key={index} className="w-full h-[64px]">
                <button
                  type="button"
                  onClick={() => handleJoinClick(item.value)}
                  className="flex justify-center items-center w-full h-full bg-white border border-[#e9e9e9] rounded-[10px] transition-all duration-300 hover:border-blue-500 group"
                >
                  <span className="text-[17px] font-semibold text-[#333] group-hover:text-blue-500 break-keep">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { RegisterMain };
