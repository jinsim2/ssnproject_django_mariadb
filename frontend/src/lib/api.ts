import axios from 'axios';

// 환경변수에 설정된 백엔드 주소가 있으면 사용하고, 없으면 기본값인 8000번 포트로 설정합니다.
export const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 추가: 모든 API 요청 전에 실행됩니다.
client.interceptors.request.use(
    (config) => {
        // 로컬 스토리지에서 access_token을 가져옵니다.
        const token = localStorage.getItem('access_token');

        // 토큰이 존재하면 Authorization 헤더에 Bearer 타입으로 추가합니다.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 401 에러를 가로채서 토큰을 자동으로 갱신(Silent Refresh)한다.
client.interceptors.response.use(
    (response) => {
        // 성공한 응답은 그대로 통과
        return response;
    },
    async (error) => {
        // 에러가 401(권한 없음)인지 확인
        if (error.response && error.response.status == 401) {
            // 실패했던 원래의 요청 정보를 기억 (나중에 재요청하기 위해)
            const originalRequest = error.config;

            // 만약 이게 이미 토큰 갱신을 구하다가 실패한 거라면 무한 루프에 빠지지 않게 막음
            if (originalRequest.url === '/api/accounts/token/refresh/') {
                // 정말로 보안이 완전히 만료된 것이니 어쩔 수 없이 로그아웃 처리
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                return Promise.reject(error);
            }

            // 아직 재시도를 안 해봤다면? (originalRequest.retry 플래그가 없다면)
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // 로컬 스토리지에서 리프레시 토큰을 꺼냄
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        // 백엔드에 다이렉트로 토큰 재발급 요청! (끝에 / 가 반드시 있어야 합니다)
                        const res = await client.post(`${client.defaults.baseURL}/api/accounts/token/refresh/`,
                            {
                                refresh: refreshToken
                            }
                        );

                        // 새로 발급받은 access_token을 갈아끼우기
                        const newAccessToken = res.data.access;
                        localStorage.setItem("access_token", newAccessToken);

                        // 실패했던 원래 요청의 헤더를 새 토큰으로 교체
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        // 실패했던 요청을 다시 전송! (유저는 실패를 눈치채지 못한다.)
                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    // 리프레시 토큰마저 만료되었다면 쿨하게 포기하고 강제 로그아웃
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = '/';
                }

                // 401 에러가 아니거나 복구 불가능하면 그대로 에러 던짐
                return Promise.reject(error);
            }
        }

        // 권한 없음(403) 에러를 만났을 때의 처리 로직
        if (error.response && error.response.status === 403) {
            alert("관리자 권한이 없습니다. 메인 페이지로 이동합니다.");
            window.location.href = '/'; // 일반 유지 페이지로 강제 추방
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }

);
