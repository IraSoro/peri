import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

type SwipeDeckApi = UseEmblaCarouselType[1];

export type SlideDeckProps = {
  index?: number;
} & Pick<React.ComponentProps<"div">, "children">;

type SlideDeckContextProps = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & SlideDeckProps;

const SlideDeckContext = createContext<SlideDeckContextProps | null>(null);

export const SlideDeck = ({ index, children }: SlideDeckProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      startIndex: index || 0,
      axis: "y",
    },
    [WheelGesturesPlugin()],
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((api: SwipeDeckApi) => {
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
    <SlideDeckContext
      value={{
        children,
        emblaApi,
        emblaRef,
        scrollNext,
        scrollPrev,
        canScrollNext,
        canScrollPrev,
      }}
    >
      <div className="size-full overflow-hidden" ref={emblaRef}>
        <div className="flex size-full flex-col">
          {Children.map(children, (child, index) => (
            <div key={index} className="flex-[0_0_100%]">
              {child}
            </div>
          ))}
        </div>
      </div>
    </SlideDeckContext>
  );
};

export const useSlideDeck = () => {
  const context = useContext(SlideDeckContext);
  if (!context) {
    throw new Error("useSlideDeck must be used within a <SlideDeck />");
  }
  return context;
};
