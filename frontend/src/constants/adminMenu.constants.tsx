export interface MenuSubItem {
  id: number;
  name: string;
  href: string;
}

export interface subMenuItem {
  id: number;
  name: string;
  href?: string;
  subItems?: MenuSubItem[];
}

export interface MainMenu {
  id: number;
  title: string;
  items: subMenuItem[];
  href?: string;
}

export const AdminMenuData: MainMenu[] = [
  {
    id: 0, // 0번부터 시작
    title: "대시보드",
    href: "/admin", // 클릭 시 이동할 링크 직접 추가
    items: [], // 하위 메뉴 없음
  },
  {
    id: 1,
    title: "직원교육관리",
    items: [
      {
        id: 1,
        name: "직원 리스트",
        subItems: [
          { id: 1, name: "직원목록", href: "/employee/list" },
          { id: 2, name: "직원등록", href: "/employee/register" },
        ]
      },
      {
        id: 2, name: "직원 수강관리",
        subItems: [
          { id: 1, name: "수강현황 및 수료증 관리", href: "/employee/education_status" },
          { id: 2, name: "교육수료 세부확인서", href: "/employee/education_status_detail" },
        ]
      },
      { id: 3, name: "수강 신청/결제", href: "/employee/application" },
    ],
  },
  {
    id: 2,
    title: "회원관리",
    items: [
      { id: 1, name: "학습자 관리", href: "/member/learners" },
      { id: 2, name: "강사 관리", href: "/member/instructors" },
      { id: 3, name: "관리자 관리", href: "/member/admins" },
      { id: 4, name: "기관 대기자 관리", href: "/unassignMember/index" },
      { id: 5, name: "기관 관리", href: "/institution/index" },
    ],
  },
  {
    id: 3,
    title: "강좌관리",
    items: [
      {
        id: 1, name: "강좌목록",
        subItems: [
          { id: 1, name: "온라인교육", href: "/lecture/list?Type=online" },
          { id: 2, name: "오프라인교육", href: "/lecture/list?Type=offline" },
          { id: 3, name: "패키지교육", href: "/lecture/list?Type=package" },
        ]
      },
      {
        id: 2, name: "강좌등록",
        subItems: [
          { id: 1, name: "온라인교육", href: "/lecture/list?Type=online" },
          { id: 2, name: "오프라인교육", href: "/lecture/list?Type=offline" },
          { id: 3, name: "패키지교육", href: "/lecture/list?Type=package" },
        ]
      },
      { id: 3, name: "강좌 카테고리관리", href: "/category" },
    ],
  },
  {
    id: 4,
    title: "교육관리",
    items: [
      { id: 1, name: "교육현황 및 승인 관리 ", href: "/lecture/list?type=online" },
      { id: 2, name: "교육 이력 통계", href: "/lecture/stats" },
    ],
  },
  {
    id: 5,
    title: "신청/결제관리",
    items: [
      {
        id: 1, name: "신청관리",
        subItems: [
          { id: 1, name: "개별 신청 관리", href: "/enrollment/list?Type=individual" },
          { id: 2, name: "단체 신청 관리", href: "/enrollment/list?Type=group" },
          { id: 3, name: "이엠 신청 관리", href: "/enrollment/list?Type=em" },
        ]
      },
      { id: 2, name: "결제관리", href: "/payment/list" },
      { id: 3, name: "결제통계", href: "/statistics/payment" },
      { id: 4, name: "환불 관리", href: "/refund/list" },
    ],
  },
  {
    id: 6,
    title: "홈페이지 관리",
    items: [
      {
        id: 1, name: "이엠",
        subItems: [
          { id: 1, name: "미니홈 생성하기", href: "/#" },
          { id: 2, name: "이엠 신청/결제하기", href: "/#" },
          { id: 3, name: "나의 미니 홈 관리", href: "/#" },
        ]
      },
      {
        id: 2, name: "게시판관리",
        subItems: [
          { id: 1, name: "공지사항", href: "/board/notices" },
          { id: 2, name: "자주 묻는 질문", href: "/board/faq" },
          { id: 3, name: "학습문의 게시판", href: "/board/inquiries" },
          { id: 4, name: "자료실", href: "/board/dataroom" },
        ]
      },
      {
        id: 3, name: "홈페이지 관리",
        subItems: [
          { id: 1, name: "홈페이지 설정", href: "/settings/homepage" },
          { id: 2, name: "팝업창", href: "/settings/popups" },
          { id: 3, name: "배너", href: "/settings/banners" },
        ]
      },
    ],
  },
  {
    id: 7,
    title: "기타관리",
    items: [
      {
        id: 1, name: "설문 관리",
        subItems: [
          { id: 1, name: "사전/사후 설문지", href: "/survey/list?type=pre" },
          { id: 2, name: "만족도 조사", href: "/survey/list?type=satisfaction" },
        ]
      },
      {
        id: 2, name: "알림톡 관리",
        subItems: [
          { id: 1, name: "알림톡 템플릿 관리", href: "/alimtalk/index" },
          { id: 2, name: "알림톡 수동 발송", href: "/alimtalk/send" },
        ]
      },
      {
        id: 3, name: "통계 관리",
        subItems: [
          { id: 1, name: "매출통계", href: "/#" },
          { id: 2, name: "설문 조사 통계", href: "/statistics/surveyList?type=survey" },
          { id: 3, name: "만족도 조사 통계", href: "/statistics/surveyList?type=satisfaction" },
        ]
      },
    ],
  },
  {
    id: 8,
    title: "환경설정",
    items: [
      { id: 1, name: "시스템 설정", href: "/settings/system" },
      {
        id: 2, name: "보안",
        subItems: [
          { id: 1, name: "활동로그", href: "/settings/activity_logs" },
          { id: 2, name: "개인정보열람기록", href: "/settings/privacy_logs" },
          { id: 3, name: "기기관리", href: "/settings/devices" },
        ]
      },
      { id: 3, name: "방문자 분석", href: "/visitor" },
      { id: 4, name: "법정동코드 관리", href: "/district/import" },
      { id: 5, name: "클라이언트 코드", href: "/client_code/list" },
      { id: 6, name: "케어뱅크 교육기관", href: "/care_bank_inst/list" },
      { id: 7, name: "관리자 메뉴 관리", href: "/admin_menu/list" },
    ],
  },
];