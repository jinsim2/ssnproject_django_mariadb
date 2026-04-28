import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";

function Checkout() {
    const navigate = useNavigate();
    // 장바구니에서 가져온 총 금액 (임시)
    // const [totalAmount, setTotalAmount] = useState(100);

    // 100원이었던 가짜 금액을 지우고 진짜 장바구니 API에서 받아오도록 한다!
    const [totalAmount, setTotalAmount] = useState(0);

    // 화면이 켜질 때 진짜 장바구니 합계 가져오기
    useEffect(() => {
        // 장바구니 API에서 목록을 불러온다.
        const fetchAmount = async () => {
            try {
                const res = await client.get("/api/enrollments/carts/");

                // 내가 담은 장바구니들의 가격 총합 계산
                const sum = res.data.reduce((acc: number, item: any) => acc + Number(item.course_price), 0);
                setTotalAmount(sum);
            } catch (err) {
                console.error("가격 로드 실패")
            }
        };
        fetchAmount();
    }, []);

    // 주문자 정보 폼 (기본적으로 회원가입된 로그인 이름이 들어가야 합니다)
    const [payerInfo, setPayerInfo] = useState({
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPayerInfo({ ...payerInfo, [e.target.name]: e.target.value });
    };

    // 대망의 결제 버튼 클릭 시 실행되는 함수
    const handlePayment = async () => {
        // [추가된 로직] 만약 총 결제 금액이 0월(무료 강좌)이라면 PG사를 호출하지 않고
        // 바로 백엔드로 넘긴다.
        if (totalAmount == 0) {
            try {
                // PG사(포트원) 대신 백엔드의 "무료 승인 전용 API"를 호출한다.
                const res = await client.post("/api/enrollments/orders/process_free/");
                if (res.data.success) {
                    alert("무료 강좌 수강신청이 완료되었습니다! 나의 강의실로 이동합니다.");
                    navigate("/my-classroom");
                }
            } catch (error) {
                alert("수강신청 처리 중 오류가 발생했습니다.");
                console.error(error);
            }
            // 0원이면 아래 포트원 로직을 실행하지 않고 함수를 여기서 종료(return) 한다.
            return;
        }


        // 1. window 객체에서 IMP 추출 (index.html에 세팅된 스크립트)
        const IMP = window.IMP;
        if (!IMP) {
            alert("포트원 모듈 로딩 중입니다.");
            return;
        }

        // 2. 포트원 가맹점 식별코드로 초기화 (본인인증에 쓰신 것과 동일하게 해주세요)
        IMP.init("imp58733802");

        // 3. (원래는 백엔드에서 받아야 하는) 고유 주문번호 임시 생성
        const merchantUid = `order_${new Date().getTime()}`;

        // 4. 포트원 결제창 호출
        IMP.request_pay(
            {
                pg: "html5_inicis",        // KG이니시스 (테스트 모드)
                pay_method: "card",        // 결제수단 (card, vbank, trans 등)
                merchant_uid: merchantUid, // 주문 고유 번호 (절대 중복되면 안됨!)
                name: "LMS 수강신청 결제",    // 결제창에 띄워질 상품명
                amount: totalAmount,       // **결제 금액**
                buyer_email: payerInfo.email,
                buyer_name: payerInfo.name,
                buyer_tel: payerInfo.phone,
            },
            async (response: any) => {
                // 5. 결제창이 닫히고 결과가 돌아오는 곳 (Callback)
                const { success, imp_uid, error_msg } = response;

                if (success) {
                    console.log("포트원 결제 성공! imp_uid:", imp_uid);

                    try {
                        // [중요] 임시 금액이 아닌 제대로 장바구니 API 연결 시에는
                        // 아래 API 라우트를 방금 백엔드에 만든 라우트로 향하게 합니다
                        const res = await client.post("/api/enrollments/orders/verify/", {
                            imp_uid: imp_uid,
                            merchant_uid: merchantUid
                        });
                        if (res.data.success) {
                            alert("축하합니다! 백엔드 검증이 안전하게 완료되었으며 수강권한이 발급되었습니다!");
                            navigate("/"); // 내 강의실로 이동
                        }
                    } catch (error) {
                        console.error("백엔드 검증 통신 에러:", error);
                        alert("결제 검증에 실패했습니다.");
                    }
                } else {
                    alert(`결제 실패: ${error_msg}`);
                }
            }
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-16 px-4">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">주문서 작성 / 결제</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 주문자 정보 입력 폼 */}
                <div className="bg-white p-8 border rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-6">주문자 정보</h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                            <input
                                type="text"
                                name="name"
                                value={payerInfo.name}
                                onChange={handleInputChange}
                                className="w-full border p-3 rounded-md outline-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">연락처</label>
                            <input
                                type="text"
                                name="phone"
                                value={payerInfo.phone}
                                onChange={handleInputChange}
                                placeholder="010-1234-5678"
                                className="w-full border p-3 rounded-md outline-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={payerInfo.email}
                                onChange={handleInputChange}
                                className="w-full border p-3 rounded-md outline-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 결제 요약 영역 */}
                <div className="bg-slate-50 p-8 border rounded-lg h-fit">
                    <h3 className="text-xl font-bold mb-6">결제 정보</h3>
                    <div className="flex justify-between text-lg text-slate-700 mb-4 border-b pb-4">
                        <span>총 상품 금액</span>
                        <span>{totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-slate-900 mb-8">
                        <span>최종 결제 금액</span>
                        <span className="text-blue-600">{totalAmount.toLocaleString()}원</span>
                    </div>

                    <Button
                        onClick={handlePayment}
                        className="w-full h-14 text-xl bg-blue-600 hover:bg-blue-700"
                    >
                        {totalAmount.toLocaleString()}원 안전결제하기
                    </Button>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        KG이니시스(포트원) 테스트 환경으로 띄워집니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

export { Checkout }