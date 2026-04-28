import { useEffect, useState } from "react";
import { client } from "@/lib/api";

// 1. 모델 세팅 (Django Backend - EnrollmentSerializer 응답 구조와 일치)
interface Enrollment {
    enrollment_id: number;
    course_title: string;
    course_type: string;
    learner_name: string;
    enrollment_type: string; // group, individual
    enrollment_status: string; // pending, approved, cancelled
    is_completed: boolean;
    enrollment_date: string;
}

function EnrollmentList() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    // 모달 관리 로직
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

    const openModal = (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setIsModalOpen(true);
    };

    // 체크박스 일괄 소팅 로직
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // 뱃지 색상 및 텍스트 렌더링 함수
    const getEnrollStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            'pending': { label: '신청중', color: 'bg-yellow-100 text-yellow-700' },
            'approved': { label: '신청완료', color: 'bg-green-100 text-green-700' },
            'rejected': { label: '신청반려', color: 'bg-red-100 text-red-700' },
            'waiting': { label: '대기중', color: 'bg-slate-100 text-slate-700' },
            'cancelled': { label: '신청취소', color: 'bg-gray-100 text-gray-500' }
        };
        const st = statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-500' };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${st.color}`}>{st.label}</span>;
    };

    // 체크박스 핸들러
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectAll(e.target.checked);
        if (e.target.checked) setSelectedIds(enrollments.map(e => e.enrollment_id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) setSelectedIds(prev => [...prev, id]);
        else {
            setSelectedIds(prev => prev.filter(item => item !== id));
            setSelectAll(false);
        }
    };

    // PHP 상단 탭 구현 (화이트&블루 컨셉)
    const tabs = [
        { id: "all", label: "전체 신청 내역" },
        { id: "individual", label: "개별 신청" },
        { id: "group", label: "단체 신청" },
    ];

    // 백엔드에서 수강 내역 가져오기
    useEffect(() => {
        const fetchEnrollments = async () => {
            setLoading(true);
            try {
                // 백엔드 API: /api/enrollments/list/ 호출
                const res = await client.get(`/api/enrollments/list/`);

                // 프론트엔드 단에서 탭 조건에 맞게 필터링!
                let data = res.data.results || res.data;
                if (activeTab !== "all") {
                    data = data.filter((item: Enrollment) => item.enrollment_type === activeTab);
                }

                setEnrollments(data);
                setSelectAll(false);
                setSelectedIds([]);
            } catch (error) {
                console.error("수강 내역 데이터 호출 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, [activeTab]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 타이틀 및 탭 영역 묶음 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">수강 / 신청 관리</h1>
                            <p className="text-sm text-slate-500 mt-1">플랫폼에 등록된 임직원의 전체 수강 및 결제 신청 내역입니다.</p>
                        </div>
                        <button className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition shadow-sm">
                            <span className="mr-2">📥</span>엑셀 다운로드
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
                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        checked={selectAll} onChange={handleSelectAll} />
                                </th>
                                <th className="py-4 px-6 font-semibold min-w-[200px]">강좌 정보</th>
                                <th className="py-4 px-6 font-semibold w-32">구분</th>
                                <th className="py-4 px-6 font-semibold w-40">신청자</th>
                                <th className="py-4 px-6 font-semibold w-32 text-center">신청일</th>
                                <th className="py-4 px-6 font-semibold w-28 text-center">신청 상태</th>
                                <th className="py-4 px-6 font-semibold w-28 text-center">수료 여부</th>
                                <th className="py-4 px-6 font-semibold text-center w-24">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <div className="animate-pulse">수강 데이터를 불러오는 중입니다...</div>
                                    </td>
                                </tr>
                            ) : enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        해당 조건의 수강 신청 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((enrollment) => (
                                    <tr key={enrollment.enrollment_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4 text-center align-middle">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={selectedIds.includes(enrollment.enrollment_id)}
                                                onChange={(e) => handleSelectOne(e, enrollment.enrollment_id)} />
                                        </td>
                                        <td className="py-4 px-6 align-middle">
                                            <div className="font-bold text-slate-800">{enrollment.course_title || '-'}</div>
                                            <div className="text-xs text-slate-400 mt-1">ID: {enrollment.enrollment_id}</div>
                                        </td>
                                        <td className="py-4 px-6 align-middle text-sm">
                                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {enrollment.course_type === 'online' ? '온라인' : enrollment.course_type === 'offline' ? '오프라인' : '패키지'}
                                            </span>
                                            {enrollment.enrollment_type === 'group' && <span className="ml-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-bold text-xs">단체</span>}
                                        </td>
                                        <td className="py-4 px-6 align-middle font-medium text-slate-700">
                                            {enrollment.learner_name || '-'}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center text-sm text-slate-500">
                                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center">
                                            {getEnrollStatusBadge(enrollment.enrollment_status)}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center text-sm">
                                            {enrollment.is_completed ? <span className="text-blue-600 font-bold">수료</span> : <span className="text-slate-400">미수료</span>}
                                        </td>
                                        <td className="py-4 px-6 align-middle text-center">
                                            <button
                                                onClick={() => openModal(enrollment)}
                                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                            >
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

            {/* 상세정보 모달(Modal) 영역 */}
            {isModalOpen && selectedEnrollment && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* 모달 헤더 */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">교육 수강/결제 상세정보</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* 모달 바디 */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* 1. 기본 신청 내역 */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-3 ml-1">기본 신청 내역</h3>
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">신청자명 (아이디)</p>
                                            <p className="font-semibold text-slate-800">{selectedEnrollment.learner_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">강좌타입</p>
                                            <p className="font-semibold text-slate-800">{selectedEnrollment.course_type === 'online' ? '온라인' : selectedEnrollment.course_type === 'offline' ? '오프라인' : '패키지'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-slate-400 mb-1">신청 강좌명</p>
                                            <p className="font-semibold text-slate-800">{selectedEnrollment.course_title || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">최초 신청날짜</p>
                                            <p className="font-semibold text-slate-800">{new Date(selectedEnrollment.enrollment_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">진행/수료 여부</p>
                                            <p className="font-semibold text-slate-800">{selectedEnrollment.is_completed ? '✅ 수료완료' : '진행중'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-slate-400 mb-1">현재 상태</p>
                                            <div className="mt-0.5">{getEnrollStatusBadge(selectedEnrollment.enrollment_status)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. 결제 정보 (확장 예정 구역) */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-3 ml-1">결제 내역 & 단체 수강생 명단 (API 확장구역)</h3>
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                                    <span className="text-3xl mb-2">💸</span>
                                    <p className="text-slate-500 font-medium">추후 결제(Payment) 테이블과 연동되어<br />계약서 출력, 영수증, 단체 명단 등을 렌더링할 구역입니다.</p>
                                </div>
                            </div>
                        </div>

                        {/* 모달 푸터 */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-3 bg-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 rounded-lg text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { EnrollmentList };
