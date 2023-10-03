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

Another example with dates:
Let period (and therefore the cycle) begin on January 1, the average length of cycle is 25 days. Then ovulation will occur on the 11th day of the cycle, that is, January 11.

So the function will look like this:

```ts
function getOvulationStatus(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diffInDays = cycleLength - currentDay;

    if (diffInDays > 14){
        return `Ovulation in ${diffInDays - 14} Days`;
    }
    if (diffInDays === 14){
        return "Ovulation today";
    }
    return "Ovulation finished";
}
```

Let's improve the function. Since the egg can exist for 12-48 hours, so ovulation can last 2 days longer. Then the function will look like this:

```ts
function getOvulationStatus(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diffInDays = cycleLength - currentDay;

    if (diffInDays > 14){
        return `Ovulation in ${diffInDays - 14} Days`;
    }
    if (diffInDays === 14){
        return "Ovulation today";
    }
    if (diffInDays >= 12){
        "Ovulation possible"
    }
    return "Ovulation finished";
}
```

## Chance of getting pregnant

As written above, the pregnancy occurs only during ovulation. Therefore, during ovulation there is a high chance of getting pregnant. Then the function will look like this:

```ts
function getPregnancyChance(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diffInDays = cycleLength - currentDay;

    if (diffInDays === 14){
        return "High";
    }
    return "Low";
}
```

But ovulation can occurs not only on the day of calculation. So, let's add an error equal to 2 days:

```ts
function getPregnancyChance(startDate: Date, cycleLength: number){
    const error = 2;
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diffInDays = cycleLength - currentDay;

    if (diffInDays >= 14 - error && diffInDays <= 14 + error){
        return "High";
    }
    return "Low";
}
```

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

For calculations we need to know three values: the length of cycle ```lengthCycle```, the length of period ```lengthPeriod``` and start date of the cycle ```startDate```. As written above, the division of phases depends on ovulation, which means it's calculations are also necessary. The function will look like this:

```ts
function getPhase(cycleLength: number, periodLength: number, startDate: Date){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const ovulationStatus = getOvulationStatus(startDate, cycleLength);
    
    if (currentDay <= periodLength){
        return "Menstrual phase";
    }
    if (ovulationStatus === "Ovulation today" && ovulationStatus === "Ovulation possible"){
        return "Ovulation phase";
    }
    if (ovulationStatus === "Ovulation finished"){
        return "Luteal phase";
    }
    return "Follicular phase";
}
```

## Sources

- "[Period Power](https://www.amazon.com/Period-Power-Harness-Hormones-Working/dp/147296361X): Harness Your Hormones and Get Your Cycle Working For You" by Maisie Hill;
- "[Viva la vagina.](https://www.litres.ru/book/nina-brokmann/viva-la-vagina-hvatit-zamalchivat-skrytye-vozmozhnosti-organ-31217415/) Хватит замалчивать скрытые возможности органа, который не принято называть" by Nina Brochmann and Ellen Stokken Dahl.
