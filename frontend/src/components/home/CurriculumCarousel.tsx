import { ChevronLeft, ChevronRight } from "lucide-react";
import Symbol from "@/assets/images/common/ic-symbol.svg";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    Separator,
} from "../ui";
import { curriculumData } from "@/constants/gotocurriculum.constants";

function CurriculumCarousel() {
    return (
        <Carousel
            opts={{
                loop: true,
                align: "start",
            }}
            className="w-full"
        >
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src={Symbol} alt="symbol" className="w-8 h-8" />
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            교육과정 바로가기
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <CarouselPrevious
                            variant="outline"
                            className="
                          static 
                          translate-y-0 
                          h-9 w-9      
                          rounded-md   
                          border-input 
                          bg-background
                          hover:bg-accent
                        "
                        >
                            {/* 기본 아이콘(화살표)은 유지하거나, 아래처럼 직접 ChevronLeft Icon을 넣어도 된다.
                             (Shadcn 기본은 ArrowLeftIcon인데, ChevronLeftIcon을 원하시면 자식으로 넣는다.) 
                         */}
                            <ChevronLeft className="h-4 w-4" />
                        </CarouselPrevious>
                        <CarouselNext
                            variant="outline"
                            className="static translate-y-0 h-9 w-9 rounded-md border-input bg-background hover:bg-accent"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </CarouselNext>
                    </div>
                </div>
                <Separator className="!h-[3px] bg-black mb-6" />
            </div>

            <CarouselContent className="-ml-6 select-none">
                {Array.from({ length: 3 })
                    .flatMap(() => curriculumData)
                    .map((curriculum, index) => (
                        <CarouselItem
                            key={`${curriculum.id}-${index}`}
                            className="pl-6 !basis-1/3 min-[600px]:!basis-1/4 min-[900px]:!basis-1/5 min-[1200px]:!basis-1/6"
                        >
                            <div className="w-full h-40 rounded-md flex flex-col items-center justify-center border gap-3 cursor-pointer hover:border-blue-500 hover:border-2 bg-white transition-all shadow-sm">
                                <img src={curriculum.icon} alt="" className="w-15 h-15" />
                                <span className="text-sm font-bold text-center whitespace-pre-line leading-tight">
                                    {curriculum.title}
                                </span>
                            </div>
                        </CarouselItem>
                    ))}
            </CarouselContent>
        </Carousel>
    );
}

export { CurriculumCarousel };
