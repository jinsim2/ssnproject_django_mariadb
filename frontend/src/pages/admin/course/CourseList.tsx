import { useEffect, useState } from "react";
import { client } from "@/lib/api";

// 1. 모델 세팅 (장고 ListSerializer가 내려주는 데이터)
interface Course {
    course_id: number;
    id: string; // course_code
    title: string;
    category: string;
    description: string;
    thumbnailUrl: string;
    status: string; // upcoming, reception, closed
    institution_name: string;
    course_status: string;
    price: number;
}

function CourseList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    // 체크박스 상태
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const tabs = [
        { id: "all", label: "전체 강좌" },
        { id: "online", label: "온라인 강좌" },
        { id: "offline", label: "오프라인 강좌" },
        { id: "package", label: "패키지 강좌" },
    ];

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const query = activeTab === "all" ? "" : `?course_type=${activeTab}`;
                const res = await client.get(`/api/courses/courses/${query}`);
                setCourses(res.data.results || res.data);
                // 탭 바뀔 때 체크박스 초기화
                setSelectAll(false);
                setSelectedIds([]);
            } catch (error) {
                console.error("강좌 데이터 호출 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [activeTab]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectAll(e.target.checked);
        if (e.target.checked) setSelectedIds(courses.map(c => c.course_id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) setSelectedIds(prev => [...prev, id]);
        else {
            setSelectedIds(prev => prev.filter(item => item !== id));
            setSelectAll(false);
        }
    };

    // 상태를 예쁜 컬러 뱃지로 바꿔주는 함수
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "reception":
                return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">모집중</span>;
            case "closed":
                return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">마감</span>;
            case "upcoming":
                return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">오픈예정</span>;
            default:
                return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 타이틀 및 탭 영역 묶음 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">강좌 관리</h1>
                            <p className="text-sm text-slate-500 mt-1">플랫폼에 등록된 전체 B2B 강좌를 관리합니다.</p>
                        </div>
                        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                            + 신규 강좌 개설
                        </button>
                    </div>

                    {/* 탭 버튼 */}
                    <div className="flex space-x-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 메인 데이터 테이블 구역 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                                <th className="py-4 px-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-4 px-4 font-semibold w-24">썸네일</th>
                                <th className="py-4 px-6 font-semibold min-w-[250px]">강좌 정보</th>
                                <th className="py-4 px-6 font-semibold w-32 text-right">수강료</th>
                                <th className="py-4 px-6 font-semibold w-32 text-center">모집 상태</th>
                                <th className="py-4 px-6 font-semibold w-40 text-center">개설 기관</th>
                                <th className="py-4 px-6 font-semibold text-center w-24">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <div className="animate-pulse">강좌 데이터를 불러오는 중입니다...</div>
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        등록된 강좌가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.course_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4 text-center align-middle">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={selectedIds.includes(course.course_id)}
                                                onChange={(e) => handleSelectOne(e, course.course_id)}
                                            />
                                        </td>
                                        <td className="py-4 px-4 align-middle">
                                            <div className="w-16 h-12 rounded-md overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                                <img src={course.thumbnailUrl} alt="강좌 썸네일" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-middle">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    {course.category || '카테고리 없음'}
                                                </span>
                                                <span className="text-xs text-slate-400">{course.id}</span>
                                            </div>
                                            <div className="font-bold text-slate-800 text-base">{course.title}</div>
                                            <div className="text-sm text-slate-500 truncate max-w-sm mt-1">{course.description || '강좌 설명이 없습니다.'}</div>
                                        </td>
                                        <td className="py-4 px-6 align-middle text-right font-semibold text-slate-700 w-32">
                                            {course.price ? `₩${course.price.toLocaleString()}` : "무료"}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center w-32">
                                            {renderStatusBadge(course.status)}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center font-medium text-slate-600 w-40 truncate">
                                            {course.institution_name || '-'}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center w-24">
                                            <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                                                상세보기
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export { CourseList };
