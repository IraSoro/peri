import { useEffect, useMemo, useState } from "react";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { Typography } from "@/components/ui/Typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/Carousel";
import { cva, type VariantProps } from "class-variance-authority";
import { useHeightTransition } from "@/lib/hooks/useHeightTransition";

export const PhaseInfoWidget = () => {
  return (
    <WidgetLayout>
      <Typography size={7} weight="bold">
        Follicular phase
      </Typography>
      <Badge text="2 days left" color="follicular" />
      <Carousel>
        <CarouselContent>
          <CarouselItem className="flex flex-col gap-2">
            <Typography size={4} weight="bold">
              About
            </Typography>
            <ExpandableText
              text={`
The luteal phase is the second half of the menstrual cycle, starting after ovulation and lasting about 14 days.

During this phase, the corpus luteum forms and releases progesterone, which prepares the uterus for a possible pregnancy.

Progesterone levels rise steadily throughout the luteal phase, causing the uterine lining to thicken and become more receptive to a fertilized egg. This hormone also affects body temperature, mood, and energy levels.

If fertilization does not occur, the corpus luteum breaks down after about 10 to 14 days, causing progesterone and estrogen levels to drop sharply. This hormonal shift triggers the shedding of the uterine lining, marking the start of menstruation and the beginning of a new cycle.

Many people experience premenstrual symptoms during the later part of the luteal phase, including bloating, breast tenderness, mood changes, and fatigue, as the body responds to the falling hormone levels.
              `}
              maxLength={230}
            />
            <SymptomsAccordion />
          </CarouselItem>
          {/*  */}
          <CarouselItem className="flex flex-col gap-2">
            <Typography size={4} weight="bold">
              About
            </Typography>
            <ExpandableText
              text={`
The luteal phase is the second half of the menstrual cycle, starting after ovulation and lasting about 14 days.

During this phase, the corpus luteum forms and releases progesterone, which prepares the uterus for a possible pregnancy.

Progesterone levels rise steadily throughout the luteal phase, causing the uterine lining to thicken and become more receptive to a fertilized egg. This hormone also affects body temperature, mood, and energy levels.

If fertilization does not occur, the corpus luteum breaks down after about 10 to 14 days, causing progesterone and estrogen levels to drop sharply. This hormonal shift triggers the shedding of the uterine lining, marking the start of menstruation and the beginning of a new cycle.

Many people experience premenstrual symptoms during the later part of the luteal phase, including bloating, breast tenderness, mood changes, and fatigue, as the body responds to the falling hormone levels.
              `}
              maxLength={230}
            />
            <SymptomsAccordion />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </WidgetLayout>
  );
};

const badgeVariants = cva(
  "rounded-2xl border-1 md:border-2 pt-0.5 pb-0.5 pe-2.5 ps-2.5 font-bold flex items-center justify-center text-center text-sm md:text-base lg:text-md",
  {
    variants: {
      color: {
        follicular:
          "bg-follicular-bg text-follicular-primary stroke-follicular-primary",
        menstrual:
          "bg-menstrual-bg text-menstrual-primary stroke-menstrual-primary",
        ovulation:
          "bg-ovulation-bg text-ovulation-primary stroke-ovulation-primary",
        luteal: "bg-luteal-bg text-luteal-primary stroke-luteal-primary",
        delayed: "bg-delayed-bg text-delayed-primary stroke-delayed-primary",
      },
    },
  },
);

type BadgeProps = {
  text: string;
} & VariantProps<typeof badgeVariants>;

const Badge = ({ text, color }: BadgeProps) => {
  return (
    <div className="flex">
      <div className={badgeVariants({ color })}>{text}</div>
    </div>
  );
};

type SymptomProps = {
  text: string;
};

const Symptom = ({ text }: SymptomProps) => {
  return (
    <div className="bg-base-secondary text-base-primary-inverse rounded-md p-1 ps-3 pe-3 text-sm md:text-lg lg:text-xl">
      {text}
    </div>
  );
};

const SymptomsAccordion = () => {
  const [value, setValue] = useState<string[]>([]);
  const { emblaApi } = useCarousel();

  // Collapse back to closed whenever the user swipes to another slide, so
  // returning to this one later doesn't leave it expanded.
  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const collapse = () => setValue([]);

    emblaApi.on("select", collapse);
    return () => {
      emblaApi.off("select", collapse);
    };
  }, [emblaApi]);

  return (
    <Accordion value={value} onValueChange={setValue}>
      <AccordionItem value="symptoms">
        <AccordionTrigger>Frequent symptoms</AccordionTrigger>
        <AccordionContent>
          <Symptom text="puffiness" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

type ExpandableTextProps = {
  text: string;
  maxLength: number;
};

const ExpandableText = ({ text, maxLength }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref: wrapperRef, captureHeight } = useHeightTransition(isExpanded);
  const { emblaApi } = useCarousel();

  const toggleExpanded = () => {
    captureHeight();
    setIsExpanded((prev) => !prev);
  };

  // Collapse back to the truncated view whenever the user swipes to another
  // slide, so returning to this one later doesn't leave it expanded.
  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const collapse = () => {
      captureHeight();
      setIsExpanded(false);
    };

    emblaApi.on("select", collapse);
    return () => {
      emblaApi.off("select", collapse);
    };
  }, [emblaApi, captureHeight]);

  const paragraphs = useMemo(
    () =>
      text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [text],
  );

  const { visible, isTruncated } = useMemo(() => {
    let used = 0;
    const result: string[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const remaining = maxLength - used;

      if (paragraph.length <= remaining) {
        result.push(paragraph);
        used += paragraph.length;
        continue;
      }

      const sliced = paragraph.slice(0, remaining);
      const lastSpace = sliced.lastIndexOf(" ");
      const clean = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;
      result.push(`${clean}...`);
      return { visible: result, isTruncated: true };
    }

    return { visible: result, isTruncated: false };
  }, [paragraphs, maxLength]);

  const displayedParagraphs = isExpanded ? paragraphs : visible;

  return (
    <div ref={wrapperRef} className="overflow-hidden">
      <div className="text-base-secondary flex flex-col gap-1 md:gap-2">
        {displayedParagraphs.map((p, index) => {
          return (
            <Typography key={index} color="secondary" size={2}>
              {p}
            </Typography>
          );
        })}
        {!isExpanded && isTruncated && (
          <Typography
            size={2}
            color="action"
            onClick={toggleExpanded}
            className="inline-block self-start"
          >
            Show more
          </Typography>
        )}
        {isExpanded && isTruncated && (
          <Typography
            size={2}
            color="action"
            onClick={toggleExpanded}
            className="inline-block self-start"
          >
            Show less
          </Typography>
        )}
      </div>
    </div>
  );
};
