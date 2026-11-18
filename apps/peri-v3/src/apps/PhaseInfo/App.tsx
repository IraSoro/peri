import { useEffect, useMemo, useState } from "react";
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
import { defineInternalApp } from "@/lib/sdk/app/api";
import { NoDataError } from "@/lib/sdk/app/errors";
import { useCycles, usePredictions } from "@/lib/sdk/app/hooks";
import {
  daysLeftInPhase,
  daysUntilPhase,
  periodStatus,
} from "@/lib/sdk/calculations/predictions";
import type { Phase } from "@/lib/sdk/types";
import type { Cycle } from "@repo/config-schema/config-v2.schema";
import { manifest } from "./manifest";

const PHASES: Record<
  Phase,
  { name: string; about: string; symptoms: string[] }
> = {
  menstrual: {
    name: "Menstrual phase",
    about:
      "Placeholder text about the menstrual phase.\n\nIt will tell what happens in the body and what to expect.",
    symptoms: [
      "cramps",
      "lower back pain",
      "fatigue",
      "headache",
      "bloating",
      "mood swings",
    ],
  },
  follicular: {
    name: "Follicular phase",
    about:
      "The follicular phase starts on the first day of your period and lasts until ovulation, usually about 10 to 16 days.\n\nThe pituitary gland releases follicle-stimulating hormone, which makes several follicles in the ovaries grow. One of them becomes dominant and matures an egg, while the others fade away.\n\nAs the follicles grow, estrogen rises. It rebuilds the uterine lining after your period and often brings more energy, a better mood and clearer skin.\n\nTowards the end of the phase estrogen peaks, which triggers a surge of luteinizing hormone and leads to ovulation.",
    symptoms: [
      "more energy",
      "better mood",
      "clearer skin",
      "higher motivation",
    ],
  },
  ovulation: {
    name: "Ovulation",
    about:
      "Ovulation is the release of a mature egg from the ovary. It usually happens once per cycle, about 14 days before the next period.\n\nThe egg travels down the fallopian tube and can be fertilized for about 12 to 24 hours. Sperm can live for up to five days, so the days before ovulation are fertile too.\n\nSome people notice clear, stretchy cervical mucus, mild pain on one side of the lower abdomen, a slight rise in basal body temperature or increased desire.",
    symptoms: [
      "stretchy discharge",
      "one-sided pain",
      "higher desire",
      "slight temperature rise",
      "breast tenderness",
    ],
  },
  luteal: {
    name: "Luteal phase",
    about:
      "The luteal phase is the second half of the cycle, starting after ovulation and lasting about 14 days.\n\nThe empty follicle turns into the corpus luteum and releases progesterone, which prepares the uterus for a possible pregnancy. Body temperature rises slightly and energy may drop.\n\nIf the egg is not fertilized, the corpus luteum breaks down, progesterone and estrogen fall sharply and the uterine lining is shed, which starts the next period.\n\nMany people notice bloating, breast tenderness, mood changes and fatigue in the last days of this phase.",
    symptoms: [
      "bloating",
      "breast tenderness",
      "irritability",
      "food cravings",
      "puffiness",
      "fatigue",
      "trouble sleeping",
    ],
  },
};

const ORDER: Phase[] = ["menstrual", "follicular", "ovulation", "luteal"];

export const PhaseInfoApp = () => {
  const [cycles] = useCycles();
  if (cycles.length === 0) {
    throw new NoDataError(
      "The phase and its details appear after your first logged period.",
    );
  }
  return <PhaseInfo cycles={cycles} />;
};

const PhaseInfo = ({ cycles }: { cycles: Cycle[] }) => {
  const predictions = usePredictions();
  const { phase, late } = periodStatus(predictions, cycles);
  const daysLeft = daysLeftInPhase(predictions, cycles);
  // The current phase first, then the others in the order they come
  const order = [
    ...ORDER.slice(ORDER.indexOf(phase)),
    ...ORDER.slice(0, ORDER.indexOf(phase)),
  ];
  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {order.map((item) => {
            const { name, about, symptoms } = PHASES[item];
            return (
              <CarouselItem key={item} className="flex flex-col gap-2 md:gap-4">
                <Typography size={7} weight="bold">
                  {name}
                </Typography>
                <PhaseBadge
                  phase={item}
                  delay={late}
                  current={item === phase}
                  daysLeftInPhase={item === phase ? daysLeft : undefined}
                  daysUntilNextPhase={
                    item === phase
                      ? undefined
                      : daysUntilPhase(predictions, cycles, item)
                  }
                />
                <Typography size={4} weight="bold">
                  About
                </Typography>
                <ExpandableText text={about} maxLength={230} />
                <SymptomsAccordion symptoms={symptoms} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

const PhaseBadge = ({
  phase,
  delay,
  current,
  daysLeftInPhase,
  daysUntilNextPhase,
}: {
  phase: Phase;
  current: boolean;
  delay: number | undefined;
  daysLeftInPhase: number | undefined;
  daysUntilNextPhase: number | undefined;
}) => {
  const days = (count: number) => {
    return `${count} ${count === 1 ? "day" : "days"}`;
  };
  if (delay !== undefined) {
    if (current) {
      return <Badge text={`delay ${days(delay)}`} color="delayed" />;
    }
    return (
      <>
        <Badge
          text={
            daysUntilNextPhase === undefined
              ? "will be estimated"
              : daysUntilNextPhase === 0
                ? "any day now"
                : `in ${days(daysUntilNextPhase)}`
          }
          color={daysUntilNextPhase === undefined ? "delayed" : phase}
        />
        <Typography size={1} color="secondary">
          {daysUntilNextPhase === undefined
            ? "Your period is late, so this phase can't be predicted until it starts."
            : `Your period is ${days(delay)} late, so this date is moved by the delay and may change.`}
        </Typography>
      </>
    );
  }
  if (daysLeftInPhase !== undefined) {
    return <Badge text={`${days(daysLeftInPhase)} left`} color={phase} />;
  }
  if (daysUntilNextPhase !== undefined) {
    return <Badge text={`in ${days(daysUntilNextPhase)}`} color={phase} />;
  }
  return null;
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

const SymptomsAccordion = ({ symptoms }: { symptoms: string[] }) => {
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
          {symptoms.map((symptom) => {
            return <Symptom key={symptom} text={symptom} />;
          })}
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

void defineInternalApp(manifest, {
  component: PhaseInfoApp,
});
