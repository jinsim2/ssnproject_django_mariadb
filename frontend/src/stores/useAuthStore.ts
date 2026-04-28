import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { client } from "@/lib/api";

interface User {
    id: number;
    login_id: string;
    email: string;
    full_name: string;
    user_type: string;
    company_name?: string | null;

    is_superuser: boolean;
    is_admin: boolean;
    current_ip: string;
    last_login: string | null;
    // 필요한 필드 더 추가 가능
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    // isAdminLogin: true -> 관리자 로그인, false -> 일반 유저 로그인
    login: (loginId: string, loginPw: string, isAdminLogin?: boolean) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: async (loginId, loginPw, isAdminLogin = false) => {
                try {
                    // 1. 로그인 요청 (토큰 발급, 일반 로그인이냐, 관리자 전용 로그인냐에 따라 목적지 URL을 바꾼다! 단, 끝에 / 를 반드시 붙여야 합니다!)
                    const loginEndpoint = isAdminLogin ? "/api/accounts/admin/login/" : "/api/accounts/login/";

                    // Django DRF SimpleJWT는 기본적으로 JSON (`{"login_id": "...", "password": "..."}`) 형식을 사용합니다.
                    const tokenResponse = await client.post(loginEndpoint, {
                        login_id: loginId,
                        password: loginPw,
                    });

                    // 발급된 access 토큰 가져오기
                    const accessToken = tokenResponse.data.access;

                    // 인터셉터(client)가 쓸 수 있도록 로컬 스토리지에 access_token 명시적 저장
                    localStorage.setItem("access_token", accessToken);

                    // (선택) Refresh 토큰도 필요하다면 여기서 localStorage에 직접 저장하거나 상태에 추가할 수 있습니다.
                    localStorage.setItem("refresh_token", tokenResponse.data.refresh);

                    // 2. 토큰을 이용해 내 정보 조회 요청
                    // JWT 인터셉터가 api.ts에 설정되어 있기 때문에 토큰을 직접 담을 필요가 없을 수도 있지만,
                    // 인터셉터는 보통 localStorage의 토큰을 읽으므로, 여기서는 방금 발급받은 토큰을 헤더에 명시적으로 실어줍니다.
                    const userResponse = await client.get("/api/accounts/me/", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    // 3. 상태 업데이트 (로그인 성공)
                    set({
                        token: accessToken,
                        user: userResponse.data,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error("Login Failed:", error);
                    throw error; // 컴포넌트에서 에러 처리를 할 수 있게 던져줌
                }
            },

            logout: () => {
                // 로그아웃 시 스토리지에 있는 토큰들도 함께 날려줍니다.
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                set({ token: null, user: null, isAuthenticated: false });
            },
        }),
        {
            name: "auth-storage", // 로컬 스토리지에 저장될 키 이름
            storage: createJSONStorage(() => localStorage),
        }
    )
);
