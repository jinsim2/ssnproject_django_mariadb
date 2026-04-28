import { useEffect, useState } from "react";
import { client } from "@/lib/api";

// 1. 모델 세팅 (장고가 보내주는 데이터)
interface Instructor {
    instructor_id: number;
    instructor_name: string;
    affiliation?: string;
    specialization?: string;
    bio?: string;
    profile_image?: string | null;
}

function InstructorList() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. 체크박스 상태 관리 (PHP 시절 document.getElementById 역할을 React가 자동 수행!)
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const res = await client.get("/api/courses/instructors/");
                setInstructors(res.data.results || res.data);
            } catch (error) {
                console.error("데이터 통신 싪패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    // 전체 선택 클릭 시
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectAll(e.target.checked);
        if (e.target.checked) {
            setSelectedIds(instructors.map((ins) => ins.instructor_id));
        } else {
            setSelectedIds([]);
        }
    };

    // 개별 선택 클릭 시
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
            setSelectAll(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 타이틀 영역 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">전체 강사 목록</h1>
                    <p className="text-sm text-slate-500 mt-1">시스템에 등록된 강사진 및 소속 정보입니다.</p>
                </div>
            </div>

            {/* 필터 및 액션 버튼 구역 (흰색 배경 + 파란 포인트) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2">
                    <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none">
                        <option value="">이름</option>
                        <option value="id">아이디</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색어 입력"
                        className="border border-slate-300 rounded-lg px-4 py-2 text-sm w-48 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
                        검색
                    </button>
                </div>

                {/* 기존 액션 버튼들 (회원님이 요청하신 파란색(Blue) 테마 반영!) */}
                <div className="flex gap-2">
                    <button className="border border-slate-300 text-slate-700 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                        강사 엑셀 다운로드
                    </button>
                    <button className="border border-red-200 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100">
                        선택 삭제
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                        + 신규 / 일괄 등록
                    </button>
                </div>
            </div>

            {/* 메인 데이터 테이블 구역 (흰색 배경) */}
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
                                <th className="py-4 px-4 font-semibold w-24 text-center">프로필</th>
                                <th className="py-4 px-6 font-semibold w-32">이름</th>
                                <th className="py-4 px-6 font-semibold w-48">소속 / 전공 분야</th>
                                <th className="py-4 px-6 font-semibold min-w-[200px]">자기소개</th>
                                <th className="py-4 px-6 font-semibold text-center w-24">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <div className="animate-pulse">강사 데이터를 불러오는 중입니다...</div>
                                    </td>
                                </tr>
                            ) : instructors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        등록된 강사가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                instructors.map((ins) => (
                                    <tr key={ins.instructor_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={selectedIds.includes(ins.instructor_id)}
                                                onChange={(e) => handleSelectOne(e, ins.instructor_id)}
                                            />
                                        </td>
                                        <td className="py-4 px-4 flex justify-center">
                                            {/* 강사 프로필 이미지 로직 */}
                                            {ins.profile_image ? (
                                                <img src={ins.profile_image} alt="프로필" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-300">
                                                    사진
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-800">
                                            {ins.instructor_name}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-slate-700">{ins.affiliation || '-'}</div>
                                            <div className="text-xs text-slate-500 mt-1">{ins.specialization || '전공 미기재'}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 max-w-md truncate">
                                            {ins.bio || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-center">
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

export { InstructorList };
