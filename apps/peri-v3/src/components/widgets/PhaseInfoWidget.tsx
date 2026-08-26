import { useMemo, useState } from "react";
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
} from "@/components/ui/Carousel";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "../ui/Button";

export const PhaseInfoWidget = () => {
  return (
    <WidgetLayout>
      <Typography size={7} weight="bold">
        Follicular phase
      </Typography>
      <Badge text="2 days left" color="follicular" />
      <Carousel opts={{ loop: true }}>
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
            <Accordion>
              <AccordionItem>
                <AccordionTrigger>Frequent symptoms</AccordionTrigger>
                <AccordionContent>
                  <Symptom text="puffiness" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </WidgetLayout>
  );
};

const badgeVariants = cva(
  "rounded-2xl border-1 md:border-2 pt-0.5 pb-0.5 pr-2.5 pl-2.5 font-bold flex items-center justify-center text-center text-sm md:text-base lg:text-md",
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
    <div className="bg-base-secondary text-base-primary-inverse rounded-md p-1 pr-3 pl-3 text-sm md:text-lg lg:text-xl">
      {text}
    </div>
  );
};

type ExpandableTextProps = {
  text: string;
  maxLength: number;
};

const ExpandableText = ({ text, maxLength }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="text-base-secondary flex flex-col gap-1 md:gap-2">
      {displayedParagraphs.map((p, index) => {
        return (
          <Typography key={index} color="secondary" size={2}>
            {p}
          </Typography>
        );
      })}
      {!isExpanded && isTruncated && (
        <Typography size={2} color="action" onClick={() => setIsExpanded(true)}>
          Show more
        </Typography>
      )}
      {isExpanded && isTruncated && (
        <Typography
          size={2}
          color="action"
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </Typography>
      )}
    </div>
  );
};
