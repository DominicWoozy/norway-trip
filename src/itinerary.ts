export type TripDay = {
  id: number
  date: string
  weekday: string
  place: string
  title: string
  subtitle: string
  coordinates: [number, number]
  mapZoom: number
  transport: string[]
  stay?: string
  activities: string[]
  tags: string[]
  overnight?: boolean
}

export const tripDays: TripDay[] = [
  {
    id: 1,
    date: '09.25',
    weekday: '周五',
    place: '斯塔万格',
    title: '穿越欧洲，抵达峡湾之门',
    subtitle: '北京 · 维也纳 · 奥斯陆 · 斯塔万格',
    coordinates: [5.7331, 58.969],
    mapZoom: 8.4,
    transport: [
      'OS8004 · 02:50 北京首都 T3 → 06:50 维也纳 T3',
      'OS977 · 13:00 维也纳 T3 → 15:15 奥斯陆',
      'DY548 · 20:00 奥斯陆 → 20:50 斯塔万格 · 待订',
    ],
    stay: 'Radisson Blu Atlantic Hotel Stavanger · 已预订',
    activities: ['抵达后视情况寄存大件行李', '在机场用晚餐，转机前往斯塔万格'],
    tags: ['飞行日', '转机'],
  },
  {
    id: 2,
    date: '09.26',
    weekday: '周六',
    place: '吕瑟峡湾',
    title: '登上布道石',
    subtitle: '悬于峡湾之上的经典徒步',
    coordinates: [6.1904, 58.9864],
    mapZoom: 10.8,
    transport: [
      '布道石往返大巴 · 待订',
      'SK4042 · 20:10 斯塔万格 → 21:05 奥斯陆 · 待订',
    ],
    stay: 'Radisson Blu Airport Hotel Oslo Gardermoen · 已预订',
    activities: ['布道石 Pulpit Rock 徒步', '傍晚返回斯塔万格机场', '夜宿奥斯陆机场附近'],
    tags: ['徒步', '峡湾'],
  },
  {
    id: 3,
    date: '09.27',
    weekday: '周日',
    place: '斯沃尔维尔',
    title: '飞入罗弗敦',
    subtitle: '奥斯陆 · 博德 · 斯沃尔维尔',
    coordinates: [14.57965, 68.23437],
    mapZoom: 10,
    transport: [
      'DY340 · 09:00 奥斯陆 → 10:30 博德',
      'WF826 · 12:45 博德 → 13:10 斯沃尔维尔 · 行李非直达',
    ],
    stay: 'Svinøya Rorbuer · 2间 Rorbu M2 · 已预订至 9/30',
    activities: ['13:10 抵达 SVJ，提取并重新托运行李', '取车后前往 Svinøya Rorbuer', '15:00 入住', '视天气步行或前往 Djevelporten 登山口'],
    tags: ['北极圈', '飞行'],
  },
  {
    id: 4,
    date: '09.28',
    weekday: '周一',
    place: '西罗弗敦',
    title: '驶向群岛尽头',
    subtitle: 'Haukland · Uttakleiv · Ramberg · Hamnøy · Reine',
    coordinates: [13.0888, 67.9324],
    mapZoom: 10,
    transport: ['自驾往返 · E10 西线约 260–290 公里'],
    stay: 'Svinøya Rorbuer · 已预订',
    activities: ['07:30 前出发', 'Haukland 与 Uttakleiv 海滩', 'Rambergstranda', 'Hamnøy、Sakrisøy 与 Reine', '天黑前返回斯沃尔维尔'],
    tags: ['公路', '摄影'],
  },
  {
    id: 5,
    date: '09.29',
    weekday: '周二',
    place: '东罗弗敦',
    title: '渔村、海桥与北方海岸',
    subtitle: 'Kabelvåg · Henningsvær · Gimsøy',
    coordinates: [14.2017, 68.1537],
    mapZoom: 10,
    transport: ['自驾环线 · E10 / 816 / 815 · 约100公里'],
    stay: 'Svinøya Rorbuer · 已预订',
    activities: ['Kabelvåg 与 Lofoten Cathedral', 'Henningsvær 渔村', '天气好可选 Festvågtind 短途徒步', 'Gimsøy / Hov 海岸等待日落或极光'],
    tags: ['自由行', '极光'],
  },
  {
    id: 6,
    date: '09.30',
    weekday: '周三',
    place: '挪威海',
    title: '乘邮轮北上',
    subtitle: '斯沃尔维尔 → 特罗姆瑟',
    coordinates: [16.5415, 68.7988],
    mapZoom: 6.8,
    transport: ['沿海邮轮 · 22:30 斯沃尔维尔 → 次日 14:30 特罗姆瑟'],
    activities: ['11:00 退房并寄存行李', '白天可选 Trollfjord 海鹰巡游', '返回 Svinøya 取行李', '提前到斯沃尔维尔码头登船'],
    tags: ['邮轮', '过夜航行'],
    overnight: true,
  },
  {
    id: 7,
    date: '10.01',
    weekday: '周四',
    place: '特罗姆瑟',
    title: '走进北极之都',
    subtitle: '城市、雪山与第一场极光',
    coordinates: [18.9553, 69.6492],
    mapZoom: 10.5,
    transport: ['14:30 邮轮抵达特罗姆瑟'],
    stay: 'Skaret by VANDER · 2套公寓 · 已预订至 10/04',
    activities: ['入住并寄存行李', '北极大教堂', '缆车或 Sherpatrappa 半山观景台', '城市漫步', '夜间追极光'],
    tags: ['城市', '极光'],
  },
  {
    id: 8,
    date: '10.02',
    weekday: '周五',
    place: '特罗姆瑟',
    title: '在北境追逐自然',
    subtitle: '把选择交给当天的风与雪',
    coordinates: [18.9553, 69.6492],
    mapZoom: 9.2,
    transport: ['当地一日游 · 待选择'],
    stay: 'Skaret by VANDER · 已预订',
    activities: ['观鲸 / 海钓与峡湾邮轮 / Senja 一日游 / 狗拉雪橇', '夜间追极光'],
    tags: ['自然体验', '极光'],
  },
  {
    id: 9,
    date: '10.03',
    weekday: '周六',
    place: '特罗姆瑟',
    title: '北境的自由日',
    subtitle: '补上最想体验的那一项',
    coordinates: [18.9553, 69.6492],
    mapZoom: 9.2,
    transport: ['当地一日游 · 待选择'],
    stay: 'Skaret by VANDER · 已预订',
    activities: ['灵活安排观鲸、峡湾、Senja 或狗拉雪橇', '最后一晚追极光'],
    tags: ['机动日', '极光'],
  },
  {
    id: 10,
    date: '10.04',
    weekday: '周日',
    place: '奥斯陆',
    title: '回到城市',
    subtitle: '特罗姆瑟 → 奥斯陆',
    coordinates: [10.7522, 59.9139],
    mapZoom: 10.4,
    transport: ['特罗姆瑟 → 奥斯陆 · 航班待订'],
    stay: 'Comfort Hotel Grand Central · 早餐含 · 已预订',
    activities: ['攀岩馆', '购物', '视情况游览室内景点'],
    tags: ['城市', '购物'],
  },
  {
    id: 11,
    date: '10.05',
    weekday: '周一',
    place: '返程',
    title: '带着北境回家',
    subtitle: '奥斯陆 · 慕尼黑 · 北京',
    coordinates: [10.7522, 59.9139],
    mapZoom: 8.5,
    transport: [
      'LH2453 · 11:45 奥斯陆 → 14:00 慕尼黑 T2',
      'LH722 · 19:40 慕尼黑 T2 → 次日 11:45 北京首都 T3',
    ],
    activities: ['早餐后整理行李', '提前前往奥斯陆机场'],
    tags: ['返程', '转机'],
  },
]

