import { travelLegs, tripDays, type TripDay } from '../itinerary'
import { greatCircle, type Coordinate } from '../geo/routeMath'

export type TransportMode = 'car' | 'plane' | 'ship' | 'stay'

export type NarrativeSegment = {
  id: string
  mode: TransportMode
  path: Coordinate[]
  label: string
  weight?: number
}

export type JourneyChapter = {
  id: string
  day: TripDay
  image: string
  eyebrow: string
  summary: string
  segments: NarrativeSegment[]
  cameraZoom: number
}

export type JourneyPoi = {
  name: string
  kind: 'sight' | 'food' | 'scenic'
  city: string
  coordinates: Coordinate
  image: string
  description: string
}

const PEK: Coordinate = [116.5975, 40.0799]
const VIE: Coordinate = [16.5697, 48.1103]
const OSL: Coordinate = [11.1004, 60.1939]
const SVG: Coordinate = [5.6378, 58.8767]
const BOO: Coordinate = [14.3653, 67.2692]
const LKN: Coordinate = [13.6094, 68.1525]
const TOS: Coordinate = [18.9189, 69.6833]
const MUC: Coordinate = [11.7861, 48.3538]

const flight = (id: string, from: Coordinate, to: Coordinate, label: string, weight = 1): NarrativeSegment => ({
  id,
  mode: 'plane',
  path: greatCircle(from, to),
  label,
  weight,
})

const route = (
  id: string,
  mode: Exclude<TransportMode, 'plane' | 'stay'>,
  path: Coordinate[],
  label: string,
  weight = 1,
): NarrativeSegment => ({ id, mode, path, label, weight })

const stay = (id: string, at: Coordinate, label: string): NarrativeSegment => ({
  id,
  mode: 'stay',
  path: [at, at],
  label,
  weight: 1,
})

