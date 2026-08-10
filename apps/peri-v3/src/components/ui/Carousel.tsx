import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { cn } from "@/lib/utils/cn";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];

type CarouselProps = {
  orientation?: "horizontal" | "vertical";
  opts?: CarouselOptions;
} & React.ComponentProps<"div">;

type CarouselContextProps = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

export const Carousel = ({
  orientation = "horizontal",
  opts,
  children,
  ...props
}: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <CarouselContext
      value={{
        children,
        emblaApi,
        emblaRef,
        orientation:
          orientation || (opts?.axis === "x" ? "horizontal" : "vertical"),
        opts,
        scrollNext,
        scrollPrev,
        canScrollNext,
        canScrollPrev,
      }}
    >
      <div {...props} className="relative">
        {children}
      </div>
      <CarouselControls />
    </CarouselContext>
  );
};

export type CarouselContentProps = React.ComponentProps<"div">;

export const CarouselContent = ({ ...props }: CarouselContentProps) => {
  const { emblaRef, orientation } = useCarousel();

  return (
    <div
      ref={emblaRef}
      className={cn("overflow-hidden", orientation === "vertical" && "h-full")}
    >
      <div
        {...props}
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "-ml-1 touch-pan-x flex-row"
            : "-mt-1 h-full touch-pan-y flex-col",
        )}
      />
    </div>
  );
};

export type CarouselItemProps = React.ComponentProps<"div">;

export const CarouselItem = ({ className, ...props }: CarouselItemProps) => {
  const { orientation } = useCarousel();

  return (
    <div
      {...props}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-1" : "pt-1",
        className,
      )}
    />
  );
};

const CarouselControls = () => {
  const { emblaApi } = useCarousel();

  const [numOfSlides, setNumOfSlides] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onInit = () => {
      setNumOfSlides(emblaApi.scrollSnapList().length);
    };

    const onSelect = () => {
      setActiveSlide(emblaApi.selectedScrollSnap());
    };

    onInit();
    onSelect();

    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (numOfSlides <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: numOfSlides }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "size-3.5 rounded-full",
            activeSlide === index
              ? "bg-base-primary"
              : "stroke-base-primary border",
          )}
        />
      ))}
    </div>
  );
};
