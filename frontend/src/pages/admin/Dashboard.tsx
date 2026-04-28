function Dashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
            <div className="grid gap-4 md:grid-cols-3">
                {/* 예시용 카드 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-500">총 회원 수</h3>
                    <p className="text-2xl font-bold mt-2">1,234명</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-500">오늘 방문자</h3>
                    <p className="text-2xl font-bold mt-2">123명</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-500">신규 가입</h3>
                    <p className="text-2xl font-bold mt-2">+5명</p>
                </div>
            </div>
        </div>
    );
}

export { Dashboard };