// Each entry is the visible map path from one itinerary day to the next.
// Intermediate stops keep the animation on the same route drawn on the map.
export const travelLegs: [number, number][][] = [
  [[5.7331, 58.969], [6.1904, 58.9864]],
  [
    [6.1904, 58.9864],
    [5.6378, 58.8767], // Stavanger Airport (SVG)
    [11.1004, 60.1939], // Oslo Airport (OSL)
    [14.3653, 67.2692], // Bodø Airport (BOO)
    [13.6094, 68.1525], // Leknes Airport (LKN)
    [13.6506, 68.2088],
  ],
  [[13.6506, 68.2088], [13.1784, 68.0892]],
  [[13.1784, 68.0892], [14.472, 68.234]],
  [
    [14.472, 68.234],
    [14.5682, 68.2317], // Svolvær
    [14.9128, 68.5646], // Stokmarknes
    [15.4138, 68.6957], // Sortland
    [15.9684, 68.9693], // Risøyhamn
    [16.5415, 68.7988], // Harstad
  ],
  [
    [16.5415, 68.7988],
    [17.9817, 69.2291], // Finnsnes
    [18.9553, 69.6492], // Tromsø
  ],
  [[18.9553, 69.6492], [18.9553, 69.6492]],
  [[18.9553, 69.6492], [18.9553, 69.6492]],
  [
    [18.9553, 69.6492],
    [18.9189, 69.6833], // Tromsø Airport (TOS)
    [11.1004, 60.1939], // Oslo Airport (OSL)
    [10.7522, 59.9139],
  ],
  [[10.7522, 59.9139], [10.7522, 59.9139]],
]

export const transportStops = [
  { code: 'SVG', name: '斯塔万格机场', mode: 'airport', coordinates: [5.6378, 58.8767] as [number, number] },
  { code: 'OSL', name: '奥斯陆机场', mode: 'airport', coordinates: [11.1004, 60.1939] as [number, number] },
  { code: 'BOO', name: '博德机场', mode: 'airport', coordinates: [14.3653, 67.2692] as [number, number] },
  { code: 'LKN', name: '莱克内斯机场', mode: 'airport', coordinates: [13.6094, 68.1525] as [number, number] },
  { code: 'TOS', name: '特罗姆瑟机场', mode: 'airport', coordinates: [18.9189, 69.6833] as [number, number] },
  { code: 'SVJ', name: '斯沃尔维尔港', mode: 'port', coordinates: [14.5682, 68.2317] as [number, number] },
  { code: 'SKN', name: '斯托克马克内斯', mode: 'port', coordinates: [14.9128, 68.5646] as [number, number] },
  { code: 'SRD', name: '索特兰', mode: 'port', coordinates: [15.4138, 68.6957] as [number, number] },
  { code: 'RIN', name: '里瑟港', mode: 'port', coordinates: [15.9684, 68.9693] as [number, number] },
  { code: 'HRD', name: '哈尔斯塔', mode: 'port', coordinates: [16.5415, 68.7988] as [number, number] },
  { code: 'FNS', name: '芬斯内斯', mode: 'port', coordinates: [17.9817, 69.2291] as [number, number] },
  { code: 'TOS', name: '特罗姆瑟', mode: 'port', coordinates: [18.9553, 69.6492] as [number, number] },
]
