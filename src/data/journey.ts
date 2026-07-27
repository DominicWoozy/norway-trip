import { tripDays, type TripDay } from '../itinerary'
import { greatCircle, type Coordinate } from '../geo/routeMath'
import { assetUrl } from '../assets'
import { ROAD_ROUTES } from './roadRoutes'
import { UPDATED_ROAD_ROUTES } from './updatedRoadRoutes'
import {
  COASTAL_HARSTAD_TROMSO,
  COASTAL_SVOLVAER_HARSTAD,
  TROLLFJORD_SEA_ROUTE,
} from './seaRoutes'

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

export type JourneyHotel = {
  id: string
  name: string
  city: string
  coordinates: Coordinate
  dates: string
  chapterIds: string[]
}

const PEK: Coordinate = [116.5975, 40.0799]
const PEK_CLIMB: Coordinate = [115.55, 40.55]
const VIE: Coordinate = [16.5697, 48.1103]
const OSL: Coordinate = [11.1004, 60.1939]
const SVG: Coordinate = [5.6378, 58.8767]
const BOO: Coordinate = [14.3653, 67.2692]
const TOS: Coordinate = [18.9189, 69.6833]
const MUC: Coordinate = [11.7861, 48.3538]
const BODO_FERRY: Coordinate = [14.394, 67.2883]
const MOSKENES_FERRY: Coordinate = [13.046522, 67.900209]
const MARGITHUSET: Coordinate = [13.096533, 67.941533]
const STAVANGER_HOTEL: Coordinate = [5.7308, 58.96833]
const OSLO_AIRPORT_HOTEL: Coordinate = [11.09552, 60.19237]
const SVINOYA: Coordinate = [14.57965, 68.23437]
const TROMSO_PORT: Coordinate = [18.9553, 69.6492]
const TROMSO_HOTEL: Coordinate = [18.95198, 69.646]
const OSLO_CENTRAL_HOTEL: Coordinate = [10.75055, 59.91058]
const SVOLVAER_PORT: Coordinate = [14.5682, 68.2317]
const REINE: Coordinate = [13.0888, 67.9324]
const ANITAS_SJOMAT: Coordinate = [13.111263, 67.941906]
const A_I_LOFOTEN: Coordinate = [12.9814, 67.8804]
const HENNINGSVAER: Coordinate = [14.2017, 68.1537]
const BODO_MOSKENES_FERRY = greatCircle(BODO_FERRY, MOSKENES_FERRY, 48)

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
): NarrativeSegment => ({
  id,
  mode,
  path: mode === 'car' ? UPDATED_ROAD_ROUTES[id] ?? ROAD_ROUTES[id] ?? path : path,
  label,
  weight,
})

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
    image: assetUrl('pulpit-rock.jpg'),
    eyebrow: 'PEK · VIE · OSL · SVG',
    summary: '跨越欧亚大陆，经维也纳与奥斯陆转机，在夜色中抵达峡湾之门。',
    cameraZoom: 2.25,
    segments: [
      flight('pek-takeoff', PEK, PEK_CLIMB, '北京首都机场 · 起飞', 0.35),
      flight('pek-vie', PEK_CLIMB, VIE, '北京 → 维也纳', 1.5),
      flight('vie-osl', VIE, OSL, '维也纳 → 奥斯陆'),
      flight('osl-svg', OSL, SVG, '奥斯陆 → 斯塔万格', 0.8),
      route('svg-city', 'car', [SVG, STAVANGER_HOTEL], '机场 → 斯塔万格酒店', 0.4),
    ],
  },
  {
    id: 'pulpit-rock',
    day: tripDays[1],
    image: assetUrl('guide/preikestolen.jpg'),
    eyebrow: 'RYFYLKE · LYSEFJORD',
    summary: '穿过 Ryfast 海底隧道，沿 Ryfylke 前往布道石，在吕瑟峡湾之上完成经典徒步。',
    cameraZoom: 5.75,
    segments: [
      route('stavanger-pulpit', 'car', [STAVANGER_HOTEL, [6.1904, 58.9864]], '斯塔万格 → 布道石', 1.2),
      route('pulpit-svg', 'car', [tripDays[1].coordinates, SVG], '布道石 → 斯塔万格机场', 0.9),
      flight('svg-osl', SVG, OSL, '斯塔万格 → 奥斯陆', 0.7),
      route('osl-airport-hotel', 'car', [OSL, OSLO_AIRPORT_HOTEL], '奥斯陆机场 → 机场酒店', 0.2),
      stay('oslo-airport-night', OSLO_AIRPORT_HOTEL, '入住 Radisson Blu Airport Hotel'),
    ],
  },
  {
    id: 'fly-lofoten',
    day: tripDays[2],
    image: assetUrl('guide/reine-norway.jpg'),
    eyebrow: 'OSL · BOO · MOSKENES',
    summary: '09:00 从奥斯陆飞抵博德，打车前往渡轮码头，13:00 横渡 Vestfjorden，16:15 抵达 Moskenes 后入住 Reine。',
    cameraZoom: 3.45,
    segments: [
      route('hotel-osl-airport', 'car', [OSLO_AIRPORT_HOTEL, OSL], '机场酒店 → OSL 航站楼', 0.2),
      flight('osl-boo', OSL, BOO, '奥斯陆 → 博德', 1.2),
      route('boo-ferry', 'car', [BOO, BODO_FERRY], '博德机场 → 博德渡轮码头', 0.25),
      route('bodo-moskenes-ferry', 'ship', BODO_MOSKENES_FERRY, 'Torghatten Nord · 博德 → Moskenes', 1.1),
      route('moskenes-margithuset', 'car', [MOSKENES_FERRY, MARGITHUSET], 'Moskenes 码头 → Margithuset', 0.25),
      stay('margithuset-checkin', MARGITHUSET, '入住 Margithuset'),
    ],
  },
  {
    id: 'lofoten-west',
    day: tripDays[3],
    image: assetUrl('guide/reine-norway.jpg'),
    eyebrow: 'Å · SAKRISØY · REINE',
    summary: '继续住在 Reine 南部，以公交或出租车串联 Å、Sakrisøy 与 Reinebringen；天气不佳时改去 Ramberg 海滩。',
    cameraZoom: 5.85,
    segments: [
      route(
        'reine-local-loop',
        'car',
        [MARGITHUSET, A_I_LOFOTEN, ANITAS_SJOMAT, REINE, MARGITHUSET],
        'Margithuset → Å → Anita’s Sjømat → Reinebringen → 酒店',
      ),
      stay('margithuset-second-night', MARGITHUSET, '继续入住 Margithuset'),
    ],
  },
  {
    id: 'lofoten-east',
    day: tripDays[4],
    image: assetUrl('guide/henningsv-r.jpg'),
    eyebrow: 'REINE · SVOLVÆR · HENNINGSVÆR',
    summary: '11:00 退房后搭乘300路穿越E10，约14:30入住Svinøya；下午换乘743路游览Henningsvær。',
    cameraZoom: 5.85,
    segments: [
      route(
        'margithuset-svinoya-bus',
        'car',
        [MARGITHUSET, SVINOYA],
        '300路 · Reine → Leknes → Svolvær',
      ),
      stay('svinoya-checkin', SVINOYA, '15:00 入住 Svinøya Rorbuer'),
      route(
        'svinoya-henningsvaer-bus',
        'car',
        [SVINOYA, HENNINGSVAER, SVINOYA],
        '743路 · Svolvær ↔ Henningsvær',
        0.55,
      ),
      stay('svinoya-night', SVINOYA, '返回 Svinøya Rorbuer'),
    ],
  },
  {
    id: 'coastal-night',
    day: tripDays[5],
    image: assetUrl('lofoten.jpg'),
    eyebrow: 'SVOLVÆR · VESTERÅLEN',
    summary: '退房寄存行李后，从静音电动巡游或 RIB 海鹰 Safari 中二选一；傍晚购物，22:30 搭乘已预订邮轮北上。',
    cameraZoom: 5.15,
    segments: [
      route('hotel-trollfjord-port', 'car', [SVINOYA, SVOLVAER_PORT], '酒店 → Trollfjord 巡游码头', 0.25),
      route(
        'trollfjord-day-cruise',
        'ship',
        TROLLFJORD_SEA_ROUTE,
        '斯沃尔维尔 → Raftsundet → Trollfjord → 斯沃尔维尔',
        0.9,
      ),
      route('port-hotel-port', 'car', [SVOLVAER_PORT, SVINOYA, SVOLVAER_PORT], '取行李 → 沿海邮轮码头', 0.3),
      route(
        'svolvaer-harstad',
        'ship',
        COASTAL_SVOLVAER_HARSTAD,
        '22:30 斯沃尔维尔 → 哈尔斯塔',
        1.1,
      ),
    ],
  },
  {
    id: 'coastal-morning',
    day: tripDays[6],
    image: assetUrl('tromso-aurora.jpg'),
    eyebrow: 'HARSTAD · FINNSNES · TROMSØ',
    summary: '清晨经过 Trondenes 与 Senja 东岸，沿 Malangen 峡湾驶入北极之都。',
    cameraZoom: 5.25,
    segments: [
      route('harstad-tromso', 'ship', COASTAL_HARSTAD_TROMSO, '哈尔斯塔 → 特罗姆瑟'),
      route('tromso-port-hotel', 'car', [TROMSO_PORT, TROMSO_HOTEL], '特罗姆瑟码头 → Skaret by VANDER', 0.25),
      stay('skaret-checkin', TROMSO_HOTEL, '入住 Skaret by VANDER'),
    ],
  },
  {
    id: 'tromso-city',
    day: tripDays[7],
    image: assetUrl('guide/arctic-cathedral.jpg'),
    eyebrow: 'THE ARCTIC CAPITAL',
    summary: '北极大教堂、城市街区与山顶视角，入夜后把目光交给极光。',
    cameraZoom: 5.7,
    segments: [stay('tromso-city-stay', tripDays[7].coordinates, '特罗姆瑟城市日')],
  },
  {
    id: 'tromso-nature',
    day: tripDays[8],
    image: assetUrl('guide/reindeer-norway.jpg'),
    eyebrow: 'WHALES · FJORDS · AURORA',
    summary: '根据天气选择观鲸、海钓、Senja 或驯鹿体验，连续第三晚追逐极光。',
    cameraZoom: 5.55,
    segments: [stay('tromso-nature-stay', tripDays[8].coordinates, '特罗姆瑟自然体验')],
  },
  {
    id: 'return-oslo',
    day: tripDays[9],
    image: assetUrl('oslo-opera.jpg'),
    eyebrow: 'TOS · OSL',
    summary: '从北极圈飞回奥斯陆，在返程前用攀岩、购物和城市漫步收尾。',
    cameraZoom: 3.45,
    segments: [
      route('tromso-airport', 'car', [TROMSO_HOTEL, TOS], 'Skaret by VANDER → 特罗姆瑟机场', 0.3),
      flight('tos-osl', TOS, OSL, 'DY381 · 12:55 特罗姆瑟 → 14:50 奥斯陆', 1.4),
      route('osl-city', 'car', [OSL, OSLO_CENTRAL_HOTEL], '奥斯陆机场 → Comfort Hotel Grand Central', 0.4),
    ],
  },
  {
    id: 'homebound',
    day: tripDays[10],
    image: assetUrl('oslo-opera.jpg'),
    eyebrow: 'OSL · MUC · PEK',
    summary: '从奥斯陆经慕尼黑返回北京，十一天的北境旅程在跨越大陆的航线上结束。',
    cameraZoom: 2.2,
    segments: [
      route('city-osl', 'car', [OSLO_CENTRAL_HOTEL, OSL], 'Comfort Hotel Grand Central → 奥斯陆机场', 0.3),
      flight('osl-muc', OSL, MUC, '奥斯陆 → 慕尼黑', 0.8),
      flight('muc-pek', MUC, PEK, '慕尼黑 → 北京', 1.6),
    ],
  },
]

