import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Button,
    Input,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@/components/ui";
import { AddressModal } from "@/components/common";
import { client } from "@/lib/api";
import { toast } from "@/components/ui";

// 1. 유효성 검사 스키마 정의
const registerSchema = z
    .object({
        // --- 회원 정보 ---
        // [고정값 - Step2에서 전달받음]
        name: z.string(),
        birthDate: z.string(),
        gender: z.string(),
        mobile: z.string(),

        // [입력값 - 유효성 검사 필요]
        userId: z
            .string()
            .min(4, "아이디는 4글자 이상이어야 합니다.")
            .max(20, "아이디는 20글자 이하여야 합니다.")
            .regex(/^[a-zA-Z0-9]+$/, "영문와 숫자만 입력 가능합니다."),

        password: z
            .string()
            .min(10, "비밀번호는 10자리 이상이어야 합니다.")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                "영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다."
            ),

        passwordConfirm: z.string(),

        emailId: z.string().min(1, "이메일 아이디를 입력해주세요."),
        emailDomain: z.string().min(1, "도메인을 입력하거나 선택해주세요."),

        // --- 회사 정보 ---
        companyName: z.string().optional().or(z.literal("")),
        department: z.string().optional().or(z.literal("")),
        position: z.string().optional().or(z.literal("")),
        businessRegNo: z
            .string()
            .regex(/^\d+$/, "사업자등록번호는 숫자만 입력 가능합니다.")
            .length(10, "사업자번호 10자리를 입력해주세요.")
            .optional()
            .or(z.literal("")),
        companyZipcode: z.string().optional().or(z.literal("")),
        companyAddress: z.string().optional().or(z.literal("")),
        companyAddressDetail: z.string().optional().or(z.literal("")),
        companyPhone: z
            .string()
            .regex(/^\d+$/, "전화번호는 숫자만 입력 가능합니다.")
            .optional()
            .or(z.literal("")),
        companyEmailId: z.string().optional().or(z.literal("")),
        companyEmailDomain: z.string().optional().or(z.literal("")),
    })
    .superRefine(({ password, passwordConfirm }, ctx) => {
        if (password !== passwordConfirm) {
            ctx.addIssue({
                code: "custom",
                message: "비밀번호가 일치하지 않습니다.",
                path: ["passwordConfirm"],
            });
        }
    });

