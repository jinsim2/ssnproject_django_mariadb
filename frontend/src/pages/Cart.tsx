import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api";

interface CartItem {
    cart_id: number;
    course: number;
    course_title: string;
    course_price: number;
}

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 컴포넌트 마운트 시 장바구니 목록 불러오기
    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            // 백엔드의 실제 /api/enrollments/carts/ 엔드포인트와 연결됩니다.
            const response = await client.get("/api/enrollments/carts/");
            setCartItems(response.data);
        } catch (error) {
            console.error("장바구니 로딩 실패:", error);
            // 임시 목업 데이터 보여주기 (백엔드 완성 전 UI 확인용)
            //  => 이제 이 아래 목업 데이터 구역은 평생 실행되지 않는다.
            // setCartItems([
            //     { cart_id: 1, course: 101, course_title: "[온라인] React+Django 풀스택 마스터과정", course_price: 150000 },
            //     { cart_id: 2, course: 102, course_title: "[오프라인] 포트원 결제 연동 실무", course_price: 50000 },
            // ]);
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (cartId: number) => {
        try {
            await client.delete(`/api/enrollments/carts/${cartId}/`); // 🔥 주석 해제! 진짜 DB에서 삭제 요청
            setCartItems(cartItems.filter((item) => item.cart_id !== cartId));
            alert("삭제되었습니다.");
        } catch (error) {
            alert("삭제에 실패했습니다.");
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("장바구니가 비어 있습니다.");
            return;
        }
        // 선택된 항목들을 가지고 주문/결제 화면으로 이동합니다.
        navigate("/checkout");
    };

    // 총 금액 계산 로직
    const totalPrice = cartItems.reduce((acc, item) => acc + Number(item.course_price), 0);

    return (
        <div className="max-w-5xl mx-auto py-16 px-4">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">장바구니</h2>

            {isLoading ? (
                <div className="text-center py-20 text-slate-500">로딩 중...</div>
            ) : cartItems.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg">
                    <p className="text-slate-500 mb-4">장바구니에 담긴 강좌가 없습니다.</p>
                    <Button onClick={() => navigate("/")} variant="outline">강좌 둘러보기</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 왼쪽: 장바구니 리스트 영역 */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.cart_id} className="flex justify-between items-center p-6 bg-white border rounded-lg shadow-sm">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">{item.course_title}</h3>
                                    <p className="text-blue-600 font-medium mt-1">{item.course_price.toLocaleString()}원</p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => removeItem(item.cart_id)}>
                                    삭제
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* 오른쪽: 결제 요약 영역 */}
                    <div className="bg-slate-50 p-6 rounded-lg border h-fit sticky top-24">
                        <h3 className="text-xl font-bold border-b pb-4 mb-4">결제 요약</h3>
                        <div className="flex justify-between mb-4 text-slate-600">
                            <span>총 강좌 금액</span>
                            <span>{totalPrice.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-slate-900 border-t pt-4 mb-8">
                            <span>최종 결제 금액</span>
                            <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
                        </div>
                        <Button onClick={handleCheckout} className="w-full h-12 text-lg">
                            주문하기
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export { Cart }