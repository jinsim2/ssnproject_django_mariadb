import { useEffect, useState } from "react";
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Checkbox, Separator, toast, } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@radix-ui/react-label";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { School } from "lucide-react";

const formSchema = z.object({
    id: z.string().min(4, {
        error: "올바른 ID를 입력하세요.",
    }),
    password: z.string().min(10, {
        error: "비밀번호는 최소 10글자 이상이어야 합니다.",
    }),
});

function AdminLogin() {
    const [isSaveId, setIsSaveId] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuthStore(); // useAuthStore에서 login 함수 가져오기

    const handleSaveId = () => {
        setIsSaveId(!isSaveId);
    };

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

    // [추가] 로그인 유무 파악 핸들러 함수
    const handleRegisterClick = () => {
        if (!isAuthenticated) {
            // 1. 로그인이 안 되어 있다면
            toast.error("로그인이 필요한 서비스입니다.");
            navigate("/auth/login"); // 로그인 페이지로 이동
        } else {
            // 2. 로그인이 되어 있다면
            navigate("/instiution/register"); // 교육기관 신청 페이지로 이동
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // [추가] 아이디 저장 로직
        if (isSaveId) {
            localStorage.setItem("savedLoginId", values.id);
        } else {
            localStorage.removeItem("savedLoginId");
        }

        try {
            // isAdminLogin 파라미터 자리에 true를 넣어 호출한다.
            await login(values.id, values.password, true);
            toast.success("관리자님 환영합니다!");
            navigate("/admin"); // 관리자 페이지로 이동
        } catch (error: any) {
            // 만약 여기서 "관리자 권한이 없습니다" 에러(401)가 떨어지면 캐치해서 토스트로 띄운다.
            toast.error("아이디/비밀번호 혹은 관리자 권한을 확인해주세요!");
        }
    };

    return (
        <main className="flex flex-col gap-6 items-center justify-center w-full min-h-[600px] py-20">
            {/* 카드 컨테이너 추가 (내용 감싸기) */}
            <div className="w-[450px] bg-white p-10 rounded-xl border border-gray-100 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                        관리자 로그인
                    </h1>
                </div>
                <div className="w-full">
                    {/* 로그인 폼 */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="아이디"
                                                {...field}
                                                className="bg-muted-foreground/10 py-6"
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
                                                placeholder="비밀번호"
                                                className="bg-muted-foreground/10 py-6"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[14px] text-muted-foreground">
                                    <Checkbox
                                        id="checkId"
                                        checked={isSaveId}
                                        onCheckedChange={handleSaveId}
                                        className="w-[18px] h-[18px] rounded-[5px] border-[#e9e9e9] data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                                    />
                                    <Label htmlFor="checkId">아이디 저장</Label>
                                </div>
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    variant={"outline"}
                                    className="text-[16px] bg-blue-500 hover:bg-blue-600 hover:text-white mt-2 text-white font-semibold rounded-xl py-6"
                                >
                                    로그인
                                </Button>
                                <Separator className="my-4" />

                                <div className="flex items-center gap-6">
                                    <Button
                                        variant={"outline"}
                                        onClick={handleRegisterClick}
                                        className="w-full bg-white border-2 border-blue-500 text-blue-500 text-[16px]  hover:bg-blue-600 hover:text-white font-bold rounded-xl py-6"
                                    >
                                        <School />
                                        <span>교육기관/관리자 신청하기</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </main>
    );
}

export { AdminLogin };