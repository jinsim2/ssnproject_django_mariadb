import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Input,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

function FindIdPw() {
  // 현재 활성화된 탭 상태 ('id' or 'pw')
  const [activeTab, setActiveTab] = useState("id");

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full py-20 bg-white">
      <div className="w-full max-w-[560px] px-4">
        {/* 서브 타이틀 */}
        <div className="text-center mb-[40px]">
          <h3 className="text-[28px] font-bold text-[#222]">
            아이디/비밀번호 찾기
          </h3>
        </div>

        {/* 탭 영역 (area-find 스타일 적용) */}
        <Tabs defaultValue="id" onValueChange={setActiveTab} className="w-full">
          {/* 탭 리스트 */}
          <TabsList className="w-full h-auto p-0 bg-transparent border-b border-[#e9e9e9] mb-[40px]">
            <TabsTrigger
              value="id"
              className="w-1/2 h-[35px] rounded-none border-b-2 border-transparent text-[16px] font-normal text-[#666] data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500 data-[state=active]:font-bold data-[state=active]:shadow-none bg-transparent"
            >
              아이디 찾기
            </TabsTrigger>
            <TabsTrigger
              value="pw"
              className="w-1/2 h-[35px] rounded-none border-b-2 border-transparent text-[16px] font-normal text-[#666] data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500 data-[state=active]:font-bold data-[state=active]:shadow-none bg-transparent"
            >
              비밀번호 찾기
            </TabsTrigger>
          </TabsList>

          {/* 탭 내용 컨테이너 */}
          <div className="text-center">
            {/* 탭 1: 아이디 찾기 */}
            <TabsContent value="id" className="mt-0">
              <p className="text-[15px] text-[#666] mb-[30px]">
                계정 찾기를 위해 가입된 회원정보를 입력해 주세요.
              </p>

              <form className="flex flex-col gap-[10px]">
                <Input
                  type="text"
                  placeholder="이름"
                  className="h-[55px] px-[15px] rounded-[5px] border-[#e9e9e9] text-[15px]"
                />
                <Input
                  type="text" // shadcn input tel type 지원 혹은 text 사용
                  placeholder="휴대폰번호('-' 없이 입력)"
                  className="h-[55px] px-[15px] rounded-[5px] border-[#e9e9e9] text-[15px]"
                />
                <div className="mt-[20px]">
                  <Button className="w-full h-[60px] text-[18px] font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-[5px]">
                    휴대폰 본인인증으로 찾기
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* 탭 2: 비밀번호 찾기 */}
            <TabsContent value="pw" className="mt-0">
              <p className="text-[15px] text-[#666] mb-[30px]">
                계정 찾기를 위해 가입된 회원정보를 입력해 주세요.
              </p>

              <form className="flex flex-col gap-[10px]">
                <Input
                  type="text"
                  placeholder="아이디"
                  className="h-[55px] px-[15px] rounded-[5px] border-[#e9e9e9] text-[15px]"
                />
                <Input
                  type="text"
                  placeholder="이름"
                  className="h-[55px] px-[15px] rounded-[5px] border-[#e9e9e9] text-[15px]"
                />
                <Input
                  type="text"
                  placeholder="휴대폰번호('-' 없이 입력)"
                  className="h-[55px] px-[15px] rounded-[5px] border-[#e9e9e9] text-[15px]"
                />
                <div className="mt-[20px]">
                  <Button className="w-full h-[60px] text-[18px] font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-[5px]">
                    휴대폰 본인인증으로 찾기
                  </Button>
                </div>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export { FindIdPw };
