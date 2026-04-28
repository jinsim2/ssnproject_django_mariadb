import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";

interface EnrollmentItem {
    enrollment_id: number;
    course_title: string;
    course_type: string;
    enrollment_status: string;
    enrollment_date: string;
    is_completed: boolean;
}

function MyClassroom() {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyEnrollments = async () => {
            try {
                // EnrollmentViewSet 의 라우터 주소는 '/api/enrollments/list/' 입니다!
                const res = await client.get("/api/enrollments/list/");
                setEnrollments(res.data);
            } catch (error) {
                console.error("수강 목록 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyEnrollments();
    }, []);

    // 취소나 환불 상태가 아닌, 현재 수강 가능한 강좌들만 필터링합니다.
    // [버그 픽스] 과거 테스트 과정에서 생성된 중복 수강권들을 방어하기 위해 고유한(unique) 과정만 남깁니다.
    const uniqueEnrollments = Array.from(
        new Map(enrollments.map(e => [e.course_title, e])).values()
    );

    const activeCourses = uniqueEnrollments.filter(e => !e.is_completed && !['cancelled', 'rejected'].includes(e.enrollment_status));
    const completedCourses = uniqueEnrollments.filter(e => e.is_completed);

    return (
        <div className="max-w-5xl mx-auto py-16 px-4">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">나의 강의실</h2>

            {isLoading ? (
                <div className="text-center py-20 text-slate-500">로딩 중...</div>
            ) : enrollments.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg">
                    <p className="text-slate-500 mb-4">현재 보유 중인 수강권이 없습니다.</p>
                    <Button onClick={() => navigate("/")} variant="outline">강좌 둘러보기</Button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* 1. 수강 중인 강좌 섹션 */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-blue-700">수강 중인 강좌</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCourses.length > 0 ? activeCourses.map(course => (
                                <div key={course.enrollment_id} className="border rounded-xl p-5 shadow-sm bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                                                {course.course_type.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {course.enrollment_date.split('T')[0]} 신청
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-lg text-slate-800 mb-4 line-clamp-2">
                                            {course.course_title}
                                        </h4>
                                    </div>
                                    <Button
                                        className="w-full mt-4"
                                        // 다음 Step에서 만들 비디오 플레이어 주소로 이동합니다!
                                        onClick={() => navigate(`/my-classroom/player/${course.enrollment_id}`)}
                                    >
                                        강의실 입장
                                    </Button>
                                </div>
                            )) : (
                                <p className="text-slate-500 col-span-full">현재 수강 중인 강좌가 없습니다.</p>
                            )}
                        </div>
                    </section>

                    {/* 2. 수료 완료 강좌 섹션 */}
                    {completedCourses.length > 0 && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4 text-slate-500">수료 완료 강좌</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                                {completedCourses.map(course => (
                                    <div key={course.enrollment_id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-600 mb-2 line-clamp-2">
                                                {course.course_title}
                                            </h4>
                                            <span className="text-xs text-green-600 font-medium">수료 완료</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full mt-4"
                                            onClick={() => navigate(`/my-classroom/player/${course.enrollment_id}`)}
                                        >
                                            복습하기
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

export { MyClassroom }