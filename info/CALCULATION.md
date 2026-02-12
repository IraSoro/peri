# Description of calculations

Let's introduce two basic concepts that are necessary for calculations: cycle length and period length.

__Period length__ - days of release of blood from the uterus in a woman.
__Cycle length__ - count of days from the first day of the current period to the first day of the next period. Period is part of the cycle. The cycle begins with it.

The length of period usually 3-7 days, the length usually 21-35 days. These values may change each new cycle.

## Calculation the expected start date of the next period

Let's say we know the start date of the last period and average cycle length. Then, to calculate the start date of the next period you should:

```ts
function getNextPeriod(startDate: Date, cycleLength: number){
    return startDate.addDays(cycleLength);
}
```

But we only got the expected value, because the length of each new cycle is not always the same and this is normal. The length of the period may also change, so the length of the next period is calculated as the average value of previous ones.

## Current day of cycle

The current day of the cycle is important for next calculations. Depending on what day of the cycle it is, experience changes in the body (this is written below). This value is calculated as follows:

```ts
function getCurrentDay(startDate: Date, cycleLength: number){
    const today = new Date();
    return today.getDays() - startDate.getDays();
}
```

## Ovulation day

### What is ovulation

__Ovulation__ is the release of a mature egg from an ovarian follicle into the abdomen. The egg waits 12-48 hours for fertilization. Further fertilization is impossible. So, only during ovulation can a woman become pregnant.

Definition of the day of ovulation by calculations is only approximate. There are many reasons for this: ovulation may be early or late, there may be two, or there may not be, etc. You can find out exactly when ovulation occurred only with the help of special medical tests. But often ovulation coincides with calculations.

### How to calculate the day of ovulation

We know the value of the cycle length and the start date of the current cycle. For example, let the length of cycle is 30 days. In most cases, ovulation occurs 14 days before the start of your period (14 days before the start of a new cycle). Therefore, if the cycle length is 30 days, then ovulation will occur on ```30-14=16``` day of the cycle.

However, cycle lengths vary from month to month for the same person. To provide a more accurate ovulation window, we use the **shortest** and **longest** cycle lengths from the user's history instead of just the average.

### Improved ovulation calculation with cycle range

Since cycle lengths vary, ovulation timing also varies. By using the shortest and longest cycles, we can determine a range of days when ovulation is most likely to occur:

1. **Earliest ovulation day**: `shortestCycleLength - 14`
2. **Latest ovulation day**: `longestCycleLength - 14`

For example:
- If the shortest cycle is 26 days, earliest ovulation = `26 - 14 = 12th day`
- If the longest cycle is 32 days, latest ovulation = `32 - 14 = 18th day`
- **Ovulation window**: Days 12-18 of the cycle

This approach provides a more personalized and accurate estimation of when ovulation might occur, accounting for individual cycle variations.

### Example implementation

A basic version of the function:

```ts
function getOvulationStatus(startDate: Date, shortestCycle: number, longestCycle: number){
    const currentDay = getCurrentDay(startDate);
    const ovulationEarliest = shortestCycle - 14;
    const ovulationLatest = longestCycle - 14;
    
    const diffEarliest = ovulationEarliest - currentDay;
    const diffLatest = ovulationLatest - currentDay;

    if (diffLatest < 0){
        return "Ovulation finished";
    }
    if (diffEarliest <= 0 && diffLatest >= 0){
        return "Ovulation today or possible";
    }
    if (diffEarliest > 0){
        return `Ovulation in ${diffEarliest} Days`;
    }
}
```

Let's improve the function to account for the egg viability period (12-48 hours, approximately 2 days):

```ts
function getOvulationStatus(startDate: Date, shortestCycle: number, longestCycle: number){
    const currentDay = getCurrentDay(startDate);
    const errorMargin = 2;
    
    const ovulationEarliest = shortestCycle - 14;
    const ovulationLatest = longestCycle - 14;
    
    const diffEarliest = ovulationEarliest - currentDay;
    const diffLatest = ovulationLatest - currentDay;

    // Past ovulation window (with error margin)
    if (diffLatest < -errorMargin){
        return "Ovulation finished";
    }
    
    // Within or near ovulation window
    if (diffEarliest <= errorMargin && diffLatest >= -errorMargin){
        if (diffEarliest <= 0 && diffLatest >= 0){
            return "Ovulation today";
        }
        if (diffEarliest <= 1 && diffLatest >= 1){
            return "Ovulation tomorrow";
        }
        return "Ovulation possible";
    }
    
    // Before ovulation window
    if (diffEarliest > 0){
        return `Ovulation in ${diffEarliest} Days`;
    }
}
```

### Benefits of range-based calculation

1. **More accurate**: Accounts for individual cycle variations rather than using a single average value
2. **Wider fertility window**: Users see a more realistic range of fertile days
3. **Better for irregular cycles**: Particularly helpful for users with variable cycle lengths
4. **Personalized**: Adapts to each user's unique cycle pattern over time

## Chance of getting pregnant