function RegisterStep3() {
    const navigate = useNavigate();
    const location = useLocation();

    // 주소 모달 열림/닫힘 상태
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // 주소 선택 완료 시 실행될 함수
    const handleAddressComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = "";

        // 1. 법정동명이 있을 경우 추가
        if (data.addressType === "R") {
            extraAddress += data.bname;
        }

        // 2. 건물명이 있을 경우 쉼표(,)로 구분하여 추가
        if (data.buildingName !== "") {
            extraAddress +=
                extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
        }

        // 3. 최종적으로 괄호로 감싸서 합치기
        fullAddress += extraAddress !== "" ? `(${extraAddress})` : "";

        // 폼에 값 설정
        form.setValue("companyZipcode", data.zonecode);
        form.setValue("companyAddress", fullAddress);

        // 상세주소 입력창으로 포커스 이동 (선택사항)
        form.setFocus("companyAddressDetail");
    };

    // step2에서 넘겨준 데이터 받기
    const { memberType, agreements, userInfo } = location.state || {}; // authMethod 등

    // 방어 코드
    if (!memberType) {
        return <Navigate to="/register" replace />;
    }

    // 폼 생성
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            // 받아온 데이터로 초기값 설정(비활성화 필드)
            name: userInfo?.name || "",
            birthDate: userInfo?.birthDate || "",
            gender: userInfo?.gender || "male",
            mobile: userInfo?.mobile || "",

            // 나머지 필드 초기값
            userId: "",
            password: "",
            passwordConfirm: "",
            emailId: "",
            emailDomain: "",
            companyName: "",
            department: "",
            position: "",
            businessRegNo: "",
            companyZipcode: "",
            companyAddress: "",
            companyAddressDetail: "",
            companyPhone: "",
            companyEmailId: "",
            companyEmailDomain: "",
        },
    });

    // 아이디 중복 확인 핸들러
    const handleCheckId = async () => {
        const userId = form.getValues("userId");

        // 간단한 유효성 검사 (입력 여부만)
        if (!userId) {
            toast.error("아이디를 입력해주세요.");
            form.setFocus("userId");
            return;
        }

        try {
            // API 호출
            const response = await client.post("/api/accounts/check-id/", {
                login_id: userId,
            });

            if (response.data.is_available) {
                toast.success(response.data.message); // "사용 가능한 아이디입니다."
                form.clearErrors("userId"); // 에러 상태를 명시적으로 제거!
            } else {
                toast.error(response.data.message); // "이미 사용 중인 아이디입니다."
                form.setError("userId", { message: response.data.message }); // 폼 에러로도 표시
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 이메일 중복 확인 핸들러
    const handleCheckEmail = async () => {
        const emailId = form.getValues("emailId");
        const emailDomain = form.getValues("emailDomain");
        if (!emailId || !emailDomain) {
            toast.error("이메일을 모두 입력해주세요.");

            // 입력 안 된 곳으로 포커스 이동
            if (!emailId) form.setFocus("emailId");
            else if (!emailDomain) form.setFocus("emailDomain");
            return;
        }
        const fullEmail = `${emailId}@${emailDomain}`;
        try {
            const response = await client.post("/api/accounts/check-email/", {
                email: fullEmail,
            });
            if (response.data.is_available) {
                toast.success(response.data.message);
                form.clearErrors("emailId");
                form.clearErrors("emailDomain");
                // 필요하다면 여기서 form.clearErrors("emailId") 등을 할 수 있습니다.
            } else {
                toast.error(response.data.message);
                form.setError("emailId", { message: "이미 사용 중인 이메일입니다." });
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "이메일 중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 폼 제출 핸들러
    async function onSubmit(data: z.infer<typeof registerSchema>) {
        try {
            // 1. 데이터 조립 (Frontend -> Backend 스키마 매핑)
            const requestData = {
                login_id: data.userId,
                password: data.password,
                email: `${data.emailId}@${data.emailDomain}`,
                full_name: data.name,
                phone: data.mobile,
                address: "", // 개인 주소는 현재 폼에 없으므로 빈 값 또는 null로 처리
                user_type: memberType,

                // 선택 정보 (빈 문자열이면 undefiend나 null로 처리)
                company_name: data.companyName || null,
                department: data.department || null,
                position: data.position || null,
                biz_reg_no: data.businessRegNo || null,
                company_phone: data.companyPhone || null,
                company_zipcode: data.companyZipcode || null,
                company_address: data.companyAddress
                    ? `${data.companyAddress} ${data.companyAddressDetail || ""}`.trim()
                    : null,
                company_email:
                    data.companyEmailId && data.companyEmailDomain
                        ? `${data.companyEmailId}@${data.companyEmailDomain}`
                        : null,

                // 기타 약관 동의/본인인증 정보 등은 필요시 추가
                is_active: true,
                is_varified: true, // step 2를 통과했다고 가정
            };

            // 2. API 호출
            await client.post("/api/accounts/register/", requestData);

            // 3. 성공 시 완료 페이지로 이동
            toast.success("회원가입이 완료되었습니다.");
            navigate("/register/step4", {
                state: {
                    memberType,
                    name: data.name, // 완료 페이지에서 이름을 보여주기 위해
                },
            });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "회원가입 중 오류가 발생했습니다.");
        }
    }

    // 이메일 도메인 선택 핸들러
    // fieldName을 인자로 받아서 해당 필드를 업데이트하는 함수 구현
    const handleDomainChange =
        (
            fieldName: "emailDomain" | "companyEmailDomain" // 타입 안정성 확보
        ) =>
            (e: React.ChangeEvent<HTMLSelectElement>) => {
                const value = e.target.value;
                if (value !== "other") {
                    form.setValue(fieldName, value); /// 동적으로 필드 업데이트
                } else {
                    form.setValue(fieldName, "");
                }
            };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full py-20 bg-white">
            <div className="w-full max-w-[1000px] px-4">
                {/* 타이틀 */}
                <div className="text-center mb-[50px]">
                    <h3 className="text-4xl font-bold text-[#333]">회원가입</h3>
                </div>

                {/* Step Indicator (3단계 활성화) */}
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
                    <li className="flex items-center gap-[10px] text-blue-500">
                        <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-blue-500 text-white font-bold not-italic">
                            3
                        </i>
                        <span className="text-[17px] font-semibold">회원정보입력</span>
                    </li>
                    <li className="flex items-center gap-[10px] text-[#555]">
                        <i className="flex justify-center items-center w-[30px] h-[30px] rounded-full bg-[#ddd] text-[#999] font-bold not-italic">
                            4
                        </i>
                        <span className="text-[17px] font-semibold">가입완료</span>
                    </li>
                </ul>

                {/* 회원정보 입력 폼 - Shadcn Form UI로 대체 */}
                <div className="w-full max-w-[1000px] mx-auto py-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {/* ================= 섹션 1: 회원정보 ================= */}
                            <div className="mb-[70px]">
                                <h3 className="text-[22px] font-bold text-[#222] mb-[15px]">
                                    회원정보
                                </h3>
                                <div className="border-t-2 border-[#111]">
                                    {/* 이름 */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        이름
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="이름을 입력하세요."
                                                                className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9] text-[15px] text-[#333] bg-gray-100 cursor-not-allowed"
                                                                disabled={true}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 생년월일 */}
                                    <FormField
                                        control={form.control}
                                        name="birthDate"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        생년월일
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="생년월일 8자리를 입력하세요."
                                                                maxLength={8}
                                                                className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9] text-[15px] text-[#333] bg-gray-100 cursor-not-allowed"
                                                                disabled={true}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 성별 (커스텀 라디오 버튼) */}
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        성별
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="flex gap-[10px] w-[300px]">
                                                                {/* 남자 */}
                                                                <div className="flex-1 relative h-[46px]">
                                                                    <input
                                                                        type="radio"
                                                                        id="gender-male"
                                                                        value="male"
                                                                        checked={field.value === "male"}
                                                                        // onChange={field.onChange}
                                                                        disabled={true}
                                                                        className="peer absolute opacity-0 w-0 h-0"
                                                                    />
                                                                    <label
                                                                        htmlFor="gender-male"
                                                                        className="flex items-center justify-center w-full h-full text-[15px] text-[#222] border border-[#ddd] rounded-[6px] cursor-not-allowed peer-checked:bg-white peer-checked:text-blue-500 peer-checked:border-blue-500 transition-colors"
                                                                    >
                                                                        남자
                                                                    </label>
                                                                </div>
                                                                {/* 여자 */}
                                                                <div className="flex-1 relative h-[46px]">
                                                                    <input
                                                                        type="radio"
                                                                        id="gender-female"
                                                                        value="female"
                                                                        checked={field.value === "female"}
                                                                        // onChange={field.onChange}
                                                                        disabled={true}
                                                                        className="peer absolute opacity-0 w-0 h-0"
                                                                    />
                                                                    <label
                                                                        htmlFor="gender-female"
                                                                        className="flex items-center justify-center w-full h-full text-[15px] text-[#222] border border-[#ddd] rounded-[6px] cursor-not-allowed peer-checked:bg-white peer-checked:text-blue-500 peer-checked:border-blue-500 transition-colors"
                                                                    >
                                                                        여자
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 아이디 */}
                                    <FormField
                                        control={form.control}
                                        name="userId"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        아이디
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <div className="flex items-center gap-[10px]">
                                                            <FormControl>
                                                                <Input
                                                                    className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9] text-[15px] text-[#333]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <Button
                                                                type="button"
                                                                onClick={handleCheckId}
                                                                className="flex justify-center items-center min-w-[80px] h-[45px] px-[15px] rounded-[5px] bg-[#334559] text-[14px] text-white hover:bg-[#2a3a4b]"
                                                            >
                                                                중복확인
                                                            </Button>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 비밀번호 */}
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        비밀번호
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9] text-[15px] text-[#333]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 비밀번호 확인 */}
                                    <FormField
                                        control={form.control}
                                        name="passwordConfirm"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        비밀번호확인
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9] text-[15px] text-[#333]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        {/* Zod superRefine 에러가 여기에 표시됨 */}
                                                        <FormMessage />
                                                        <div className="text-[12px] font-medium text-[#1968db]">
                                                            <i className="relative mr-[3px] top-[2px]">*</i>
                                                            10자리 이상의 영문 대/소문자, 숫자, 특수문자
                                                            조합으로 입력해주세요.
                                                        </div>
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 이메일 (복합 필드) */}
                                    <div className="flex items-center py-[15px] border-b border-[#eee]">
                                        <div className="w-[150px]">
                                            <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                이메일
                                                <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                    *
                                                </i>
                                            </FormLabel>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start gap-[6px]">
                                                {/* Email ID */}
                                                <FormField
                                                    control={form.control}
                                                    name="emailId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-[220px] h-[45px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <span className="text-[#333] mt-2">@</span>
                                                {/* Email Domain */}
                                                <FormField
                                                    control={form.control}
                                                    name="emailDomain"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-[220px] h-[45px]"
                                                                    placeholder="직접 입력"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {/* Domain Select Helper */}
                                                <select
                                                    onChange={handleDomainChange("emailDomain")}
                                                    className="block p-[10px] w-[220px] h-[45px] rounded-[5px] border border-[#e9e9e9]"
                                                >
                                                    <option value="other">직접입력</option>
                                                    <option value="naver.com">naver.com</option>
                                                    <option value="hanmail.net">hanmail.net</option>
                                                    <option value="daum.net">daum.net</option>
                                                    <option value="gmail.com">gmail.com</option>
                                                    <option value="hotmail.com">hotmail.com</option>
                                                    <option value="nate.com">nate.com</option>
                                                </select>
                                                <Button
                                                    type="button"
                                                    onClick={handleCheckEmail}
                                                    className="h-[45px] bg-[#334559] hover:bg-[#2a3a4b]"
                                                >
                                                    중복확인
                                                </Button>
                                            </div>
                                            {/* 에러 메시지 통합 표시를 위해 임의의 위치에 배치하거나 각 필드 아래 배치 가능 */}
                                            {/* <div className="flex gap-4 mt-1">
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.emailId?.message}
                        </p>
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.emailDomain?.message}
                        </p>
                      </div> */}
                                            <div className="text-[12px] font-medium text-[#1968db]">
                                                <i className="relative mr-[3px] top-[2px]">*</i>
                                                아이디/비밀번호 찾을 때 필요한 정보이므로 정확히
                                                입력해주세요.
                                            </div>
                                        </div>
                                    </div>

                                    {/* 휴대폰번호 */}
                                    <FormField
                                        control={form.control}
                                        name="mobile"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        휴대폰번호
                                                        <i className="absolute -top-[5px] -right-[10px] text-red-500 not-italic">
                                                            *
                                                        </i>
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="tel"
                                                                className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9] bg-gray-100 cursor-not-allowed"
                                                                disabled={true}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* ================= 섹션 2: 회사(기관) 정보 ================= */}
                            <div className="mb-[70px]">
                                <h3 className="text-[22px] font-bold text-[#222] mb-[15px]">
                                    회사(기관)정보 (선택)
                                </h3>
                                <div className="border-t-2 border-[#111]">
                                    {/* 회사명 / 부서 / 직급 */}
                                    <div className="flex items-center py-[15px] border-b border-[#eee]">
                                        <div className="w-[150px]">
                                            <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                회사(기관명)
                                            </FormLabel>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start gap-[10px]">
                                                <FormField
                                                    control={form.control}
                                                    name="companyName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="회사(기관)명"
                                                                    className="w-[300px] h-[45px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="department"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="부서명"
                                                                    className="w-[200px] h-[45px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="position"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="직급"
                                                                    className="w-[200px] h-[45px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 사업자등록번호 */}
                                    <FormField
                                        control={form.control}
                                        name="businessRegNo"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        사업자등록번호
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="'-'을 제외한 숫자만 입력하세요."
                                                                className="w-[300px] h-[45px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 회사 주소 (UI 구현) */}
                                    <div className="flex items-center py-[15px] border-b border-[#eee]">
                                        <div className="w-[150px]">
                                            <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                회사(기관) 주소
                                            </FormLabel>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-[10px]">
                                            <div className="flex items-center gap-[10px]">
                                                {/* 우편번호 */}
                                                <FormField
                                                    control={form.control}
                                                    name="companyZipcode"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 max-w-[200px]">
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    readOnly
                                                                    placeholder="우편번호"
                                                                    className="bg-gray-50"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                {/* 주소 검색 버튼 */}
                                                <Button
                                                    type="button"
                                                    onClick={() => setIsAddressModalOpen(true)} // 클릭 시 모달 열기
                                                    className="h-[35px] bg-[#334559] hover:bg-[#2a3a4b]"
                                                >
                                                    도로명검색
                                                </Button>
                                            </div>
                                            {/* 기본 주소 */}
                                            <FormField
                                                control={form.control}
                                                name="companyAddress"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                placeholder="기본 주소"
                                                                className="bg-gray-50"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* 상세 주소 */}
                                            <FormField
                                                control={form.control}
                                                name="companyAddressDetail"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="상세주소를 입력하세요."
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* 회사(기관) 전화 */}
                                    <FormField
                                        control={form.control}
                                        name="companyPhone"
                                        render={({ field }) => (
                                            <div className="flex items-center py-[15px] border-b border-[#eee]">
                                                <div className="w-[150px]">
                                                    <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                        회사(기관) 전화
                                                    </FormLabel>
                                                </div>
                                                <div className="flex-1">
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="tel"
                                                                className="block p-[10px] w-[300px] h-[45px] rounded-[5px] border border-[#e9e9e9]"
                                                                placeholder="'-'없이 숫자만 입력"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {/* 회사(기관) 이메일 (복합 필드) */}
                                    <div className="flex items-center py-[15px] border-b border-[#eee]">
                                        <div className="w-[150px]">
                                            <FormLabel className="font-bold text-[16px] text-[#222] relative inline-block">
                                                회사(기관) 이메일
                                            </FormLabel>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start gap-[6px]">
                                                {/* Email ID */}
                                                <FormField
                                                    control={form.control}
                                                    name="companyEmailId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-[260px] h-[45px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <span className="text-[#333] mt-2">@</span>
                                                {/* Email Domain */}
                                                <FormField
                                                    control={form.control}
                                                    name="companyEmailDomain"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-[260px] h-[45px]"
                                                                    placeholder="직접 입력"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                {/* Domain Select Helper */}
                                                <select
                                                    onChange={handleDomainChange("companyEmailDomain")}
                                                    className="block p-[10px] w-[260px] h-[45px] rounded-[5px] border border-[#e9e9e9]"
                                                >
                                                    <option value="other">직접입력</option>
                                                    <option value="naver.com">naver.com</option>
                                                    <option value="hanmail.net">hanmail.net</option>
                                                    <option value="daum.net">daum.net</option>
                                                    <option value="gmail.com">gmail.com</option>
                                                    <option value="hotmail.com">hotmail.com</option>
                                                    <option value="nate.com">nate.com</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 버튼 영역 */}
                            <div className="flex justify-center gap-[10px] mt-[50px]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="min-w-[200px] h-[60px] rounded-full bg-gray-200 text-[#222] text-[18px] hover:bg-[#f9f9f9]"
                                    onClick={() => console.log("취소")}
                                >
                                    취소
                                </Button>
                                <Button
                                    type="submit"
                                    className="min-w-[200px] h-[60px] rounded-full bg-blue-500 text-[18px] hover:bg-blue-600"
                                >
                                    회원가입
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
            {/* 주소 검색 모달 */}
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onComplete={handleAddressComplete}
            />
        </div>
    );
}
export { RegisterStep3 };
