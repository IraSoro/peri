const ar = {
  // Home Tab
  Home: "الرئيسية",
  "Period in": "الدورة خلال", // eg. Period in 5 Days
  "no info": "لا توجد معلومات",
  Period: "الدورة", // eg. Period today
  today: "اليوم",
  Delay: "تأخير", // mean Period Delay
  Days: "(0)[أيام];(1)[يوم];(2-inf)[أيام];", // eg. "(0)[Days];(1)[Day];(2-inf)[Days];"
  "Current cycle day": "اليوم الحالي من الدورة",

  // You can write like this (general way):
  // day: "{{count}}. päivä" (päivä is day)
  // or
  // day: "{{count}}-й день" (день is day)
  // If language has specific rules then it's like this (see en.ts):
  // day_ordinal_one: "{{count}}st day",
  // day_ordinal_two: "{{count}}nd day",
  // day_ordinal_few: "{{count}}rd day",
  // day_ordinal_other: "{{count}}th day",
  day: "اليوم {{count}}", // eg. Period - 1st day
  Ovulation: "التبويض",
  possible: "محتمل", // eg. Ovulation - possible
  finished: "انتهى", // eg. Ovulation - finished
  tomorrow: "غداً", // eg. Ovulation - tomorrow
  in: "خلال", // eg. Period in 5 Days
  "chance of getting pregnant": "فرصة الحمل", // eg. High/Low chance of getting pregnant
  High: "عالية",
  Low: "منخفضة",
  "Period today": "الدورة اليوم",
  edit: "تعديل",
  save: "حفظ",
  "Period is": "الدورة", // eg. Period is possible today
  "possible today": "محتملة اليوم",

  // Details Tab
  Details: "التفاصيل",
  "Period length": "مدة الدورة", // eg. Period length - 5 Days
  "Cycle length": "طول الدورة", // eg. Cycle length - 25 Days
  "You haven't marked any periods yet": "لم تقومي بتسجيل أي دورة بعد",

  // Mark Modal
  mark: "تسجيل", // eg. mark your period
  cancel: "إلغاء",

  // Welcome Modal
  "Welcome to Peri": "مرحباً بك في بيري",
  "Mark the days of your": "حددي أيام", // eg. Mark the days of your last period
  "last period": "دورتك الأخيرة", // eg. Mark the days of your last period
  Continue: "متابعة",
  "Forecast will not be generated.": "لن يتم إنشاء التوقعات.",
  or: "أو",

  // Info Modal
  "Frequent symptoms": "الأعراض الشائعة",
  "is current phase of cycle": "هي المرحلة الحالية من الدورة", // eg. Menstrual phase is current phase of cycle"

  // Phases info
  "Menstrual phase": "مرحلة الحيض",
  "This cycle is accompanied by low hormone levels.": "هذه الدورة مصحوبة بمستويات منخفضة من الهرمونات.",
  "lack of energy and strength": "نقص الطاقة والقوة",
  pain: "ألم",
  "weakness and irritability": "ضعف وتهيج",
  "increased appetite": "زيادة الشهية",

  "Follicular phase": "المرحلة الجرابية",
  "The level of estrogen in this phase rises and reaches a maximum level.":
    "يرتفع مستوى الإستروجين في هذه المرحلة ويصل إلى الحد الأقصى.",
  "strength and vigor appear": "تظهر القوة والحيوية",
  "endurance increases": "تزداد القدرة على التحمل",
  "new ideas and plans appear": "تظهر أفكار وخطط جديدة",
  "libido increases": "تزداد الرغبة الجنسية",

  "Ovulation phase": "مرحلة التبويض",
  "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.":
    "بمجرد وصول مستويات الإستروجين إلى ذروتها، فإنها تؤدي إلى إطلاق هرمونين مهمين للإباضة، الهرمون المنبه للجريب والهرمون اللوتيني.",
  "increased sexual desire": "زيادة الرغبة الجنسية",
  "optimistic mood": "مزاج متفائل",
  "mild fever": "حمى خفيفة",
  "lower abdominal pain": "ألم أسفل البطن",
  "chest discomfort and bloating": "عدم ارتياح في الصدر وانتفاخ",
  "characteristic secretions ": "إفرازات مميزة ",

  "Luteal phase": "المرحلة الأصفرية",
  "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.":
    "ترتفع مستويات هرموني الإستروجين والبروجسترون أولاً ثم تنخفض بشكل حاد قبل الدورة مباشرة. يصل البروجسترون إلى ذروته في المرحلة الأصفرية.",
  "breast tenderness": "ألم في الثدي",
  puffiness: "انتفاخ",
  "acne and skin rashes": "حب الشباب والطفح الجلدي",
  "diarrhea or constipation": "إسهال أو إمساك",
  "irritability and depressed mood": "تهيج ومزاج مكتئب",

  // Menu
  Preferences: "التفضيلات",
  Edit: "تعديل",
  Language: "اللغة",
  Theme: "المظهر",
  "Import config": "استيراد الإعدادات",
  "Export config": "تصدير الإعدادات",
  "Configuration has been imported": "تم استيراد الإعدادات",
  "Download latest version": "تحميل أحدث إصدار",
  "We are on GitHub": "نحن على GitHub",
  "Stored cycles count": "عدد الدورات المحفوظة",

  // Alert Demo
  "This is just a demo": "هذه مجرد نسخة تجريبية",
  "You can download the application ": "يمكنك تحميل التطبيق ", // eg. You can download the application here
  here: "هنا", // eg. You can download the application here

  // Notifications
  Notifications: "الإشعارات",
  "Period is coming soon": "الدورة قادمة قريباً",
  "Your period may start tomorrow": "قد تبدأ دورتك غداً",
  "Your period may start today": "قد تبدأ دورتك اليوم",

  //Count stored cycles
  "Confirm selection": "تأكيد الاختيار",
  "Are you sure you want to change the number of stored cycles?": "هل أنت متأكدة من تغيير عدد الدورات المحفوظة؟",
  "Reducing the number will permanently remove some cycles.": "سيؤدي تقليل العدد إلى إزالة بعض الدورات بشكل دائم.",
};

export default ar;
