import { Label, Checkbox } from "@/components/ui";
import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { TermsModal } from "./components/TermsModal";
import { type TermKey } from "./components/TermsContent";

function RegisterStep1() {
  const location = useLocation();
  const memberType = location.state?.memberType; // 전달받은 타입
  const navigate = useNavigate();

  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TermKey | null>(null);

  // 보기 버튼 핸들러
  const handleOpenModal = (key: TermKey) => {
    setSelectedTerm(key);
    setModalOpen(true);
  };

  // 방어 코드: memberType이 없을 때 Redirect 컴포넌트를 렌더링
  if (!memberType) {
    return <Navigate to="/register" replace />;
  }

  // 체크박스 상태 관리
  const [agreements, setAgreements] = useState({
    termsService: false, // [필수] 이용약관
    termsPrivacy: false, // [필수] 개인정보
    termsThirdParty: false, // [선택] 제3자 제공
  });
  const [termsMinor, setTermsMinor] = useState(false); // [선택] 14세 미만

  // 필수 항목 체크 확인용 변수
  const isMandatoryChecked = agreements.termsService && agreements.termsPrivacy;

  // 전체 동의 상태 계산
  const isAllChecked = Object.values(agreements).every(Boolean);

  // 전체 동의 핸들러
  const handleAllCheck = (checked: boolean) => {
    setAgreements({
      termsService: checked,
      termsPrivacy: checked,
      termsThirdParty: checked,
    });
  };

  // 개별 체크 핸들러
  const handleSingleCheck = (key: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }));
  };

  const handleMinorCheck = (checked: boolean) => {
    setTermsMinor(checked);
  };

  // 다음 단계 이동(필수 항목 체크 확인)
  const handleNext = () => {
    if (!agreements.termsService || !agreements.termsPrivacy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    navigate("/register/step2", {
      state: {
        memberType,
        agreements,
        termsMinor,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full py-20 bg-white">
      <div className="w-full max-w-[1000px] px-4">
        {/* 타이틀 */}
        <div className="text-center mb-[50px]">
          <h3 className="text-4xl font-bold text-[#333]">회원가입</h3>
        </div>
        {/* Step Indicator (단계 표시) */}
        <ul className="flex justify-center gap-[50px] mb-[50px]">
          {/* 활성화된 단계 (class="on") */}
          <li className="flex items-center gap-[10px] text-blue-500">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-blue-500 text-white font-bold not-italic">
              1
            </i>
            <span className="text-[17px] font-semibold">회원약관동의</span>
          </li>
          {/* 비활성화 단계 */}
          <li className="flex items-center gap-[10px] text-[#555]">
            <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
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
        {/* 약관 동의 박스 */}
        <div className="w-full max-w-[1000px] mx-auto border border-[#e9e9e9] rounded-[20px] p-[50px]">
          {/* 전체 동의 */}
          <div className="flex items-center pb-[30px] border-b border-[#e9e9e9] mb-[30px]">
            {/* Shadcn Checkbox or Native Input */}
            <Checkbox
              id="checkAll"
              checked={isAllChecked}
              onCheckedChange={handleAllCheck}
              className="w-[20px] h-[20px] rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
            />
            <Label htmlFor="checkAll" className="ml-2 text-[18px] font-bold">
              전체 약관에 동의합니다.
            </Label>
          </div>
          {/* 개별 약관 리스트 */}
          <ul className="flex flex-col gap-[30px]">
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <Checkbox
                  id="term1_service"
                  checked={agreements.termsService}
                  onCheckedChange={(c) =>
                    handleSingleCheck("termsService", !!c)
                  }
                  className="w-[20px] h-[20px] rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                />
                <Label
                  htmlFor="term1_service"
                  className="ml-2 text-[17px] text-[#333]"
                >
                  [필수] 이용약관에 동의합니다.
                </Label>
              </div>
              <button
                onClick={() => handleOpenModal("service")}
                className="px-3 py-1 bg-[#eee] rounded text-[14px] hover:bg-blue-500 hover:text-white transition-colors"
              >
                보기
              </button>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <Checkbox
                  id="term1_privacy"
                  checked={agreements.termsPrivacy}
                  onCheckedChange={(c) =>
                    handleSingleCheck("termsPrivacy", !!c)
                  }
                  className="w-[20px] h-[20px] rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                />
                <Label
                  htmlFor="term1_privacy"
                  className="ml-2 text-[17px] text-[#333]"
                >
                  [필수] 개인정보 수집·이용 동의에 동의합니다.
                </Label>
              </div>
              <button
                onClick={() => handleOpenModal("privacy")}
                className="px-3 py-1 bg-[#eee] rounded text-[14px] hover:bg-blue-500 hover:text-white transition-colors"
              >
                보기
              </button>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <Checkbox
                  id="term1_thirdParty"
                  checked={agreements.termsThirdParty}
                  onCheckedChange={(c) =>
                    handleSingleCheck("termsThirdParty", !!c)
                  }
                  className="w-[20px] h-[20px] rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                />
                <Label
                  htmlFor="term1_thirdParty"
                  className="ml-2 text-[17px] text-[#333]"
                >
                  [선택] 개인정보 제3자 제공에 대한 동의합니다.
                </Label>
              </div>
              <button
                onClick={() => handleOpenModal("thirdParty")}
                className="px-3 py-1 bg-[#eee] rounded text-[14px] hover:bg-blue-500 hover:text-white transition-colors"
              >
                보기
              </button>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <Checkbox
                  id="term1_minor"
                  checked={termsMinor}
                  onCheckedChange={(c) => handleMinorCheck(!!c)}
                  className="w-[20px] h-[20px] rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                />
                <Label
                  htmlFor="term1_minor"
                  className="ml-2 text-[17px] text-[#333]"
                >
                  [선택] 14세 미만입니다.
                </Label>
              </div>
              <button
                onClick={() => handleOpenModal("minor")}
                className="px-3 py-1 bg-[#eee] rounded text-[14px] hover:bg-blue-500 hover:text-white transition-colors"
              >
                보기
              </button>
            </li>
          </ul>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-center gap-[12px] mt-[50px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[160px] h-[48px] px-8 py-3 bg-[#666] text-white rounded-4xl"
          >
            취소
          </button>
          <button
            onClick={handleNext}
            disabled={!isMandatoryChecked} // 체크 안되면 비활성
            className={`px-8 py-3 text-white rounded-4xl transition-colors ${
              isMandatoryChecked
                ? "bg-blue-500 hover:bg-blue-600" // 활성화 스타일
                : "bg-blue-300 cursor-not-allowed" // 비활성화 스타일
            }`}
          >
            본인인증하기
          </button>
        </div>
      </div>
      {/* 모달 컴포넌트 (최하단에 배치) */}
      <TermsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        termKey={selectedTerm}
      />
    </div>
  );
}
export { RegisterStep1 };
