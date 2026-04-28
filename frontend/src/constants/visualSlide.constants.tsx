import MainVisual01 from "@/assets/images/main/visual01.jpg";

// 슬라이드 데이터 타입
export interface VisualSlide {
  id: number;
  backgroundImage: string;
  subtitle: string;
  title: string;
  description: string;
  autoplayDelay?: number;
}
// 슬라이드 데이터
export const visualSlides: VisualSlide[] = [
  {
    id: 1,
    backgroundImage: MainVisual01,
    subtitle: "업무 역량강화 및 자기개발",
    title: "사회복지 온라인 교육연수원",
    description:
      "'행복한 사회, 밝은 사회'를 만드는 든든한 버팀목으로서\n사회복지 종사자의 전문성 강화와 역량 향상을 위해 앞장서고 있습니다.",
    autoplayDelay: 10000, // 10초
  },
  {
    id: 2,
    backgroundImage: MainVisual01,
    subtitle: "전문성을 키우는 지속 가능한 배움",
    title: "사회복지 온라인 교육연수원",
    description:
      "입문부터 심화까지, 직무 단계별 맞춤 교육을 통해\n사회복지 종사자의 역량 향상과 전문 커리어 성장을 지원합니다.",
    autoplayDelay: 10000, // 10초
  },
  {
    id: 3,
    backgroundImage: MainVisual01,
    subtitle: "전문성을 키우는 지속 가능한 배움",
    title: "사회복지 온라인 교육연수원",
    description:
      "사회적 약자와 지역사회를 잇는 사회복지 종사자의 역할 강화를 위해\n체계적이고 신뢰할 수 있는 교육과정을 운영합니다.",
    autoplayDelay: 10000, // 10초
  },
];
