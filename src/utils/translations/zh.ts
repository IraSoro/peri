const zh = {
  // Home Tab
  Home: "主页",
  "Period in": "下次月经", // eg. Period in 5 Days
  "no info": "没有信息",
  Period: "月经", // eg. Period today
  today: "今天",
  Delay: "延迟", // mean Period Delay
  Days: "天", // eg. "(0)[Days];(1)[Day];(2-inf)[Days];"
  "Current cycle day": "当前周期日",

  // You can write like this (general way):
  // day: "{{count}}. päivä" (päivä is day)
  // or
  // day: "{{count}}-й день" (день is day)
  // If language has specific rules then it's like this (see en.ts):
  // day_ordinal_one: "{{count}}st day",
  // day_ordinal_two: "{{count}}nd day",
  // day_ordinal_few: "{{count}}rd day",
  // day_ordinal_other: "{{count}}th day",
  day: "第{{count}}天", // eg. Period - 1st day
  Ovulation: "排卵",
  possible: "可能", // eg. Ovulation - possible
  finished: "结束", // eg. Ovulation - finished
  tomorrow: "明天", // eg. Ovulation - tomorrow
  in: "内", // eg. Period in 5 Days
  "chance of getting pregnant": "怀孕机率", // eg. High/Low chance of getting pregnant
  High: "高",
  Low: "低",
  "Period today": "今天有月经",
  edit: "编辑",
  save: "储存",
  "Period is": "月经", // eg. Period is possible today
  "possible today": "今天可能会来",

  // Details Tab
  Details: "详细内容",
  "Period length": "月经长度", // eg. Period length - 5 Days
  "Cycle length": "周期长度", // eg. Cycle length - 25 Days
  "You haven't marked any periods yet": "您还没登记任何月经",

  // Mark Modal
  mark: "登记", // eg. mark your period
  cancel: "取消",

  // Welcome Modal
  "Welcome to Peri": "欢迎使用 peri",
  "Mark the days of your": "登记您", // eg. Mark the days of your last period
  "last period": "上次月经", // eg. Mark the days of your last period
  Continue: "继续",
  "Forecast will not be generated.": "不会生成预测。",
  or: "或",

  // Info Modal
  "Frequent symptoms": "常见症状",
  "is current phase of cycle": "是周期的当前阶段", // eg. Menstrual phase is current phase of cycle"

  // Phases info
  "Menstrual phase": "月经期",
  "This cycle is accompanied by low hormone levels.":
    "这个阶段伴随着低激素水平。",
  "lack of energy and strength": "缺乏精力和力量",
  pain: "疼痛",
  "weakness and irritability": "虚弱和烦躁",
  "increased appetite": "食欲增加",

  "Follicular phase": "卵泡期",
  "The level of estrogen in this phase rises and reaches a maximum level.":
    "此阶段雌激素水平上升并达到最高水平。",
  "strength and vigor appear": "力量和活力显现",
  "endurance increases": "耐力增加",
  "new ideas and plans appear": "出现新的想法和计划",
  "libido increases": "性欲增强",

  "Ovulation phase": "排卵期",
  "Once estrogen levels peak, they trigger the release of two important ovulation hormones, follicle-stimulating hormone and luteinizing hormone.":
    "一旦雌激素水平达到峰值，就会触发两种重要的排卵激素的释放，即促卵泡激素和黄体生成激素。",
  "increased sexual desire": "性欲增强",
  "optimistic mood": "乐观情绪",
  "mild fever": "轻微发烧",
  "lower abdominal pain": "下腹部疼痛",
  "chest discomfort and bloating": "胸部不适和腹胀",
  "characteristic secretions ": "特征性分泌物",

  "Luteal phase": "黄体期",
  "Levels of the hormones estrogen and progesterone first rise and then drop sharply just before a period. Progesterone reaches its peak in the luteal phase.":
    "雌激素和孕激素的水平在月经前会先上升，然后急剧下降。孕激素在黄体期达到峰值。",
  "breast tenderness": "乳房胀痛",
  puffiness: "浮肿",
  "acne and skin rashes": "痘痘和皮疹",
  "diarrhea or constipation": "腹泻或便秘",
  "irritability and depressed mood": "烦躁和情绪低落",

  // Menu
  Preferences: "设置",
  Edit: "编辑",
  Language: "语言",
  Theme: "外观",
  "Import config": "导入配置",
  "Export config": "导出配置",
  "Configuration has been imported": "配置已导入",
  "Download latest version": "下载最新版本",
  "We are on GitHub": "我们在 github 上",
  "Stored cycles count": "存储周期计数",

  // Alert Demo
  "This is just a demo": "这只是试用版",
  "You can download the application ": "您可以下载该应用程序", // eg. You can download the application here
  here: "在此", // eg. You can download the application here

  // Notifications
  Notifications: "通知",
  "Period is coming soon": "您的经期快来了",
  "Your period may start tomorrow": "您的月经可能明天开始",
  "Your period may start today": "您的月经可能今天开始",

  //Count stored cycles
  "Confirm selection": "确认选择",
  "Are you sure you want to change the number of stored cycles?":
    "您确定要更改存储的周期次数吗",
  "Reducing the number will permanently remove some cycles.":
    "减少数量将永久删除一些周期。",
};

export default zh;
