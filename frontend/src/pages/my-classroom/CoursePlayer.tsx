import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";

function CoursePlayer() {
    const { id: enrollmentId } = useParams();
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement>(null);
    const lastPingTimeRef = useRef<number>(0); // 마지막으로 서버에 저장(Ping)한 시간 기록

    const [courseTitle, setCourseTitle] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            try {
                const res = await client.get(`/api/enrollments/list/${enrollmentId}/player_info/`);
                setCourseTitle(res.data.course_title);
                setSessions(res.data.sessions);

                if (res.data.sessions.length > 0) {
                    setCurrentSession(res.data.sessions[0]);
                }
            } catch (error) {
                console.error("플레이어 정보 로딩 실패:", error);
                alert("강의 정보를 불러오지 못했습니다.");
                navigate("/my-classroom");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayerInfo();
    }, [enrollmentId, navigate]);

    // [🔥 핵심 1] 비디오 영상이 로드되면, 이전에 보던 시간(last_position)으로 자동 점프 (이어보기)
    const handleLoadedMetadata = () => {
        if (videoRef.current && currentSession && currentSession.last_position > 0) {
            // 과거 기록이 있으면 해당 초(Second)부터 시작
            videoRef.current.currentTime = currentSession.last_position;
            // 타이머 초기화
            lastPingTimeRef.current = currentSession.last_position;
        } else {
            lastPingTimeRef.current = 0;
        }
    };

    // [🔥 핵심 1-2] 사용자가 진행바를 임의로 조작(앞/뒤로 가기)했을 때 핑 타이머를 재조정
    const handleSeeked = () => {
        if (videoRef.current) {
            lastPingTimeRef.current = videoRef.current.currentTime;
        }
    };

    // [🔥 핵심 2] 영상이 재생되는 동안 시간 업데이트마다 실행되는 함수
    const handleTimeUpdate = async () => {
        if (!videoRef.current || !currentSession) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        if (!duration) return;

        // 소수점 1자리까지 진도율 계산 (예: 45.2%)
        let currentRate = ((currentTime / duration) * 100).toFixed(1);

        // 브라우저의 소수점 오차로 인해 99.7% 등에서 멈추는 현상 방지 (99.5% 이상이면 100%로 보정)
        if (Number(currentRate) >= 99.5) {
            currentRate = "100.0";
        }

        // 짧은 영상 테스트를 위해 저장 주기를 10초로 설정
        if (currentTime - lastPingTimeRef.current >= 10 || Math.floor(currentTime) === Math.floor(duration)) {
            lastPingTimeRef.current = currentTime; // 핑 쏜 시간 갱신

            // 95% 이상 시청했다면 '완강' 처리
            const isCompleted = Number(currentRate) >= 95;

            try {
                // 백엔드의 update_progress API로 데이터 쏘기
                await client.post(`/api/enrollments/list/${enrollmentId}/update_progress/`, {
                    session_id: currentSession.session_id,
                    last_position: Math.floor(currentTime),
                    progress_rate: currentRate,
                    is_completed: isCompleted
                });

                // 프론트엔드 우측 목차 UI에도 바뀐 진도율 실시간 적용
                setSessions(prev => prev.map(s =>
                    s.session_id === currentSession.session_id
                        ? { ...s, progress_rate: currentRate, is_completed: isCompleted || s.is_completed }
                        : s
                ));
            } catch (err) {
                console.error("진도 저장 실패", err);
            }
        }
    };

    // [🔥 핵심 3] 영상이 완전히 끝까지 재생되었을 때 확실하게 100% 도장을 찍어주는 이벤트
    const handleEnded = async () => {
        if (!currentSession || !videoRef.current) return;

        try {
            await client.post(`/api/enrollments/list/${enrollmentId}/update_progress/`, {
                session_id: currentSession.session_id,
                last_position: Math.floor(videoRef.current.duration),
                progress_rate: 100.0,
                is_completed: true
            });

            setSessions(prev => prev.map(s =>
                s.session_id === currentSession.session_id
                    ? { ...s, progress_rate: "100.0", is_completed: true }
                    : s
            ));
        } catch (err) {
            console.error("완강 처리 실패", err);
        }
    };

    const changeSession = (session: any) => {
        setCurrentSession(session);
        lastPingTimeRef.current = 0; // 영상이 바뀌면 타이머 리셋
    };

    if (isLoading) return <div className="text-center py-20 text-slate-200">플레이어 로딩 중...</div>;
    if (!currentSession) return <div className="text-center py-20 text-slate-200">등록된 영상 차시가 없습니다.</div>;

    const secureVideoUrl = currentSession.video_url || "https://www.w3schools.com/html/mov_bbb.mp4";

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
            {/* 좌측: 비디오 플레이어 영역 */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute top-0 w-full z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
                    <h2 className="text-xl font-bold">{courseTitle} - {currentSession.session_name}</h2>
                    <Button variant="outline" onClick={() => navigate("/my-classroom")} className="text-black bg-white/90 hover:bg-white border-0">
                        강의실 나가기
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-center bg-black relative">
                    <video
                        key={currentSession.session_id}
                        ref={videoRef}
                        className="w-full h-full outline-none"
                        controls
                        controlsList="nodownload"
                        autoPlay={false}
                        src={secureVideoUrl}
                        onLoadedMetadata={handleLoadedMetadata}
                        onSeeked={handleSeeked}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                    />
                </div>
            </div>

            {/* 우측: 강의 목차 영역 */}
            <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
                <div className="p-5 border-b border-slate-800 bg-slate-900">
                    <h3 className="text-lg font-bold text-white">강의 목차</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                    {sessions.map((session, index) => (
                        <div
                            key={session.session_id}
                            onClick={() => changeSession(session)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${currentSession.session_id === session.session_id
                                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50'
                                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                                }`}
                        >
                            <p className="text-sm font-semibold line-clamp-2 text-white mb-3">
                                {index + 1}. {session.session_name}
                            </p>

                            <div className="w-full bg-slate-900 rounded-full h-1.5 mb-2 overflow-hidden">
                                <div className="bg-green-400 h-1.5" style={{ width: `${session.progress_rate}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-slate-300">
                                <span>{session.progress_rate}% 수강</span>
                                {session.is_completed && <span className="text-green-400 font-bold px-2 py-0.5 bg-green-400/10 rounded">수료</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export { CoursePlayer }