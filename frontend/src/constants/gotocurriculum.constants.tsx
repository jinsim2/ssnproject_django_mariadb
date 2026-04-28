import Goto1 from "@/assets/images/common/ic-program01.png";
import Goto2 from "@/assets/images/common/ic-program02.png";
import Goto3 from "@/assets/images/common/ic-program03.png";
import Goto4 from "@/assets/images/common/ic-program04.png";
import Goto5 from "@/assets/images/common/ic-program05.png";
import Goto6 from "@/assets/images/common/ic-program06.png";

export interface curriculum {
  id: number;
  title: string;
  icon: string;
}

export const curriculumData: curriculum[] = [
  { id: 1, title: "법정교육 패키지", icon: Goto1 },
  { id: 2, title: "서비스 디지털교육", icon: Goto2 },
  { id: 3, title: "케어뱅크 돌봄봉사자 기초교육", icon: Goto3 },
  { id: 4, title: "멘토링 교육", icon: Goto4 },
  { id: 5, title: "VMS 인증요원 보수교육", icon: Goto5 },
  { id: 6, title: "ISO 45001 안전보건경영시스템", icon: Goto6 },
];
