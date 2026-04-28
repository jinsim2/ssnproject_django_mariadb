import { useEffect, useState, useCallback } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui";
import { visualSlides } from "@/constants/visualSlide.constants";
import { Play, Pause } from "lucide-react";

function MainVisualCarousel() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // 현재 슬라이드 인덱스 업데이트
    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        onSelect(); // 초기값 설정

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    // 자동재생 로직
    useEffect(() => {
        if (!api || !isPlaying) return;

        const autoplayInterval = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                api.scrollTo(0); // 마지막 슬라이드면 처음으로
            }
        }, visualSlides[current]?.autoplayDelay || 10000);

        return () => clearInterval(autoplayInterval);
    }, [api, current, isPlaying]);

    const togglePlay = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    return (
        <div className="relative w-full h-64 md:h-72 lg:h-auto lg:aspect-[2/1] lg:max-h-[360px] overflow-hidden rounded-lg group">
            <Carousel
                setApi={setApi}
                opts={{ loop: true, duration: 30 }}
                className="w-full h-full"
            >
                <CarouselContent className="h-full">
                    {visualSlides.map((slide) => (
                        <CarouselItem key={slide.id} className="h-full pl-0 flex">
                            <div className="relative w-full h-full flex-1">
                                {/* 배경 이미지 */}
                                <img
                                    src={slide.backgroundImage}
                                    alt={slide.title}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />

                                {/* 텍스트 콘텐츠 (반응형 레이아웃) */}
                                <div className="absolute inset-y-2 left-2 w-full md:w-4/5 lg:w-4/5 flex items-start justify-start z-10 pl-5 md:pl-12 lg:pl-12 pt-10 md:pt-12 lg:pt-12 xl:pt-20">
                                    <div className="flex flex-col gap-2 md:gap-3 lg:gap-3 items-start pr-4" key={current}>
                                        {/* Subtitle */}
                                        <span
                                            className="bg-[#005eb8] text-white text-[10px] md:text-xs lg:text-xs xl:text-sm font-semibold px-2.5 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-1.5 rounded-full inline-block mb-1 md:mb-2 animate-fade-in-up"
                                            style={{ animationDelay: "0.1s" }}
                                        >
                                            {slide.subtitle}
                                        </span>

                                        {/* Title */}
                                        <h2
                                            className="text-xl md:text-3xl lg:text-3xl xl:text-4xl font-extrabold text-black leading-tight whitespace-pre-line animate-fade-in-up break-keep"
                                            style={{ animationDelay: "0.3s" }}
                                        >
                                            {slide.title}
                                        </h2>

                                        {/* Description */}
                                        {slide.description && (
                                            <p
                                                className="text-xs md:text-sm lg:text-sm xl:text-base text-gray-800 font-medium whitespace-pre-line leading-relaxed mt-1 md:mt-2 animate-fade-in-up break-keep"
                                                style={{ animationDelay: "0.5s" }}
                                            >
                                                {slide.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* 페이지네이션 및 컨트롤러 */}
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-9 md:pl-2 md:py-0.5 lg:bottom-2 xl:bottom-8 lg:left-8 lg:pl-2 lg:py-0.5 z-20 flex items-center gap-1.5 pl-1 pr-1 py-0.5 md:gap-2 md:pl-0 md:pr-3 md:py-1 lg:gap-3 lg:pl-0 lg:pr-2 lg:py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs md:text-xs lg:text-xs xl:text-sm font-medium">
                    {/* 현재 / 전체 */}
                    <span>
                        {current + 1} <span className="text-white/50">/</span> {visualSlides.length}
                    </span>

                    {/* 재생/일시정지 버튼 */}
                    <button
                        onClick={togglePlay}
                        className="hover:text-white/80 transition-colors focus:outline-none flex items-center justify-center w-4 h-4 md:w-5 md:h-5"
                        aria-label={isPlaying ? "일시정지" : "재생"}
                    >
                        {isPlaying ? (
                            <Pause className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
                        ) : (
                            <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
                        )}
                    </button>
                </div>
            </Carousel>
        </div>
    );
}

export { MainVisualCarousel };