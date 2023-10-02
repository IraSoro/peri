# Описание вычислений

Введем два основных понятия, которые лежат в основе вычислений: длина цикла и длина месячных.

__Длина месячных__ - дни выделения крови из матки у женщины.
__Длина цикла__ - количество дней от первого дня текущих месячных до первого дня следующих. Месячные являются частью цикла. С них начинается цикл.
Длина месячных обычно составляет 3-7 дней, длина цикла 21-35 дней. Каждый новый цикл эти значения могут меняться.

## Вычисление предполагаемой даты начала следующих месячных

Допустим, мы знаем дату начала текущих месячных и среднее значение длины цикла. Тогда, чтобы узнать дату начала следующих месячных, нужно:

```ts
function getNextPeriod(startDate: Date, cycleLength: number){
    return startDate.addDays(cycleLength);
}
```

Но мы получили лишь предполагаемое значение, потому что длина каждого нового цикла не всегда одинаковая и это нормально. Длина месячных также может отличаться, поэтому длина следующих месячных вычисляется как среднее значение предыдущих.

## Текущий день цикла

Текущий день цикла важен для дальнейших вычислений. В зависимости от того, какой сейчас день цикла, в организме происходят соответствующие изменения (об этом написано ниже). Это значение вычисляется следующим образом:

```ts
function getCurrentDay(startDate: Date, cycleLength: number){
    const today = new Date();
    return today.getDays() - startDate.getDays();
}
```

## День овуляции

### Немного о том, что такое овуляция

__Овуляция__ - это выход зрелой яйцеклетки из фолликула яичника в брюшную полость. Яйцеклетка ждет своего оплодотворения 12-48 часов. Дальше оплодотворение невозможно. Таким образом, только в овуляцию девушка может забеременеть.

Определение дня овуляции путем вычислений дает только примерный результат. На это есть много причин: овуляция может быть ранней или поздней, ее может быть две, а может не быть и вовсе и тд. Точно узнать, когда произошла овуляция, можно только с помощью специальных медицинских тестов. Но часто овуляции совпадает с вычислениями.

### Как рассчитать день овуляции

Пусть мы знаем значение длины цикла и дату начала текущего цикла. Для примера, пусть длина цикла будет 30 дней. В большинстве случаев овуляция происходит за 14 дней до начала месячных, то есть за 14 дней до начала нового цикла. Следовательно, если длина цикла 30 дней, тогда овуляция произойдет на ```30-14=16``` день цикла.

Еще пример с датами:
Пусть месячные (а следовательно и цикл) начались 1 января, средняя длина месячных 25 дней. Тогда овуляция произойдет на 11 дней цикла, то есть 11 января.

Таким образом, функция будет выглядеть следующим образом:

```ts
function getOvulationStatus(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diff = cycleLength - currentDay;

    if (diff > 14){
        return `Ovulation in ${diff - 14} Days`;
    }
    if (diff === 14){
        return "Ovulation today";
    }
    return "Ovulation finished";
}
```

Немного усовершенствуем функцию. Так как яйцеклетка может существовать 12-48 часов, следовательно, овуляция может длиться дольше на 2 дня. Тогда функция будет выглядеть следующим образом:

```ts
function getOvulationStatus(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diff = cycleLength - currentDay;

    if (diff > 14){
        return `Ovulation in ${diff - 14} Days`;
    }
    if (diff === 14){
        return "Ovulation today";
    }
    if (diff >= 12){
        "Ovulation possible"
    }
    return "Ovulation finished";
}
```

## Шанс забеременеть

Как написано выше, беременность происходит только в овуляцию. Тогда получается, что в дни овуляции высокий шанс забеременеть. Тогда функция будет выглядеть так:

```ts
function getPregnancyChance(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diff = cycleLength - currentDay;

    if (diff === 14){
        return "High";
    }
    return "Low";
}
```

Но, как описано в предыдущем разделе, овуляция может происходить не только в день расчетов. Поэтому добавим равную в 2 дня погрешность:

```ts
function getPregnancyChance(startDate: Date, cycleLength: number){
    const error = 2;
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diff = cycleLength - currentDay;

    if (diff >= 14 - error && diff <= 14 + error){
        return "High";
    }
    return "Low";
}
```

## Количество дней до месячных

Чтобы узнать, сколько дней осталось до месячных, нам необходимо знать два значения: средняя длина цикла ```lengthCycle``` и дата начала текущего цикла ```startDate```. Тогда расчеты будут выглядеть так:

```ts
function getDaysBeforePeriod(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diff = cyclesLength - currentDay;
    if (diff === 0){
        return "Period is today";
    }
    return `Period in ${diff} Days`;
}
```

Может возникнуть ситуация, когда предполагаемый день месячный прошел, а месячные так и не наступили. В этом случае введем понятие "задержка". Задержка до 8-10 дней считается нормой, больше может говорить о некоторых проблемах со здоровьем, беременности и другом.

После этого функция будет выглядеть так:

```ts
function getDaysBeforePeriod(startDate: Date, cycleLength: number){
    const currentDay = getCurrentDay(startDate, cycleLength);
    const diff = cyclesLength - currentDay;
    if (diff > 0){
        return `Period in ${diff} Days`;
    }
    if (diff === 0){
        return "Period is today";
    }
    return `Delay ${Math.abs(diff)} Days`;
}
```

## Фазы цикла

### Теоретическая информация

Весь менструальный цикл можно разделить на 2 фазы: фолликулярную и лютеиновую. Фолликулярна фаза начинается с первого дня месячных и заканчивается овуляцией. Лютеиновая фаза начинается после овуляции и заканчивается месячными. В течение этих фаз главные гормоны постоянно перестраиваются, что сказывается на самочувствие. Ниже на картинке представлен график 28-дневного цикла. На нем показано, как меняются гормоны в каждую фазу.

![Фазы менструального цикла](https://qpicture.ru/images/2022/12/27/crc.jpg)

Как видно на графике, дни месячных входят в фолликулярную фазу. Однако, для более точного описание состояния организма, я выделила 4 фазы:

- Менструальная фаза
- Фолликулярная фаза
- Овуляция
- Лютеиновая фаза.

Для каждой фазы из-за перестройки гормонов свойственны характерные симптомы. Наиболее частый и показательный из них - это либидо (перед и во время овуляции оно возрастает), ПМС (характерен для лютеиновой фазы) и др.

### Расчет текущей фазы

Для расчетов нам необходимо знать три значения: длина цикла ```lengthCycle```, длина месячных ```lengthPeriod``` и дата начала цикла ```startDate```. Как описано выше, деление фаз зависит от овуляции, значит ее расчеты также необходимы. Функция будет выглядеть следующим образом:

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

## Источники

- "[Period Power](https://www.amazon.com/Period-Power-Harness-Hormones-Working/dp/147296361X): Harness Your Hormones and Get Your Cycle Working For You" by Maisie Hill;
- "[Viva la vagina.](https://www.litres.ru/book/nina-brokmann/viva-la-vagina-hvatit-zamalchivat-skrytye-vozmozhnosti-organ-31217415/) Хватит замалчивать скрытые возможности органа, который не принято называть" by Nina Brochmann and Ellen Stokken Dahl.