export const journeyChapters: JourneyChapter[] = [
  {
    id: 'arrival-stavanger',
    day: tripDays[0],
    image: '/pulpit-rock.jpg',
    eyebrow: 'PEK · VIE · OSL · SVG',
    summary: '跨越欧亚大陆，经维也纳与奥斯陆转机，在夜色中抵达峡湾之门。',
    cameraZoom: 2.25,
    segments: [
      flight('pek-vie', PEK, VIE, '北京 → 维也纳', 1.5),
      flight('vie-osl', VIE, OSL, '维也纳 → 奥斯陆'),
      flight('osl-svg', OSL, SVG, '奥斯陆 → 斯塔万格', 0.8),
      route('svg-city', 'car', [SVG, tripDays[0].coordinates], '机场 → 斯塔万格市区', 0.4),
    ],
  },
  {
    id: 'pulpit-rock',
    day: tripDays[1],
    image: '/guide/preikestolen.jpg',
    eyebrow: 'RYFYLKE · LYSEFJORD',
    summary: '穿过 Ryfast 海底隧道，沿 Ryfylke 前往布道石，在吕瑟峡湾之上完成经典徒步。',
    cameraZoom: 5.75,
    segments: [
      route('stavanger-pulpit', 'car', travelLegs[0], '斯塔万格 → 布道石', 1.2),
      route('pulpit-svg', 'car', [tripDays[1].coordinates, SVG], '布道石 → 斯塔万格机场', 0.9),
      flight('svg-osl', SVG, OSL, '斯塔万格 → 奥斯陆', 0.7),
    ],
  },
  {
    id: 'fly-lofoten',
    day: tripDays[2],
    image: '/guide/reine-norway.jpg',
    eyebrow: 'OSL · BOO · LKN',
    summary: '从首都飞向北极圈，经博德换乘支线航班，在莱克内斯降落后进入罗弗敦群岛。',
    cameraZoom: 3.45,
    segments: [
      flight('osl-boo', OSL, BOO, '奥斯陆 → 博德', 1.2),
      flight('boo-lkn', BOO, LKN, '博德 → 莱克内斯', 0.8),
      route('lkn-lofoten', 'car', [LKN, tripDays[2].coordinates], '莱克内斯机场 → 罗弗敦', 0.5),
    ],
  },
  {
    id: 'lofoten-west',
    day: tripDays[3],
    image: '/guide/haukland-beach-norway.jpg',
    eyebrow: 'E10 · WEST LOFOTEN',
    summary: '沿国家景观公路穿过渔村、白沙滩与锯齿山峰，把时间留给沿途每一次停车。',
    cameraZoom: 5.85,
    segments: [route('lofoten-west-road', 'car', travelLegs[2], '罗弗敦西部景观公路')],
  },
  {
    id: 'lofoten-east',
    day: tripDays[4],
    image: '/guide/henningsv-r.jpg',
    eyebrow: 'HENNINGSVÆR · SVOLVÆR',
    summary: '继续向斯沃尔维尔方向行驶，经过海岛桥梁和渔港，等待北方最好的光。',
    cameraZoom: 5.85,
    segments: [route('lofoten-east-road', 'car', travelLegs[3], '罗弗敦东部景观公路')],
  },
  {
    id: 'coastal-night',
    day: tripDays[5],
    image: '/lofoten.jpg',
    eyebrow: 'SVOLVÆR · VESTERÅLEN',
    summary: '夜晚从斯沃尔维尔登上沿海邮轮，经过斯托克马克内斯、索特兰与里瑟港。',
    cameraZoom: 5.15,
    segments: [route('svolvaer-harstad', 'ship', travelLegs[4], '斯沃尔维尔 → 哈尔斯塔')],
  },
  {
    id: 'coastal-morning',
    day: tripDays[6],
    image: '/tromso-aurora.jpg',
    eyebrow: 'HARSTAD · FINNSNES · TROMSØ',
    summary: '清晨经过 Trondenes 与 Senja 东岸，沿 Malangen 峡湾驶入北极之都。',
    cameraZoom: 5.25,
    segments: [route('harstad-tromso', 'ship', travelLegs[5], '哈尔斯塔 → 特罗姆瑟')],
  },
  {
    id: 'tromso-city',
    day: tripDays[7],
    image: '/guide/arctic-cathedral.jpg',
    eyebrow: 'THE ARCTIC CAPITAL',
    summary: '北极大教堂、城市街区与山顶视角，入夜后把目光交给极光。',
    cameraZoom: 5.7,
    segments: [stay('tromso-city-stay', tripDays[7].coordinates, '特罗姆瑟城市日')],
  },
  {
    id: 'tromso-nature',
    day: tripDays[8],
    image: '/guide/reindeer-norway.jpg',
    eyebrow: 'WHALES · FJORDS · AURORA',
    summary: '根据天气选择观鲸、海钓、Senja 或驯鹿体验，连续第三晚追逐极光。',
    cameraZoom: 5.55,
    segments: [stay('tromso-nature-stay', tripDays[8].coordinates, '特罗姆瑟自然体验')],
  },
  {
    id: 'return-oslo',
    day: tripDays[9],
    image: '/oslo-opera.jpg',
    eyebrow: 'TOS · OSL',
    summary: '从北极圈飞回奥斯陆，在返程前用攀岩、购物和城市漫步收尾。',
    cameraZoom: 3.45,
    segments: [
      route('tromso-airport', 'car', [tripDays[9 - 1].coordinates, TOS], '市区 → 特罗姆瑟机场', 0.3),
      flight('tos-osl', TOS, OSL, '特罗姆瑟 → 奥斯陆', 1.4),
      route('osl-city', 'car', [OSL, tripDays[9].coordinates], '奥斯陆机场 → 市区', 0.4),
    ],
  },
  {
    id: 'homebound',
    day: tripDays[10],
    image: '/oslo-opera.jpg',
    eyebrow: 'OSL · MUC · PEK',
    summary: '从奥斯陆经慕尼黑返回北京，十一天的北境旅程在跨越大陆的航线上结束。',
    cameraZoom: 2.2,
    segments: [
      route('city-osl', 'car', [tripDays[10].coordinates, OSL], '奥斯陆市区 → 机场', 0.3),
      flight('osl-muc', OSL, MUC, '奥斯陆 → 慕尼黑', 0.8),
      flight('muc-pek', MUC, PEK, '慕尼黑 → 北京', 1.6),
    ],
  },
]