As written above, pregnancy occurs only during ovulation. Therefore, during the ovulation window there is a high chance of getting pregnant. With the improved range-based calculation, we can provide a more accurate assessment:

```ts
function getPregnancyChance(startDate: Date, shortestCycle: number, longestCycle: number){
    const currentDay = getCurrentDay(startDate);
    const ovulationEarliest = shortestCycle - 14;
    const ovulationLatest = longestCycle - 14;
    
    const diffEarliest = ovulationEarliest - currentDay;
    const diffLatest = ovulationLatest - currentDay;

    // Within the ovulation window
    if (diffEarliest <= 0 && diffLatest >= 0){
        return "High";
    }
    return "Low";
}
```

Adding an error margin to account for sperm viability (up to 5 days) and egg viability (12-48 hours):

```ts
function getPregnancyChance(startDate: Date, shortestCycle: number, longestCycle: number){
    const errorMargin = 2;
    const currentDay = getCurrentDay(startDate);
    const ovulationEarliest = shortestCycle - 14;
    const ovulationLatest = longestCycle - 14;
    
    const diffEarliest = ovulationEarliest - currentDay;
    const diffLatest = ovulationLatest - currentDay;

    // Within or near the ovulation window (with error margin)
    if (diffEarliest <= errorMargin && diffLatest >= -errorMargin){
        return "High";
    }
    return "Low";
}
```

This range-based approach provides a more realistic fertility window, especially for users with irregular cycles.

## Days before period

To find out how many days are left before period, we need to know two values: the average cycle length ```lengthCycle``` and the start date of the current cycle ```startDate```. Then the calculation will look like this:

```ts
function getDaysBeforePeriod(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diffInDays = cyclesLength - currentDay;
    if (diffInDays === 0){
        return "Period is today";
    }
    return `Period in ${diffInDays} Days`;
}
```

Let's introduce one more concepts - __delay__. A delay for 8-10 days is normal, more may indicate some health problems, pregnancy or other.

Then the function will look like this:

```ts
function getDaysBeforePeriod(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diffInDays = cyclesLength - currentDay;
    if (diffInDays > 0){
        return `Period in ${diffInDays} Days`;
    }
    if (diffInDays === 0){
        return "Period is today";
    }
    return `Delay in ${Math.abs(diffInDays)} Days`;
}
```

## Phase of the cycle

### Theoretical information

The menstrual cycle can be divides into two phases: follicular and luteal. The follicular phase begins on the first day of period and ends with ovulation. The luteal phase begins after ovulation and ends with period. During these phases the main hormones are constantly rearranged, which affects the woman’s well-being. The picture below shows a graph of a 28-day cycle. It shows how hormones change during each phase

![Phase of the menstrual cycle](https://crh.ucsf.edu/media/2021/09/graph-Menstrual_Cycle.png)

As can be seen in the graph, days of menstruation are part of the follicular phase. But for more accurate description of the state of the body, I identified 4 phases:

- Menstrual phase
- Follicular phase
- Ovulation
- Luteal phase.

Each phase has characteristic symptoms. The most common and indicative of them are libido (it increases before and during ovulation), PMS (in the luteal phase), etc.

### Calculation of the current phase

For calculations we need to know the shortest and longest cycle lengths, the length of period, and start date of the cycle. As written above, the division of phases depends on ovulation, which means its calculations are also necessary. With the improved range-based approach:

```ts
function getPhase(shortestCycle: number, longestCycle: number, periodLength: number, startDate: Date){
    const currentDay = getCurrentDay(startDate);
    const lutealPhaseLength = 14;
    const errorMargin = 2;
    
    const ovulationEarliest = shortestCycle - lutealPhaseLength;
    const ovulationLatest = longestCycle - lutealPhaseLength;
    
    if (currentDay <= periodLength){
        return "Menstrual phase";
    }
    
    // Follicular phase: after period and before earliest ovulation (with error margin)
    if (currentDay <= ovulationEarliest - errorMargin){
        return "Follicular phase";
    }
    
    // Ovulation phase: from earliest to latest ovulation (with error margins)
    if (currentDay <= ovulationLatest + errorMargin){
        return "Ovulation phase";
    }
    
    // Luteal phase: after ovulation window
    return "Luteal phase";
}
```

This approach provides a wider and more accurate ovulation phase window, adapting to individual cycle variations. For example:
- User with shortest cycle 26 days, longest 32 days
- Ovulation earliest: day 12 (26-14)
- Ovulation latest: day 18 (32-14)
- With error margin: Ovulation phase spans from day 10 to day 20
- This gives a 10-day ovulation phase window instead of the traditional fixed 4-day window

## Sources

- "[Period Power](https://www.amazon.com/Period-Power-Harness-Hormones-Working/dp/147296361X): Harness Your Hormones and Get Your Cycle Working For You" by Maisie Hill;
- "[Viva la vagina.](https://www.litres.ru/book/nina-brokmann/viva-la-vagina-hvatit-zamalchivat-skrytye-vozmozhnosti-organ-31217415/) Хватит замалчивать скрытые возможности органа, который не принято называть" by Nina Brochmann and Ellen Stokken Dahl.
