export function Introduction() {
  return <>
<section className="section intro" aria-label="PQR 介绍和招募">
  <p><strong>欢迎来到 PQR！</strong><br />
    这是 P&amp;KU 群在每周五晚 22:00 举行的 Quiz/微型谜题企划 P&amp;KU Quiz Research！前两次企划分别为“说文解字”与“缩写”。而这次则是“unicode+1”！</p>
  <p><strong>P&amp;KU Quiz Research Secret Team 招募中！</strong>如果您愿意建设每周五的 PQR 企划（P&amp;KU Quiz Research），无论是出题、提供企划灵感，亦或是帮助归档与设计每次的内容，都欢迎私聊加入 PQRST，和我们共同发现变体 Quiz 的乐趣——</p>
  <div className="intro-footer">
    <p className="contacts"><span>QQ 群号：649943168</span><span>公众号：PKU谜协</span></p>
    <dl className="staff-credits">
      <div><dt>策划</dt><dd>Winfrid</dd></div>
      <div><dt>谜题制作</dt><dd>proton, CALS, Winfrid</dd></div>
      <div><dt>网站</dt><dd>浅眠</dd></div>
      <div><dt>技术支持</dt><dd>JCarlson</dd></div>
    </dl>
  </div>
</section>
<section className="section example" aria-labelledby="example-title">
  <p className="rules"><strong>规则：每道题的问句都将各字符的 Unicode 码位加一。还原问句，输入它所问的答案。</strong></p>
  <h2 className="example-title" id="example-title">例题</h2>
  <dl className="example-lines">
    <dt>题面</dt>
    <dd className="example-question"><span className="question-text"><span>丁</span><span>务</span><span>丁</span><span>筊</span><span>亏</span><span>凡</span><span>＠</span></span></dd>
    <dt>原问句</dt>
    <dd className="example-question question-original"><span className="question-text"><span>一</span><span>加</span><span>一</span><span>等</span><span>于</span><span>几</span><span>？</span></span></dd>
    <dt>答案</dt>
    <dd className="example-answer">2</dd>
  </dl>
</section>
  </>;
}
