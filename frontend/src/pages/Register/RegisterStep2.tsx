import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { client } from "@/lib/api";

declare global {
  interface Window {
    IMP: any;
  }
}
import icPhone from "@/assets/images/join/ic-phone.svg";
import icIpin from "@/assets/images/join/ic-ipin.svg";
import { Button } from "@/components/ui";

function RegisterStep2() {
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1에서 넘어온 데이터 받기
  const { memberType, agreements, termsMinor } = location.state || {};

  // 방어코드: 데이터 없으면 처음으로 이동
  if (!memberType || !agreements) {
    return <Navigate to="/register" replace />;
  }

  // window 객체에 IMP가 있음을 TypeScript에게 알려준다.
  const IMP = window.IMP;

  // 본인인증 버튼 클릭 핸들러
  const handleAuth = (method: string) => {
    if (method === "PHONE") {
      if (!IMP) {
        alert("포트원 모듈 로딩 중입니다.");
        return;
      }

      // 1. 고객사 식별코드로 포트원 객체 초기화
      IMP.init("imp58733802");

      // 2. 본인인증 창 호출(테스트 모드)
      IMP.certification(
        {
          pg: "inicis_unified",
          merchant_uid: `mid_${new Date().getTime()}`, // 고유한 인증번호
          popup: true, // PC에서는 팝업으로
        },
        // 3. 인증창 닫힌 후 콜백
        async (response: any) => {
          const { success, imp_uid, error_msg } = response;

          if (success) {
            console.log("포트원 인증 성공 imp_uid: ", imp_uid);

            try {
              // 백엔드로 imp_uid를 보내서 실제 유저 정보(이름, 폰번호 등)를 안전하게 받아온다.
              const res = await client.post("/api/accounts/verify-identity/", {
                imp_uid: imp_uid
              });

              if (res.data.success) {
                alert("본인인증에 성공했습니다!");
                const realUserInfo = res.data.userInfo;

                // 인증 성공 후 step 3로 찐 데이터와 함께 이동
                navigate("/register/step3", {
                  state: {
                    memberType,
                    agreements,
                    termsMinor,
                    authMethod: method,
                    impUid: imp_uid, // 나중에 회원가입 API 제출용
                    userInfo: realUserInfo, // DB에 저장될 실제 인증된 정보 (name, birthDate, gender, mobile)
                  },
                });
              } else {
                alert(`서버 검증 실패: ${res.data.message}`);
              }
            } catch (error: any) {
              console.error("본인인증 백엔드 통신 에러:", error);
              alert("본인인증 검증 중 서버 에러가 발생했습니다.");
            }

          } else {
            alert(`본인인증 실패: ${error_msg}`);
          }
        }
      );
    } else {
      alert("아이핀 인증은 현재 준비 중입니다. 휴대폰 인증을 이용해 주세요.");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full py-20 bg-white">
      <div className="w-full max-w-[1000px] px-4">
        {/* 타이틀 */}
        <div className="text-center mb-[50px]">
          <h3 className="text-4xl font-bold text-[#333]">회원가입</h3>
        </div>
        {/* Step Indicator (2단계 활성화) */}
        <ul className="flex justify-center gap-[50px] mb-[50px]">
          <li className="flex items-center gap-[10px] text-[#555]">
            {/* 1단계는 이제 회색 */}
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
              1
            </i>
            <span className="text-[17px] font-semibold">회원약관동의</span>
          </li>
          <li className="flex items-center gap-[10px] text-blue-500">
            {/* 2단계 활성화 (파란색) */}
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-blue-500 text-white font-bold not-italic">
              2
            </i>
            <span className="text-[17px] font-semibold">본인인증</span>
          </li>
          {/* 비활성화 단계 */}
          <li className="flex items-center gap-[10px] text-[#555]">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
              3
            </i>
            <span className="text-[17px] font-semibold">회원정보입력</span>
          </li>
          {/* 비활성화 단계 */}
          <li className="flex items-center gap-[10px] text-[#555]">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
              4
            </i>
            <span className="text-[17px] font-semibold">가입완료</span>
          </li>
        </ul>
        {/* 본인인증 선택 박스 (Grid Layout 사용) */}
        <div className="w-full max-w-[1000px] mx-auto grid grid-cols-2 gap-[50px]">
          {/* 1. 휴대폰 인증 */}
          <div className="border border-[#e9e9e9] box-border p-[60px_40px] rounded-[20px] text-center">
            <div className="flex justify-center items-center h-[69px] mb-[30px]">
              <img src={icPhone} alt="휴대폰 인증" className="h-full" />
            </div>
            <h2 className="scroll-m-20 text-3xl font-semibold text-[#222] tracking-tight leading-none mb-[15px]">
              휴대폰 인증
            </h2>
            <p className="block text-[16px] font-normal text-[#555] leading-relaxed break-keep mb-[25px]">
              원활한 서비스 이용과 익명 사용자로 인한 피해를 방지하기 위한
              본인인증 절차가 필요합니다.
            </p>
            <Button
              onClick={() => handleAuth("PHONE")}
              className="w-[200px] h-[50px] bg-blue-500 text-white rounded-4xl text-[16px] font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              휴대폰 인증
            </Button>
          </div>
          {/* 2. 아이핀 인증 */}
          <div className="border border-[#e9e9e9] box-border p-[60px_40px] rounded-[20px] text-center">
            <div className="flex justify-center items-center h-[69px] mb-[30px]">
              <img src={icIpin} alt="아이핀 인증" className="h-full" />
            </div>
            <h3 className="block text-[30px] font-bold text-[#222] leading-none mb-[15px]">
              아이핀(I-PIN) 인증
            </h3>
            <p className="block text-[16px] font-normal text-[#555] leading-relaxed break-keep mb-[25px]">
              회원가입 시 개인정보보호를 위해 주민등록번호 외 본인확인 할 수
              있는 아이핀(I-PIN)을 운영중 입니다.
            </p>
            <Button
              onClick={() => handleAuth("IPIN")}
              className="w-[200px] h-[50px] bg-blue-500 text-white rounded-4xl text-[16px] font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              아이핀(I-PIN) 인증
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RegisterStep2 };
