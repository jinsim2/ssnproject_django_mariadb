import { useEffect, useState } from "react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Checkbox,
  toast,
} from "@/components/ui";
import icCircleLogin from "../../assets/images/common/ic-circle-login.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@radix-ui/react-label";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

// 1. 유효성 검사 규칙(기존 코드와 동일)
const formSchema = z.object({
  id: z.string().min(4, {
    error: "올바른 ID를 입력하세요.",
  }),
  password: z.string().min(10, {
    error: "비밀번호는 최소 10글자 이상이어야 합니다.",
  }),
});

function SidebarLogin() {
  const [isSaveId, setIsSaveId] = useState(false);
  const { login } = useAuthStore(); // 스토어에서 로그인 함수 가져오기

  // 2. 폼 생성
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  // [추가] 컴포넌트 마운트 시 저장된 아이디 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem("saveLoginId");
    if (savedId) {
      form.setValue("id", savedId); // 아이디 입력칸 채우기
      setIsSaveId(true); // 체크박스 켜기
    }
  }, [form]);

  const handleSaveId = () => {
    setIsSaveId(!isSaveId);
  };

  // 3. 로그인 처리
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // [추가] 아이디 저장 로직
    if (isSaveId) {
      localStorage.setItem("saveLoginId", values.id);
    } else {
      localStorage.removeItem("saveLoginId");
    }

    try {
      await login(values.id, values.password);
      toast.success("로그인되었습니다.");
      // 여기서 navigate를 안 해도 된다. 상태가 변하면 상위 컴포넌트가 화면을 바꾼다.
    } catch (error: any) {
      toast.error(error.message || "로그인 실패");
    }
  };

  // 4. UI 렌더링(기존 AppSidebar의 form 부분만 가져옴)
  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-6">
        <img src={icCircleLogin} alt="@login_icon" />
      </div>
      <div>
        {/* 로그인 폼 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="ID"
                      {...field}
                      className="bg-muted-foreground/10"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="bg-muted-foreground/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Checkbox
                id="checkId"
                checked={isSaveId}
                onCheckedChange={handleSaveId}
                className="rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
              />
              <Label htmlFor="checkId">아이디 저장</Label>
            </div>
            <div className="w-full flex flex-col gap-2">
              <Button
                type="submit"
                variant={"outline"}
                className="bg-blue-500 hover:bg-blue-600 hover:text-white mt-2 text-white font-semibold"
              >
                로그인
              </Button>
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <span className="cursor-pointer hover:text-blue-500">
                  <Link to="/register">회원가입</Link>
                </span>
                <span className="mx-1">·</span>
                <span className="cursor-pointer hover:text-blue-500">
                  <Link to="/auth/findIdPw">ID/PW 찾기</Link>
                </span>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
export { SidebarLogin };
