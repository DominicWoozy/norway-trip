import { CalendarClock, CloudSun, Gift, Shirt, Sparkles } from 'lucide-react'

const notes = [
  {
    icon: CalendarClock,
    label: 'BOOKING',
    title: '先锁定跨城交通',
    copy: '斯塔万格、罗弗敦支线航班以及沿海邮轮座位应优先确认。',
  },
  {
    icon: CloudSun,
    label: 'FLEXIBLE',
    title: '把北境交给天气',
    copy: '观鲸、Senja、徒步和缆车根据临近天气灵活选择。',
  },
  {
    icon: Sparkles,
    label: 'AURORA',
    title: '给极光三个夜晚',
    copy: '查看云量与极光预报，避开城市光害并准备完整防风保暖层。',
  },
]

const clothing = [
  '美利奴羊毛或速干贴身层',
  '抓绒 / 羊毛衫 / 轻薄羽绒',
  '防风防水硬壳与防水裤',
  '防水徒步鞋、羊毛袜',
  '帽子、手套、围巾或 Buff',
  '头灯与背包防雨罩',
]

const souvenirs = [
  '羊毛制品：Dale of Norway / Devold / Rauma',
  '萨米手工艺：认准 Sámi Duodji 认证标识',
  '奶酪刨：Bjørklund1925',
  '云莓果酱：Lerum Heimefrå / Nora',
  '巧克力糖果：Freia / Nidar',
  '咖啡与海盐：Tim Wendelboe / Solberg & Hansen / Arctic Salt',
]

export function NotesSection() {
  return (
    <section className="notes-section" id="notes">
      <div className="section-title">
        <span>03 / BEFORE DEPARTURE</span>
        <h2>给意外的风景，<br />留一点空间</h2>
      </div>
      <div className="notes-content">
        <div className="notes-grid">
          {notes.map(({ icon: Icon, label, title, copy }) => (
            <article key={label}>
              <Icon size={23} />
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>

        <div className="prep-grid">
          <article className="prep-card">
            <div className="prep-heading">
              <Shirt size={19} />
              <div><span>WHAT TO WEAR</span><h3>分层穿衣</h3></div>
            </div>
            <p>9 月底至 10 月初约 2–13°C，海边风雨会让体感更低。</p>
            <div>{clothing.map((item) => <span key={item}>{item}</span>)}</div>
          </article>

          <article className="prep-card">
            <div className="prep-heading">
              <Gift size={19} />
              <div><span>BRING IT HOME</span><h3>纪念品与特产</h3></div>
            </div>
            <p>优先选择耐运输、有产地或品牌标识的商品。</p>
            <div>{souvenirs.map((item) => <span key={item}>{item}</span>)}</div>
          </article>
        </div>
        <small className="prep-note">
          不建议携带棕色奶酪、黄油、肉制品及水产制品；食品请保留原包装与购物凭证，并遵守合理自用数量。
          <a href="https://www.moa.gov.cn/nybgb/2022/202202/202203/t20220324_6393815.htm" target="_blank" rel="noreferrer">
            查看海关禁限名录
          </a>
        </small>
      </div>
    </section>
  )
}

