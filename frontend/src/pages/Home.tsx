import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppSidebar } from "../components/common";
import { Separator } from "../components/ui";
import { client } from "@/lib/api"; // Axios client for backend
import { SidebarToggleButton, CurriculumCarousel, CourseCard, MainVisualCarousel, MainCalendar, HomeBoard, MyClassroom, CustomerCenter, MainManual } from "../components/home";
import type { CourseProps } from "../components/home/CourseCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import Symbol from "@/assets/images/common/ic-symbol.svg";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [jobCourses, setJobCourses] = useState<CourseProps[]>([]);
  const [legalCourses, setLegalCourses] = useState<CourseProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const [jobRes, legalRes] = await Promise.all([
          client.get("/api/courses/courses/?category=직무교육"),
          client.get("/api/courses/courses/?category=무료법정교육")
        ]);
        setJobCourses(jobRes.data);
        setLegalCourses(legalRes.data);
      } catch (error) {
        console.error("Failed to fetch courses data: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <main className={`w-full flex gap-6 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
      {/* 모바일 오버레이 백그라운드 (사이드바 열렸을 때) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={handleSidebarToggle}
        />
      )}

      {/* 로그인 사이드바 펼침 버튼 */}
      <SidebarToggleButton
        isSidebarOpen={isSidebarOpen}
        handleSidebarToggle={handleSidebarToggle}
      />
      {/* 카테고리 사이드바 */}
      <div
        className={`fixed top-14 md:top-16 xl:top-20 bottom-0 left-0 z-40 bg-background border-r shadow-lg transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <AppSidebar />
      </div>
      {/* 본문 */}
      <section className="w-full m-4 lg:m-10 min-w-0">
        <div className="flex flex-col gap-6">
          {/* 메인이미지 및 달력 */}
          {/* 모바일은 1열(기본), lg(1024px) 이상부터 6:4 비율 */}
          <div className="grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-6">
            <div className="w-full">
              {/* 왼쪽 콘텐츠 (예: 주소, 연락처 정보) */}
              {/* <SkeletonMainImage /> */}
              <MainVisualCarousel />
            </div>
            <div className="w-full flex flex-col gap-2 h-full">
              {/* 오른쪽 콘텐츠 (예: 로고, 셀렉트 박스) */}
              {/* <SkeletonMainImage /> */}
              <p className="flex items-center text-xl font-semibold">
                <img src={Symbol} alt="Symbol" />
                오프라인 교육 찾기 및 신청
              </p>
              <MainCalendar />
            </div>
          </div>
          {/* 교육과정 바로가기 */}
          <CurriculumCarousel />

          {/* 공지사항 및 나의강의실 입장버튼 고객센터, 각종 버튼 */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-auto lg:h-[300px]">
              <div className="lg:col-span-3 w-full h-full">
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border">
                  <HomeBoard />
                </div>
              </div>
              <div className="lg:col-span-3 flex flex-col gap-6 h-full">
                <div className="flex-[6] grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-3 lg:col-span-1">
                    {/* 나의 강의실 */}
                    <MyClassroom />
                  </div>
                  <div className="col-span-3 lg:col-span-2">
                    {/* 고객센터 */}
                    <CustomerCenter />
                  </div>
                </div>
                <div className="flex-[4] flex">
                  {/* 메뉴얼 버튼 */}
                  <MainManual />
                </div>
              </div>
            </div>
          </div>

          {/* 직무교육 썸네일 */}
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <img src={Symbol} alt="Symbol" />
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    직무교육
                  </h3>
                </div>
                {/* 1100px 이하에서만 보이는 컨트롤러 */}
                <div className="flex gap-2 min-[1100px]:hidden">
                  <CarouselPrevious variant="outline" className="static translate-y-0 h-9 w-9 rounded-md border-input bg-background hover:bg-accent">
                    <ChevronLeft className="h-4 w-4" />
                  </CarouselPrevious>
                  <CarouselNext variant="outline" className="static translate-y-0 h-9 w-9 rounded-md border-input bg-background hover:bg-accent">
                    <ChevronRight className="h-4 w-4" />
                  </CarouselNext>
                </div>
              </div>
              <Separator className="!h-[3px] bg-black" />
            </div>

            <div className="w-full px-10 relative">
              {isLoading ? (
                // 로딩 스피너
                <div className="flex items-center justify-center h-40 w-full">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <CarouselContent className="-ml-4">
                  {jobCourses.map((course) => (
                    <CarouselItem key={course.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                      <CourseCard course={course} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              )}
              {/* 1100px 이상에서만 보이는 사이드 콘트롤러 */}
              {!isLoading && (
                <>
                  <CarouselPrevious className="hidden min-[1100px]:flex" />
                  <CarouselNext className="hidden min-[1100px]:flex" />
                </>
              )}
            </div>
          </Carousel>

          {/* 법정교육 썸네일 */}
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <img src={Symbol} alt="Symbol" />
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    법정교육
                  </h3>
                </div>
                {/* 1100px 이하에서만 보이는 컨트롤러 */}
                <div className="flex gap-2 min-[1100px]:hidden">
                  <CarouselPrevious variant="outline" className="static translate-y-0 h-9 w-9 rounded-md border-input bg-background hover:bg-accent">
                    <ChevronLeft className="h-4 w-4" />
                  </CarouselPrevious>
                  <CarouselNext variant="outline" className="static translate-y-0 h-9 w-9 rounded-md border-input bg-background hover:bg-accent">
                    <ChevronRight className="h-4 w-4" />
                  </CarouselNext>
                </div>
              </div>
              <Separator className="!h-[3px] bg-black" />
            </div>

            <div className="w-full px-10 relative">
              {isLoading ? (
                // 로딩 스피너
                <div className="flex items-center justify-center h-40 w-full">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <CarouselContent className="-ml-4">
                  {legalCourses.map((course) => (
                    <CarouselItem key={course.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                      <CourseCard course={course} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              )}
              {/* 1100px 이상에서만 보이는 사이드 컨트롤러 */}
              {!isLoading && (
                <>
                  <CarouselPrevious className="hidden min-[1100px]:flex" />
                  <CarouselNext className="hidden min-[1100px]:flex" />
                </>
              )}
            </div>
          </Carousel>
        </div>
      </section>
    </main>
  );
}
export { App }