export const journeyHotels: JourneyHotel[] = [
  {
    id: 'radisson-stavanger',
    name: 'Radisson Blu Atlantic Hotel Stavanger',
    city: '斯塔万格',
    coordinates: STAVANGER_HOTEL,
    dates: '09.25–09.26',
    chapterIds: ['arrival-stavanger', 'pulpit-rock'],
  },
  {
    id: 'radisson-oslo-airport',
    name: 'Radisson Blu Airport Hotel Oslo Gardermoen',
    city: '奥斯陆机场',
    coordinates: OSLO_AIRPORT_HOTEL,
    dates: '09.26–09.27',
    chapterIds: ['pulpit-rock', 'fly-lofoten'],
  },
  {
    id: 'margithuset',
    name: 'Margithuset',
    city: 'Reine',
    coordinates: MARGITHUSET,
    dates: '09.27–09.29 · 2晚',
    chapterIds: ['fly-lofoten', 'lofoten-west'],
  },
  {
    id: 'svinoya-rorbuer',
    name: 'Svinøya Rorbuer',
    city: '斯沃尔维尔',
    coordinates: SVINOYA,
    dates: '09.29–09.30 · 1晚',
    chapterIds: ['lofoten-east', 'coastal-night'],
  },
  {
    id: 'skaret-vander',
    name: 'Skaret by VANDER',
    city: '特罗姆瑟',
    coordinates: TROMSO_HOTEL,
    dates: '10.01–10.04 · 3晚',
    chapterIds: ['coastal-morning', 'tromso-city', 'tromso-nature'],
  },
  {
    id: 'comfort-oslo',
    name: 'Comfort Hotel Grand Central',
    city: '奥斯陆中央站',
    coordinates: OSLO_CENTRAL_HOTEL,
    dates: '10.04–10.05',
    chapterIds: ['return-oslo', 'homebound'],
  },
]