export const journeyPois: JourneyPoi[] = [
  {
    name: '布道石',
    kind: 'scenic',
    city: '斯塔万格',
    coordinates: [6.1904, 58.9864],
    image: '/guide/preikestolen.jpg',
    description: '悬于吕瑟峡湾上方 604 米的经典徒步目的地。',
  },
  {
    name: 'Gamle Stavanger',
    kind: 'sight',
    city: '斯塔万格',
    coordinates: [5.7248, 58.9723],
    image: '/guide/gamle-stavanger.jpg',
    description: '保存完好的白色木屋街区。',
  },
  {
    name: 'Reinehals',
    kind: 'scenic',
    city: '罗弗敦',
    coordinates: [13.0888, 67.9324],
    image: '/guide/reine-norway.jpg',
    description: '俯瞰 Reine 渔村和群山的经典公路视角。',
  },
  {
    name: 'Hauklandstranda',
    kind: 'scenic',
    city: '罗弗敦',
    coordinates: [13.545, 68.1993],
    image: '/guide/haukland-beach-norway.jpg',
    description: '被群山环抱的北极白沙滩。',
  },
  {
    name: 'Henningsvær',
    kind: 'sight',
    city: '罗弗敦',
    coordinates: [14.2017, 68.1537],
    image: '/guide/henningsv-r.jpg',
    description: '散落在海岛上的艺术渔村。',
  },
  {
    name: '北极大教堂',
    kind: 'sight',
    city: '特罗姆瑟',
    coordinates: [18.9872, 69.6487],
    image: '/guide/arctic-cathedral.jpg',
    description: '以冰山为灵感的北极城市地标。',
  },
  {
    name: 'Fjellheisen',
    kind: 'scenic',
    city: '特罗姆瑟',
    coordinates: [18.9927, 69.6427],
    image: '/guide/fjellheisen.jpg',
    description: '俯瞰城市、峡湾与群山的山顶视角。',
  },
  {
    name: 'Bardus 驯鹿料理',
    kind: 'food',
    city: '特罗姆瑟',
    coordinates: [18.9519, 69.6492],
    image: '/guide/reindeer-norway.jpg',
    description: '以北挪威食材为特色的人气小酒馆。',
  },
  {
    name: '奥斯陆歌剧院',
    kind: 'sight',
    city: '奥斯陆',
    coordinates: [10.753, 59.9075],
    image: '/oslo-opera.jpg',
    description: '可步行登上屋顶的港湾地标。',
  },
  {
    name: '维格兰雕塑公园',
    kind: 'sight',
    city: '奥斯陆',
    coordinates: [10.7002, 59.927],
    image: '/guide/frogner-park.jpg',
    description: '拥有两百余件雕塑的开放式公园。',
  },
]

export const cityQuickGuides = [
  { maxDay: 2, sights: ['布道石', '老城木屋', '石油博物馆'], foods: ['鱼汤', '腌鲱鱼', 'Pedersgata'] },
  { maxDay: 6, sights: ['Reine', 'Henningsvær', 'Haukland'], foods: ['鳕鱼干', '新鲜鳕鱼', '云莓'] },
  { maxDay: 9, sights: ['北极大教堂', 'Fjellheisen', 'Polaria'], foods: ['驯鹿', '帝王蟹', '鱼汤'] },
  { maxDay: 11, sights: ['歌剧院', '国家博物馆', '维格兰公园'], foods: ['Mathallen', '棕色奶酪华夫饼', 'Smørbrød'] },
]

export const getQuickGuide = (dayId: number) =>
  cityQuickGuides.find((guide) => dayId <= guide.maxDay) ?? cityQuickGuides.at(-1)!

export const bookingLinks = [
  { name: 'Widerøe', type: '航班', note: '博德 → 莱克内斯 / 斯沃尔维尔', url: 'https://www.wideroe.no/en' },
  { name: 'SAS', type: '航班', note: '斯塔万格、奥斯陆与特罗姆瑟', url: 'https://www.flysas.com/' },
  { name: 'Norwegian', type: '航班', note: '挪威境内航线比价', url: 'https://www.norwegian.com/en/' },
  { name: 'Hurtigruten', type: '邮轮', note: '斯沃尔维尔 → 特罗姆瑟', url: 'https://www.hurtigruten.com/en/port-to-port' },
  { name: 'Havila', type: '邮轮', note: '沿海快船分段购票', url: 'https://www.havilavoyages.com/port-to-port' },
  { name: 'Entur', type: '交通', note: '挪威全国公共交通查询', url: 'https://entur.no/' },
]

