import { useEffect, useState } from "react";
import { client } from "@/lib/api"; // 기존 인증 토큰이 자동으로 묻어가는 axios 인스턴스

// 파이썬 Django에서 던져줄 JSON 데이터 타입 정의
interface Institution {
    institution_id: number;
    institution_name: string;
    ceo_name: string;
    registration_number: string;
    institution_type_display: string;   // 시리얼라이저가 번역해준 덕분에 바로 화면에 뿌립니다!
    region: string;
    status_display: string;             // 이것도 'active'가 아니라 '활성'으로 바로 꽂힙니다!
    employee_count: number;
    created_at: string;
}

function InstitutionList() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. 화면이 켜지자마자 우리가 만든 Django 백엔드를 찌릅니다!
    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const res = await client.get("/api/institutions/institutions/");
                // 장고 패지네이션이 적용되어 있다면 res.data.results 안에 배열이 들어있습니다.
                setInstitutions(res.data.results || res.data);
            } catch (error) {
                console.error("기관 데이터를 불러오는데 실패했습니다:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitutions();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* 상단 헤더 영역 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">🏢 B2B 기관 관리</h1>
                    <p className="text-sm text-slate-500 mt-1">우리 시스템에 등록된 모든 고객사 및 기관의 명단입니다.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    + 신규 기관 등록
                </button>
            </div>

            {/* 모던한 표(Table) UI 구역 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                                <th className="py-4 px-6 font-semibold">기관명</th>
                                <th className="py-4 px-6 font-semibold">유형 및 지역</th>
                                <th className="py-4 px-6 font-semibold">사업자번호</th>
                                <th className="py-4 px-6 font-semibold">대표자</th>
                                <th className="py-4 px-6 font-semibold text-center">임직원 수</th>
                                <th className="py-4 px-6 font-semibold text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <div className="animate-pulse">데이터를 열심히 불러오는 중입니다...</div>
                                    </td>
                                </tr>
                            ) : institutions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        아직 등록된 기관이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                institutions.map((inst) => (
                                    <tr
                                        key={inst.institution_id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6 font-medium text-slate-800">
                                            {inst.institution_name}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md font-medium mb-1">
                                                {inst.institution_type_display}
                                            </span>
                                            <div className="text-xs text-slate-500">{inst.region || '지역 미상'}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                                            {inst.registration_number || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600">
                                            {inst.ceo_name || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {inst.employee_count} 명
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {/* 상태에 따라 뱃지 색상이 바뀌는 다이나믹 UI! */}
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${inst.status_display === '활성' ? 'bg-green-50 text-green-700' :
                                                inst.status_display === '정지' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-red-50 text-red-700'
                                                }`}>
                                                {inst.status_display}
                                            </span>
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

export { InstitutionList }