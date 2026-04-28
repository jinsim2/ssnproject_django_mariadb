
import type { CourseProps } from "../components/home/CourseCard";

// vite 환경에서 동적으로 이미지를 불러오는 올바른 함수
const getJobThumbnail = (filename: string) => {
    return new URL(`../assets/images/thumbnail/job/${filename}.png`, import.meta.url).href;
}

const getLegalThumbnail = (filename: string) => {
    return new URL(`../assets/images/thumbnail/legal/${filename}.png`, import.meta.url).href;
}

const rawJobCourses: Omit<CourseProps, "thumbnailUrl">[] = [
    {
        id: "j1",
        title: "IOS 45001 안전보건경영시스템 내부심사원 양성과정",
        category: "기타과정",
        description: "IOS 45001 안전보건경영시스템 내부심사원 양성과정",
        status: "reception",
    },
    {
        id: "j2",
        title: "[직무특수]인사관리자에게 필수! 노동법 마스터하기!(초급)",
        category: "직무특수",
        description: "[직무특수]인사관리자에게 필수! 노동법 마스터하기!(초급)",
        status: "upcoming",
    },
    {
        id: "j3",
        title: "[직무특수]인사관리자에게 필수! 노동법 마스터하기!(중급)",
        category: "직무특수",
        description: "[직무특수]인사관리자에게 필수! 노동법 마스터하기!(중급)",
        status: "reception",
    },
    {
        id: "j4",
        title: "[직무특수]장기요양 기관 재무회계 규칙(초중급)",
        category: "직무특수",
        description: "[직무특수]장기요양 기관 재무회계 규칙(초중급)",
        status: "closed",
    },
    {
        id: "j5",
        title: "[직무특수]사회복지 회계세무 증빙서류처리(초급)",
        category: "직무특수",
        description: "[직무특수]사회복지 회계세무 증빙서류처리(초급)",
        status: "reception",
    },
    {
        id: "j6",
        title: "[직무역량]사회복지기관장의 ESG경영과 리더십",
        category: "직무역량",
        description: "[직무역량]사회복지기관장의 ESG경영과 리더십",
        status: "reception",
    },
    {
        id: "j7",
        title: "[직무특수]공인법인 복식부기 도입에 맞춘 회계원리배우기(초급)",
        category: "직무특수",
        description: "[직무특수]공인법인 복식부기 도입에 맞춘 회계원리배우기(초급)",
        status: "reception",
    },
    {
        id: "j8",
        title: "[직무특수]4대보험 실무",
        category: "직무특수",
        description: "[직무특수]4대보험 실무",
        status: "reception",
    },
    {
        id: "j9",
        title: "[직무특수]사회복지상담실무'공감'(초급)",
        category: "직무양성",
        description: "[직무특수]사회복지상담실무'공감'(초급)",
        status: "reception",
    },
    {
        id: "j10",
        title: "[직무공통]사회복지분야 초상권 및 저작권 침해 예방",
        category: "직무공통",
        description: "[직무공통]사회복지분야 초상권 및 저작권 침해 예방",
        status: "reception",
    },
]

// 맴핑을 통해 detailUrl과 thumbnailUrl을 한 번에 주입한다.
export const jobCourses: CourseProps[] =
    rawJobCourses.map(course => ({
        ...course,
        // thumbnailUrl은 j1.png, j2.png 처럼 매핑됨
        thumbnailUrl: getJobThumbnail(course.id),
    }));

const rawLegalCourses: Omit<CourseProps, "thumbnailUrl">[] = [
    {
        id: "l1",
        title: "[법정교육]직장 내 장애인 인식개선 교육(2026)",
        category: "전체과정",
        description: "[법정교육]직장 내 장애인 인식개선 교육(2026)",
        status: "reception",
    },
    {
        id: "l2",
        title: "[법정교육] 직장 내 성희롱 예방 교육(2026)",
        category: "전체과정",
        description: "[법정교육] 직장 내 성희롱 예방 교육(2026)",
        status: "reception",
    },
    {
        id: "l3",
        title: "[법정교육] 직장 내 괴롭힘 예방 교육(2026)",
        category: "전체과정",
        description: "[법정교육] 직장 내 괴롭힘 예방 교육(2026)",
        status: "reception",
    },
    {
        id: "l4",
        title: "[무료법정교육]긴급복지지원 신고의무자 교육(2026)",
        category: "신고자의무자교육",
        description: "[무료법정교육]긴급복지지원 신고의무자 교육(2026)",
        status: "reception",
    },
    {
        id: "l5",
        title: "[무료법정교육]장애인 학대 및 장애인 대상 성범죄 예방과 신고(2026)",
        category: "무료법정교육",
        description: "[무료법정교육]장애인 학대 및 장애인 대상 성범죄 예방과 신고(2026)",
        status: "reception",
    },
];

// 맴핑을 통해 detailUrl과 thumbnailUrl을 한 번에 주입한다.
export const legalCourses: CourseProps[] =
    rawLegalCourses.map(course => ({
        ...course,
        // thumbnailUrl은 l1.png, l2.png 처럼 매핑됨
        thumbnailUrl: getLegalThumbnail(course.id),
    }));
