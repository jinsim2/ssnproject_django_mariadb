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
    Separator,
    toast,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@radix-ui/react-label";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const formSchema = z.object({
    id: z.string().min(4, {
        error: "올바른 ID를 입력하세요.",
    }),
    password: z.string().min(10, {
        error: "비밀번호는 최소 10글자 이상이어야 합니다.",
    }),
});

function Login() {
    const [isSaveId, setIsSaveId] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore(); // useAuthStore에서 login 함수 가져오기

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
        const savedId = localStorage.getItem("savedUserLoginId");
        if (savedId) {
            form.setValue("id", savedId); // 아이디 입력칸 채우기
            setIsSaveId(true); // 체크박스 켜기
        }
    }, [form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // [추가] 아이디 저장 로직
        if (isSaveId) {
            localStorage.setItem("savedUserLoginId", values.id);
        } else {
            localStorage.removeItem("savedUserLoginId");
        }

        try {
            await login(values.id, values.password);
            navigate("/"); // 메인 페이지로 이동
        } catch (error: any) {
            // login 함수 내부에서 에러가 발생하면 여기로 옴
            // console.error(error); // 디버깅용
            toast.error("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
        }
    };

    return (
        <main className="flex flex-col gap-6 items-center justify-center w-full min-h-[600px] py-20">
            {/* 카드 컨테이너 추가 (내용 감싸기) */}
            <div className="w-[450px] bg-white p-10 rounded-xl border border-gray-100 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                        로그인
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
                                <div className="text-[14px] text-muted-foreground cursor-pointer hover:text-blue-500">
                                    <Link to="/auth/findIdPw">ID/PW 찾기</Link>
                                </div>
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    variant={"outline"}
                                    className="text-[16px] bg-blue-500 hover:bg-blue-600 hover:text-white mt-2 text-white font-semibold rounded-4xl py-6"
                                >
                                    로그인
                                </Button>
                                <Separator className="my-4" />

                                <div className="flex flex-col items-center gap-6">
                                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                        아직 회원이 아니신가요?
                                    </h3>
                                    <Button
                                        asChild
                                        variant={"outline"}
                                        className="w-full bg-white border-2 border-blue-500 text-blue-500 text-[16px]  hover:bg-blue-600 hover:text-white font-bold rounded-4xl py-6"
                                    >
                                        <Link to="/register">회원가입</Link>
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

export { Login };
