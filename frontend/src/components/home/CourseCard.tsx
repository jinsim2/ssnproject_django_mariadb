import { Badge, Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui";
import { Button } from "@/components/ui/button"; // 방금 추가된 버튼
import { Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import { client } from "@/lib/api"; // 통신용 API 추가

export interface CourseProps {
    id: string; // 기존에 화면용으로 쓰던 문자열 코드 (UI 라우팅용)
    course_id?: number; // 새로 추가! (백엔드 장바구니 전송용 DB 실제 PK)
    title: string;
    category: string;
    description: string;
    thumbnailUrl: string;
    status: "reception" | "closed" | "upcoming";
}

function CourseCard({ course }: { course: CourseProps }) {
    const navigate = useNavigate();
    const statusBadges = {
        reception: { label: "접수중", variant: "default" as const },
        closed: { label: "마감", variant: "destructive" as const },
        upcoming: { label: "오픈예정", variant: "secondary" as const },
    };
    const badgeInfo = statusBadges[course.status];

    // 장바구니 담기 클릭 이벤트
    const handleAddToCart = async (e: React.MouseEvent) => {
        // 부모 태그인 <Link> 의 이동 이벤트를 막기 위해 반드시 필요합니다!
        e.preventDefault();

        try {
            // 백엔드의 CartViewSet(POST /api/enrollments/carts/) 로 강좌 ID 전송
            // ModelViewSet 이 제공하는 자동 생성(Create) API 입니다!
            // 문자열 id("WEB101") 대신 DB 진짜 번호(course.course_id)를 보낸다.
            await client.post("/api/enrollments/carts/", {
                course: course.course_id
            });

            const goCart = window.confirm("장바구니에 강좌가 담겼습니다! 지금 장바구니로 이동하시겠습니까?");
            if (goCart) {
                navigate("/cart");
            }
        } catch (error: any) {
            console.error("장바구니 담기 에러:", error);
            // 401: 로그인이 안되었을 때, 400: 이미 담긴 강좌일 때 등 처리
            if (error.response?.status === 401) {
                alert("로그인이 필요한 서비스입니다.");
                navigate("/auth/login");
            } else if (error.response?.data?.message) {
                // 백엔드에서 보낸 에러 메시지(중복 담기 등)를 그대로 출력합니다!
                alert(error.response.data.message);
            } else {
                alert("장바구니 담기에 실패했습니다.");
            }
        }
    };

    return (
        <Link to={`/job/detail/${course.id}`} className="block h-full">
            <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-contain w-full h-full transition-transform hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                    </div>
                </div>
                <CardHeader className="p-4 pb-2">
                    <div className="text-xs text-blue-500 mb-1">{course.category}</div>
                    <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]" title={course.title}>
                        {course.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0" />
                {/* 하단 버튼 영역 신설 */}
                <CardFooter className="p-4 pt-0">
                    <Button
                        onClick={handleAddToCart}
                        className="w-full bg-slate-800 hover:bg-slate-700"
                    >
                        장바구니 담기
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}

export { CourseCard }