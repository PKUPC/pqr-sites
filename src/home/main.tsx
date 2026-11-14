import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import catalog from '../../catalog.json' with { type: 'json' };
import './style.css';

function Home() {
  return <main className="home">
    <header><p className="kicker">P&amp;KU Quiz Research</p><h1>欢迎来到 PQR！</h1><p>每周五晚 22:00，在 P&amp;KU 群一起发现 Quiz 与微型谜题的乐趣。</p></header>
    <section aria-labelledby="archive-title"><h2 id="archive-title">线上存档</h2><div className="archive-grid">{catalog.map(site => <article key={site.id}>
      <a href={`/${site.id}/`}><img src={`/${site.id}/og-image.png`} alt="" width="1200" height="630" /><div className="archive-info"><p>第 {site.edition} 期</p><h3>{site.title}</h3><span>开始游玩 →</span></div></a>
    </article>)}</div></section>
    <section className="join" aria-labelledby="join-title"><h2 id="join-title">一起出题，一起解谜</h2><p>欢迎提供企划灵感、参与出题，或帮助归档与页面设计。加入 P&amp;KU 群，私聊群主了解 PQRST。</p><p>QQ 群号：649943168 · 微信公众号：PKU谜协</p></section>
    <footer><p><a href="https://info.pkupuzzle.art/archive/about" target="_blank" rel="noopener noreferrer">了解 P&amp;KU</a></p></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Home /></StrictMode>);