export const journeyPois: JourneyPoi[] = [
  {
    name: '布道石',
    kind: 'scenic',
    city: '斯塔万格',
    coordinates: [6.1904, 58.9864],
    image: assetUrl('guide/preikestolen.jpg'),
    description: '悬于吕瑟峡湾上方 604 米的经典徒步目的地。',
  },
  {
    name: 'Gamle Stavanger',
    kind: 'sight',
    city: '斯塔万格',
    coordinates: [5.7248, 58.9723],
    image: assetUrl('guide/gamle-stavanger.jpg'),
    description: '保存完好的白色木屋街区。',
  },
  {
    name: 'Reinehals',
    kind: 'scenic',
    city: '罗弗敦',
    coordinates: [13.0888, 67.9324],
    image: assetUrl('guide/reine-norway.jpg'),
    description: '俯瞰 Reine 渔村和群山的经典公路视角。',
  },
  {
    name: 'Hauklandstranda',
    kind: 'scenic',
    city: '罗弗敦',
    coordinates: [13.545, 68.1993],
    image: assetUrl('guide/haukland-beach-norway.jpg'),
    description: '被群山环抱的北极白沙滩。',
  },
  {
    name: 'Henningsvær',
    kind: 'sight',
    city: '罗弗敦',
    coordinates: [14.2017, 68.1537],
    image: assetUrl('guide/henningsv-r.jpg'),
    description: '散落在海岛上的艺术渔村。',
  },
  {
    name: '北极大教堂',
    kind: 'sight',
    city: '特罗姆瑟',
    coordinates: [18.9872, 69.6487],
    image: assetUrl('guide/arctic-cathedral.jpg'),
    description: '以冰山为灵感的北极城市地标。',
  },
  {
    name: 'Fjellheisen',
    kind: 'scenic',
    city: '特罗姆瑟',
    coordinates: [18.9927, 69.6427],
    image: assetUrl('guide/fjellheisen.jpg'),
    description: '俯瞰城市、峡湾与群山的山顶视角。',
  },
  {
    name: 'Bardus 驯鹿料理',
    kind: 'food',
    city: '特罗姆瑟',
    coordinates: [18.9519, 69.6492],
    image: assetUrl('guide/reindeer-norway.jpg'),
    description: '以北挪威食材为特色的人气小酒馆。',
  },
  {
    name: '奥斯陆歌剧院',
    kind: 'sight',
    city: '奥斯陆',
    coordinates: [10.753, 59.9075],
    image: assetUrl('oslo-opera.jpg'),
    description: '可步行登上屋顶的港湾地标。',
  },
  {
    name: '维格兰雕塑公园',
    kind: 'sight',
    city: '奥斯陆',
    coordinates: [10.7002, 59.927],
    image: assetUrl('guide/frogner-park.jpg'),
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

