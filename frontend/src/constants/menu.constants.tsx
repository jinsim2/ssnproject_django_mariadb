export interface subMenuItem {
  id: number;
  name: string;
  href: string;
  //   description: string;
}

export interface MainMenu {
  id: number;
  title: string;
  items: subMenuItem[];
}

export const menuData: MainMenu[] = [
  {
    id: 1,
    title: "직무교육",
    items: [
      { id: 1, name: "전체과정", href: "/job/sub01" },
      { id: 2, name: "직무필수", href: "/job/sub02" },
      { id: 3, name: "직무공통", href: "/job/sub03" },
      { id: 4, name: "직무개발", href: "/job/sub04" },
      { id: 5, name: "직무양성", href: "/job/sub05" },
      { id: 6, name: "직무특수", href: "/job/sub06" },
      { id: 7, name: "직무역랑", href: "/job/sub07" },
      { id: 8, name: "기타과정", href: "/job/sub08" },
    ],
  },
  {
    id: 2,
    title: "법정교육",
    items: [
      { id: 1, name: "전체과정", href: "/legal/sub01" },
      { id: 2, name: "법정교육패키지", href: "/legal/sub02" },
      { id: 3, name: "신고의무자교육", href: "/legal/sub03" },
      { id: 4, name: "무료법정교육", href: "/legal/sub04" },
    ],
  },
  {
    id: 3,
    title: "자격증과정",
    items: [
      { id: 1, name: "공인자격과정", href: "/license/sub01" },
      { id: 2, name: "민간자격과정", href: "/license/sub02" },
    ],
  },
  {
    id: 4,
    title: "SSN교육",
    items: [
      { id: 1, name: "디지털교육(온라인)", href: "/ssn/sub01" },
      { id: 2, name: "디지털(오프라인)", href: "/ssn/sub02" },
    ],
  },
  {
    id: 5,
    title: "VMS교육",
    items: [
      { id: 1, name: "인증요원 보수교육", href: "/vms/sub01" },
      { id: 2, name: "케어뱅크", href: "/vms/sub02" },
      { id: 3, name: "멘토링", href: "/vms/sub03" },
    ],
  },
  {
    id: 6,
    title: "오프라인교육",
    items: [
      { id: 1, name: "교육 검색", href: "/offline/sub01" },
      { id: 2, name: "강사찾기 및 섭외", href: "/offline/sub02" },
    ],
  },
  {
    id: 7,
    title: "고객지원",
    items: [
      { id: 1, name: "공지사항", href: "/notice" },
      { id: 2, name: "자주 묻는 질문", href: "/faq" },
      { id: 3, name: "1:1 문의", href: "/inquriy" },
      { id: 4, name: "자료실", href: "/dataroom" },
      { id: 5, name: "채팅상담", href: "/support" },
    ],
  },
];
