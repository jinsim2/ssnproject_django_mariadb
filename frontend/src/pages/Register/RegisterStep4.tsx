import { useNavigate, useLocation, Navigate } from "react-router-dom";
import icCircleChk from "@/assets/images/join/ic-circle-chk.svg";
import { Button } from "@/components/ui";

function RegisterStep4() {
  const navigate = useNavigate();
  const location = useLocation();

  // 3단계에서 넘겨준 이름 받기 (없으면 기본값 '홍길동')
  const { name = "홍길동", memberType } = location.state || {};

  // 방어 코드
  if (!memberType) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full py-20 bg-white">
      <div className="w-full max-w-[1000px] px-4">
        {/* 타이틀 */}
        <div className="text-center mb-[50px]">
          <h3 className="text-4xl font-bold text-[#333]">회원가입</h3>
        </div>
        {/* Step Indicator (4단계 활성화) */}
        <ul className="flex justify-center gap-[50px] mb-[50px]">
          <li className="flex items-center gap-[10px] text-[#555]">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
              1
            </i>
            <span className="text-[17px] font-semibold">회원약관동의</span>
          </li>
          <li className="flex items-center gap-[10px] text-[#555]">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
              2
            </i>
            <span className="text-[17px] font-semibold">본인인증</span>
          </li>
          <li className="flex items-center gap-[10px] text-[#555]">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
              3
            </i>
            <span className="text-[17px] font-semibold">회원정보입력</span>
          </li>
          <li className="flex items-center gap-[10px] text-blue-500">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-blue-500 text-white font-bold not-italic">
              4
            </i>
            <span className="text-[17px] font-semibold">가입완료</span>
          </li>
        </ul>
        {/* 가입 완료 박스 (box-join 스타일) */}
        <div className="w-full max-w-[1000px] mx-auto border border-[#e9e9e9] box-border p-[50px] rounded-[20px] text-center">
          <div className="flex flex-col items-center justify-center">
            {/* 아이콘 */}
            <div className="w-[60px] h-[60px] mb-[25px]">
              <img src={icCircleChk} alt="가입완료 체크" className="h-full" />
            </div>
            {/* 완료 메시지 */}
            <h4 className="block mb-[16px] text-[24px] font-bold text-[#222] leading-none break-keep">
              회원가입이 완료되었습니다!
            </h4>
            <p className="block text-[17px] font-normal text-[#555] leading-[1.5em] break-keep">
              <span className="font-bold text-[#333]">{name}</span>님의
              회원가입이 <br />
              성공적으로 완료되었습니다.
            </p>
            {/* 로그인 바로하기 버튼 */}
            <Button
              onClick={() => navigate("/auth/login")}
              variant="outline"
              className="mt-[30px] min-w-[120px] h-[50px] border-2 border-blue-500 text-blue-500 text-[15px] font-bold rounded-4xl hover:bg-blue-500 hover:text-white transition-colors"
            >
              로그인 바로하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RegisterStep4 };
