import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    doc,
    getDoc
  } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCC4HW_rNFZHhhH1OzovE9coc_TRlKYJ4I",
  authDomain: "study-1105a.firebaseapp.com",
  projectId: "study-1105a",
  storageBucket: "study-1105a.firebasestorage.app",
  messagingSenderId: "356676590589",
  appId: "1:356676590589:web:cd449cd5ac74e6db449794",
  measurementId: "G-P84CG30Z7N"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const imageCache = {}; 

let shuffle = true;
let dataArray = [];
let question = [];
let problem = [];
let answer = false;
let finish = false;
let id = 0;
let uuid = "";
let len = 0;
let old = false;
let checks = [];
// 現在のURLのクエリパラメータを取得する場合
const params = new URLSearchParams(window.location.search);

let problemID = "default";

const fileContent = localStorage.getItem("fileContent");
const fileName = localStorage.getItem("fileName");
let originalData = JSON.parse(localStorage.getItem('checked')) ?? [{id: null, contents: []}];
let urls = [];
try {
  await setArray();
  if (params.get('f') === null) {
    if (dataArray.shuffle === undefined) {
      dataArray.contents = dataArray.map(item => ([{ text: item[0], images: [] }, { text: item[1], images: []}]));
      dataArray.shuffle = true;
    } else {
      dataArray.contents = dataArray.contents.map(item => ([{ text: item[0], images: [] }, { text: item[1], images: []}]));
    }
  dataArray.length = 0;
}
  if (dataArray.shuffle != undefined) {
    for (let i = 0; i < dataArray.length; i++) {
      dataArray.contents[i].id = i;
      urls = urls.concat(dataArray.contents[i][0].images);
      urls = urls.concat(dataArray.contents[i][1].images);
    }
    await preloadImages(urls);
    question = {
      contents: [...dataArray.contents],
      shuffle: dataArray.shuffle,
    };
  } else {
    for (let i = 0; i < dataArray.length; i++) {
      dataArray[i].id = i;
      urls = urls.concat(dataArray[i][0].images);
      urls = urls.concat(dataArray[i][1].images);
    }
    await preloadImages(urls);
    question = [...dataArray];
  }
  shuffleArray(question);
  init();
} catch (error) {
  console.error("ファイルの内容がJSONとしてパースできません:", error);
}
function preloadImages(urls) {
  const promises = urls.map(url => {;

    // すでにキャッシュ済みならスキップ
    if (imageCache[url]) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        imageCache[url] = img;
        resolve();
      };
      img.onerror = reject;
    });
  });

  return Promise.all(promises); // すべての画像の読み込み完了を待つ
}
async function setArray() {
  switch (params.get("f")) {
    case "pp":
      problemID = "pp";
      dataArray = [
  ["～である be", "be - was - been"],
  ["～になる become", "become - became - become"],
  ["打つ、負かす beat", "beat - beat - beaten"],
  ["支える bear", "bear - bore - borne"],
  ["始める begin", "begin - began - begun"],
  ["噛む bite", "bite - bit - bitten"],
  ["吹く blow", "blow - blew - blown"],
  ["壊す break", "break - broke - broken"],
  ["持ってくる bring", "bring - brought - brought"],
  ["建てる build", "build - built - built"],
  ["燃やす burn", "burn - burnt - burnt"],
  ["買う buy", "buy - bought - bought"],
  ["つかむ catch", "catch - caught - caught"],
  ["選ぶ choose", "choose - chose - chosen"],
  ["来る come", "come - came - come"],
  ["費用がかかる cost", "cost - cost - cost"],
  ["切る cut", "cut - cut - cut"],
  ["掘る dig", "dig - dug - dug"],
  ["する do", "do - did - done"],
  ["描く draw", "draw - drew - drawn"],
  ["飲む drink", "drink - drank - drunk"],
  ["運転する drive", "drive - drove - driven"],
  ["食べる eat", "eat - ate - eaten"],
  ["感じる feel", "feel - felt - felt"],
  ["食べ物を与える feed", "feed - fed - fed"],
  ["捜して見つける find", "find - found - found"],
  ["戦う fight", "fight - fought - fought"],
  ["落ちる fall", "fall - fell - fallen"],
  ["忘れる forget", "forget - forgot - forgotten, forgot"],
  ["手に入れる get", "get - got - gotten"],
  ["与える give", "give - gave - given"],
  ["行く go", "go - went - gone"],
  ["育つ grow", "grow - grew - grown"],
  ["掛ける hang", "hang - hung - hung"],
  ["持つ have", "have - had - had"],
  ["聞える hear", "hear - heard - heard"],
  ["打つ hit", "hit - hit - hit"],
  ["手でつかむ hold", "hold - held - held"],
  ["傷つける hurt", "hurt - hurt - hurt"],
  ["保つ keep", "keep - kept - kept"],
  ["知っている know", "know - knew - known"],
  ["横たえる lay", "lay - laid - laid"],
  ["導く lead", "lead - led - led"],
  ["去る leave", "leave - left - left"],
  ["貸す lend", "lend - lent - lent"],
  ["～させる let", "let - let - let"],
  ["横たわる lie", "lie - lay - lain"],
  ["なくす lose", "lose - lost - lost"],
  ["作る make", "make - made - made"],
  ["意味する mean", "mean - meant - meant"],
  ["会う meet", "meet - met - met"],
  ["追い越す overtake", "overtake - overtook - overtaken"],
  ["支払う pay", "pay - paid - paid"],
  ["置く put", "put - put - put"],
  ["読む read", "read - read - read"],
  ["乗る ride", "ride - rode - ridden"],
  ["ベルが鳴る ring", "ring - rang - rung"],
  ["上がる rise", "rise - rose - risen"],
  ["走る run", "run - ran - run"],
  ["言う say", "say - said - said"],
  ["見る see", "see - saw - seen"],
  ["売る sell", "sell - sold - sold"],
  ["送る send", "send - sent - sent"],
  ["置く set", "set - set - set"],
  ["振る shake", "shake - shook - shaken"],
  ["発射する shoot", "shoot - shot - shot"],
  ["見せる show", "show - showed - shown"],
  ["閉じる shut", "shut - shut - shut"],
  ["歌う sing", "sing - sang - sung"],
  ["沈む sink", "sink - sank - sunk"],
  ["座る sit", "sit - sat - sat"],
  ["眠っている sleep", "sleep - slept - slept"],
  ["話す speak", "speak - spoke - spoken"],
  ["費やす spend", "spend - spent - spent"],
  ["広げる spread", "spread - spread - spread"],
  ["立つ stand", "stand - stood - stood"],
  ["盗む steal", "steal - stole - stolen"],
  ["掃く sweep", "sweep - swept - swept"],
  ["泳ぐ swim", "swim - swam - swum"],
  ["持って行く take", "take - took - taken"],
  ["教える teach", "teach - taught - taught"],
  ["言う、知らせる tell", "tell - told - told"],
  ["思う、考える think", "think - thought - thought"],
  ["投げる throw", "throw - threw - thrown"],
  ["理解する understand", "understand - understood - understood"],
  ["目が覚める wake", "wake - woke - woken"],
  ["身につける wear", "wear - wore - worn"],
  ["勝つ win", "win - won - won"],
  ["書く write", "write - wrote - written"]
];
      document.getElementById("fileName").textContent = "過去分詞";
      break;
    case "morse":
      problemID = "morse";
      dataArray = {
        contents: [
          ["A", "・ー"],
          ["B", "ー・・・"],
          ["C", "ー・－・"],
          ["D", "ー・・"],
          ["E", "・"],
          ["F", "・・ー・"],
          ["G", "ーー・"],
          ["H", "・・・・"],
          ["I", "・・"],
          ["J", "・ーーー"],
          ["K", "ー・ー"],
          ["L", "・ー・・"],
          ["M", "ーー"],
          ["N", "ー・"],
          ["O", "ーーー"],
          ["P", "・ーー・"],
          ["Q", "ーー・ー"],
          ["R", "・ー・"],
          ["S", "・・・"],
          ["T", "ー"],
          ["U", "・・ー"],
          ["V", "・・・ー"],
          ["W", "・ーー"],
          ["X", "ー・・ー"],
          ["Y", "ー・ーー"],
          ["Z", "ーー・・"],
        ],
        shuffle: false,
        extra: [
          ["0", "ーーーーー"],
          ["1", "・ーーーー"],
          ["2", "・・ーーー"],
          ["3", "・・・ーー"],
          ["4", "・・・・ー"],
          ["5", "・・・・・"],
          ["6", "ー・・・・"],
          ["7", "ーー・・・"],
          ["8", "ーーー・・"],
          ["9", "ーーーー・"],
        ],
      };
      document.getElementById("fileName").textContent = "モールス信号";
      break;
    case "goro":
      problemID = "goro";
      dataArray = {
        contents: [
          ["倭の奴国王が後漢から金印をもらう", "57年　　こんな金印欲しかった"],
          [
            "邪馬台国の卑弥呼が、魏に使いを送る",
            "239年　　文ください、卑弥呼より",
          ],
          ["百済から日本に仏教が伝わる", "538年　　ご参拝しなさい"],
          [
            "聖徳太子が推古天皇の摂政になる",
            "593年　　推古専属のコックさんは聖徳太子",
          ],
          ["冠位十二階が成立する", "603年　　十二階は老齢さんには登れない"],
          ["十七条の憲法が成立する", "604年　　群れよ、役人よ！憲法発布じゃ！"],
          [
            "小野妹子が遣隋使として派遣される",
            "607年　　妹が群れながら遣隋使派遣",
          ],
          ["大化の改新", "645年　　無事故を目指す大化の改新"],
          ["白村江の戦い", "663年　　唐と新羅にろくろく惨敗"],
          ["壬申の乱", "672年　　ろくでなしの2人兄弟"],
          ["大宝律令", "701年　　なれ1番の律令国家に"],
          ["平城京に遷都する", "710年　　なんと見事な平城京"],
          ["「古事記」編さん", "712年　　ナイフで古事記編さん"],
          [
            "墾田永年私財法の制定",
            "743年　　開墾の制限はなしさ、墾田永年私財法",
          ],
          ["鑑真来日", "753年　　和み輝く鑑真"],
          ["平安京の遷都", "794年　　鳴くよウグイス平安"],
          ["遣唐使の廃止", "894年　　白紙に戻そう遣唐使"],
          ["平将門の乱", "935年　　組みでご苦労平将門"],
          ["白河上皇の院政開始", "1086年　　一応やろう、院政を"],
          ["保元の乱", "1156年　　いいころだ保元の乱"],
          ["平治の乱", "1159年　　人々ご苦労な平治の乱"],
          ["平清盛が太政大臣になる", "1167年　　平清盛はいい胸毛"],
          ["壇ノ浦の戦いで平家が滅亡", "1185年　　平家はいいや困った壇ノ浦"],
          ["守護・地頭の設置", "1185年　　守護と地頭はいい番号"],
          ["鎌倉幕府の成立", "1192年　　いい国作ろう鎌倉幕府"],
          [
            "チンギス・ハンがモンゴル帝国を作る",
            "1206年　　モンゴル帝国でひとにお迎えチンギス・ハン",
          ],
          ["承久の乱", "1221年　　人に不意打ち、承久の乱"],
          ["御成敗式目の制定", "1232年　　いつ身に着くの？御成敗式目"],
          ["文永の役（元寇）", "1274年　　悲痛な呼びかけ文永の役"],
          ["弘安の役（元寇）", "1281年　　人に矢を射る弘安の役"],
          ["永仁の徳政令", "1297年　　なんと皮肉な徳政令"],
          ["鎌倉幕府滅亡", "1333年　　一味さんざん鎌倉滅亡"],
          ["建武の新政", "1334年　　ひと味斬新な建武の新政"],
          ["室町幕府成立", "1338年　　いざ都で開こう室町幕府"],
          ["南北朝統一", "1392年　　いざ国まとめよう"],
          ["朝鮮国の建国", "1392年　　秘策に富んだ朝鮮国建国"],
          ["勘合貿易の開始", "1404年　　義満が必死に押した勘合貿易"],
          ["正長の土一揆", "1428年　　土民の意志には勝てない正長の土一揆"],
          ["応仁の乱", "1467年　　人世むなしい応仁の乱"],
          ["山城の国一揆", "1485年　　山城の石はゴロゴロ国一揆"],
          ["加賀の一向一揆", "1488年　　浄土の意思羽ばたく一向一揆"],
          [
            "コロンブスが西インド諸島に到達",
            "1492年　　意欲に燃えるコロンブス",
          ],
          [
            "バスコ・ダ・ガマがインド航路を開拓",
            "1498年　　意欲は負けぬガマはインドまで",
          ],
          ["ルターの宗教改革", "1517年　　以後非難の嵐、ルターの宗教改革"],
          [
            "マゼランが世界一周の航路にでる",
            "1519年　　マゼラン一行が行く世界一周旅行",
          ],
          ["種子島に鉄砲が伝来", "1543年　　銃、ご予算で作ります"],
          [
            "キリスト教の伝来",
            "1549年　　ザビエルがイエズス会の意向をよく伝える",
          ],
          ["桶狭間の戦い", "1560年　　今川いちころ桶狭間"],
          ["室町幕府滅亡", "1573年　　以後涙の室町幕府"],
          ["長篠の戦い", "1575年　　一発で粉々の鉄砲隊"],
          ["本能寺の変", "1582年　　本能寺でいちごパンツの明智光秀"],
          ["刀狩令", "1588年　　以後刃はない刀狩令"],
          ["豊臣秀吉の天下統一", "1590年　　秀吉が戦国丸めて天下統一"],
          ["文禄の役（朝鮮出兵）", "1592年　　異国に攻める文禄の役"],
          ["慶長の役（朝鮮出兵）", "1597年　　以後苦難、朝鮮出"],
          ["関ヶ原の戦い", "1600年　　ヒーローわーわー関ヶ原"],
          ["江戸幕府成立", "1603年　　ヒーローのおっさん江戸幕府を開く"],
          ["武家諸法度の制定", "1615年　　いろいろ以後禁止になる"],
          ["参勤交代", "1635年　　ヒーロー見事な参勤交代"],
          ["島原・天草一揆", "1637年　　キリシタンの疲労がみなぎる天草一揆"],
          ["鎖国の完成", "1639年　　広い柵して鎖国の完成"],
          ["清教徒革命", "1642年　　クロムウェルをヒーローと信じ革命だ"],
          ["慶安の御触書", "1649年　　広くよく読め、慶安の御触書"],
          ["生類憐みの令", "1685年　　綱吉が動物のためいろんな発行憐み令"],
          ["名誉革命", "1688年　　君主制のイロハを名誉革命から学ぶ"],
          ["享保の改革", "1716年　　吉宗はいいな、いろんな意見を拾って"],
          ["田沼の政治開始", "1772年　　いいな何より田沼の政治"],
          ["アメリカ独立宣言", "1776年　　いいな、なろうよ独立国"],
          ["寛政の改革", "1787年　　松平の粋な花咲く寛政の改革"],
          ["フランス革命", "1789年　　ルイ国王に非難爆発フランス革命"],
          ["ラクスマンが根室に来航", "1792年　　いきなり急にラクスマン来航"],
          ["伊能忠敬の日本地図が完成", "1821年　　いやにいい地図できました"],
          ["外国船打払令", "1825年　　いやに強引、打ち払え"],
          ["大塩平八郎の乱", "1837年　　人はみな助ける大塩平八郎"],
          ["アヘン戦争", "1840年　　アヘンはだめだと人は知れ"],
          ["天保の改革", "1841年　　いやーよい天保の改革"],
          ["ペリーが浦賀に来航", "1853年　　いやでござんすペリーの来航"],
          ["日米和親条約の締結", "1854年　　一夜越しの条約締結"],
          ["インドの大反乱", "1857年　　大反乱で人は粉々インド兵"],
          ["日米修好通商条約の締結", "1858年　　直弼も1番怖い修好通商条約"],
          ["安政の大獄の激化", "1859年　　反対一派が地獄へ行く安政の大獄"],
          ["桜田門外の変", "1860年　　人は群れ、事件を見る"],
          ["薩長同盟の締結", "1866年　　一藩じゃムリムリ薩長同盟"],
          ["大政奉還", "1867年　　慶喜の一夜のむなしく大政奉還"],
          ["ええじゃないか", "1867年　　人はむなしく乱舞する、ええじゃないか"],
          ["戊辰戦争", "1868年　　銃は6発、戊辰戦争"],
          ["五箇条の御誓文発布", "1868年　　ひとつやろうや、御誓文"],
          ["版籍奉還", "1869年　　一派も無口になる版籍奉還"],
          ["廃藩置県", "1871年　　藩とは言わない、県という"],
          [
            "日清修好条規の締結",
            "1871年　　言わないでほしかった、日清修好条規",
          ],
          ["岩倉使節団の派遣", "1871年　　いやな一団欧米へ"],
          ["学制の公布", "1872年　　学制でヒットを放つ学問開花"],
          ["富岡製糸場操業", "1872年　　いやな臭いだ製糸場"],
          ["徴兵令を出す", "1873年　　人は涙の徴兵令"],
          ["地租改正", "1873年　　現金でいやな3%地租改正"],
          ["民撰議院設立建白書", "1874年　　板垣のいい話だ建白書"],
          ["自由民権運動", "1874年　　いやな世を直せと運動開始"],
          ["樺太・千島交換条約の締結", "1875年　　いやなこった交換条約"],
          ["江華島事件", "1875年　　いやな効果の江華島事件"],
          ["日朝修好条規", "1876年　　朝鮮にいやな論を押しつける"],
          ["西南戦争", "1877年　　西郷のいやな内乱西南戦争"],
          ["自由党の結成", "1881年　　板垣が1番早い自由党の結成"],
          ["立憲改進党の結成", "1882年　　重信が一派閥を作って改進党"],
          ["秩父事件", "1884年　　秩父で人はやしたて蜂起事件"],
          [
            "伊藤博文が初代総理大臣就任",
            "1885年　　いっぱいの箱でお祝い内閣開始",
          ],
          ["大日本帝国憲法制定", "1889年　　いち早く作った帝国憲法"],
          ["第一回帝国議会", "1890年　　飛躍を誓う帝国議会"],
          ["甲午農民戦争", "1894年　　東学党一派苦心した甲午戦争"],
          ["領事裁判権の廃止", "1894年　　宗光がひとつ白紙に戻した領事裁判権"],
          ["日清戦争", "1894年　　一発急所で勝つ戦争"],
          ["下関条約の締結", "1895年　　下関に1泊のご予約承りました"],
          ["遼東半島の返還", "1895年　　三国干渉で一発急行、遼東半島へ"],
          ["義和団事件", "1900年　　行くぞ、おー！義和団事件"],
          ["八幡製鉄所操業", "1901年　　賠償金で製鉄所に、引く老いた人"],
          ["日英同盟", "1902年　　遠くをにらんで結ぶ日英同盟"],
          ["日露戦争", "1904年　　満州をひとつくれよ日露戦争"],
          ["ポーツマス条約", "1905年　　賠償なしでひどく怒られ和解する"],
          ["韓国併合", "1910年　　韓国で一句言おう併合だ"],
          ["関税自主権の回復", "1911年　　低い位置から同じ位置へ"],
          ["辛亥革命", "1911年　　行くぜワンワン辛亥革命"],
          ["第一次護憲運動", "1912年　　行く？いつ？第一次護憲運動"],
          ["第一次世界大戦", "1914年　　日本も行く意思あるよ第一次世界大戦"],
          ["中国に二十一ヵ条の要求", "1915年　　要求で中国の一区以後反日に"],
          ["ロシア革命", "1917年　　レーニンが得意な顔で革命を起こす"],
          ["シベリア出兵", "1918年　　シベリアに米と一緒に行くのいや"],
          ["米騒動", "1918年　　人、食いはぐれ米騒動"],
          ["三・一独立運動", "1919年　　朝鮮へ行く行く独立運動"],
          ["五・四運動", "1919年　　中国に行く行く逃げ腰で"],
          ["ベルサイユ条約の締結", "1919年　　パリへ行く行くベルサイユ"],
          ["ワイマール憲法の発布", "1919年　　ドイツへ行く行くワイマール"],
          ["国際連盟の発足", "1920年　　平和にはとくに大きな国際連盟"],
          ["ワシントン会議", "1921年　　行くに行かれぬ軍縮ワシントン会議"],
          [
            "ソビエト社会主義共和国連邦の建国",
            "1922年　　胃の苦痛に耐えたソビエト連邦",
          ],
          ["全国水平社の誕生", "1922年　　差別なくしていい国に"],
          ["関東大震災", "1923年　　東京はとくに災難大震災"],
          ["治安維持法の制定", "1925年　　選挙のついでにとくに不幸な治安維持"],
          [
            "普通選挙法の制定（男子のみ）",
            "1925年　　選挙に行くぞ、25歳の男たち",
          ],


          ["ポツダム宣言の受諾", "1945年　　引くよごめんとポツダム宣言"],
          ["国際連合の発足", "1945年　　行くよ親交深めに連合発足"],
          ["日本国憲法の交付", "1946年　　人々もひどく喜ぶ日本国憲法"],
          ["中華人民共和国の建国", "1949年　　行くよ至急中国の建国へ"],
          ["朝鮮戦争の開始", "1950年　　朝鮮へ行くよ号令戦争だ"],
          [
            "サンフランシスコ平和条約で日本の独立",
            "1951年　　アメリカでひどく強引な独立回復",
          ],
          ["日米安全保障条約の締結", "1951年　　調印でインク濃い安全条約締結"],
          ["アジア・アフリカ会議", "1955年　　バンドンへ行くぜゴーゴー！"],
          ["日本の国際連盟復活", "1956年　　日本も行くころだ国連復活へ"],
          ["東海道新幹線の開通", "1964年　　一急無視して東海道開通"],
          ["東京オリンピック", "1964年　　一苦労して金メダル"],
          [
            "ベトナム戦争でアメリカが北ベトナムを爆撃開始",
            "1965年　　行くなむこうへベトナム戦争",
          ],
          ["日韓基本条約の締結", "1965年　　行くよむこうへ日韓条約"],
          ["公害対策基本法の制定", "1967年　　公害のひどくむなしい対策法"],
          ["沖縄返還", "1972年　　ついに行くぞ夏に沖縄へ"],
          ["日中共同声明", "1972年　　中国に行く何しに？共同声明"],
          [
            "第四次中東戦争による石油危機",
            "1973年　　行く波高くなるオイルショック",
          ],
          ["日中平和友好条約", "1978年　　行くよナンパ！日中友好へ！"],
        ],
        shuffle: true,
      };
      document.getElementById("fileName").textContent = "語呂合わせ";
      break;

    case "user":
      problemID = params.get('id');
      checks = (originalData.find(e => e.id === problemID) ?? {contents: []}).contents;
      await getDoc(doc(db, "posts", problemID)).then(doc => {
        if (doc.exists()) {
          for (let i = 0; i < doc.data().contents.question.length; i++) {
            dataArray.push([doc.data().contents.question[i], doc.data().contents.answer[i]]);
          }
          document.getElementById("fileName").textContent = doc.data().title;
        } else {
          console.log("そのようなIDのドキュメントは存在しません。");
          dataArray = JSON.parse(fileContent);
        }
      });

    break;
    default:
      problemID = fileName;
      dataArray = JSON.parse(fileContent);
      document.getElementById("fileName").textContent = fileName;
      break;
  }
}

function init() {
  id = 0;
  updateProgressBar(0);
  const table = document
    .getElementById("resultTable")
    .getElementsByTagName("tbody")[0];
  document.getElementById("question").innerHTML = "&#x00A0;";
  document.getElementById("answer").innerHTML = "&#x00A0;";
  table.innerHTML = "";
  document.getElementById("progressLabel").innerText = "進捗状況";
  document.getElementById("button").textContent = "スタート";
  document.getElementById("queImages").innerHTML = "";
  document.getElementById("ansImages").innerHTML = "";
  answer = false;
  finish = false;
  if (question.contents != undefined) {
    problem = question.contents.filter(e => !checks.includes(e.id));
    old = question.contents[0][0].images == undefined

    len = problem.length;
  } else {
    problem = question.filter(e => !checks.includes(e.id));
    old = question[0][0].images == undefined
    len = problem.length;
  }
  const checked = dataArray.filter(e => checks.includes(e.id));
  for (let i = 0; i < checked.length; i++) {
    const e = checked[i];
    const newRow = table.insertRow(0); // 新しい行を追加
    newRow.insertCell(0).textContent = "覚えた";
    newRow.insertCell(1).innerHTML = e[0];
    newRow.insertCell(2).innerHTML = e[1];
    const check = newRow.insertCell(3);
    check.className = 'check-td';
    // ラベルを作ってinputとカスタム見た目spanを入れる
    const label = document.createElement('label');
    label.className = 'custom-checkbox-label';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'custom-checkbox-input';
    box.name = 'checkbox';
    box.checked = true;
    box.dataset.id = String(uuid);

    // カスタム見た目用のspan
    const customSpan = document.createElement('span');
    customSpan.className = 'custom-checkbox-span';

    // ラベルにinputとspanを追加
    label.appendChild(box);
    label.appendChild(customSpan);

    // セルにラベルを追加
    check.appendChild(label);
    // イベントリスナーはinputに付ける（変わらず）
    box.addEventListener('change', () => {
      const uid = Number(box.dataset.id);
      if (box.checked) {
        checks.push(uid);
      } else {
        checks = checks.filter(e => e != uid);
      }
      const index = originalData.findIndex(e => e.id === problemID);
      if (problemID == "default") return;
      if (index == -1) {
        originalData.push({id: problemID, contents: [...checks]});
      } else {
        originalData[index].contents = [...checks];
      }
      localStorage.setItem('checked', JSON.stringify(originalData));
    });
  }
  MathJax.typeset();
  
  
  if (len == 0) {
    finish = true;
    return;
  }
}

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    var fileName = this.files.length > 0 ? this.files[0].name : "";
    document.getElementById("fileName").textContent = fileName;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // ファイルの内容を取得
        const fileContent = e.target.result;
        try {
          // JSONとしてパースして配列に変換
          dataArray = JSON.parse(fileContent);
          question = JSON.parse(fileContent);
          shuffleArray(question);
          init();
        } catch (error) {
          console.error("ファイルの内容がJSONとしてパースできません:", error);
        }
      };
      reader.readAsText(file);
    }
  });

document.onkeydown = hoge;

function hoge() {
  next(false);
}

document.getElementById("button").addEventListener("click", function () {
  next(true);
});

function next(a) {
  if (!finish) {
    if (!answer) {
      id++;
      uuid = problem[0].id;
      document.getElementById("queImages").innerHTML = "";
      document.getElementById("ansImages").innerHTML = "";
      document.getElementById("progressLabel").innerText =
        "進捗: " + String(id) + " / " + String(len);
      document.getElementById("answer").innerHTML = "&#x00A0;";
      document.getElementById("question").innerHTML = old ? problem[0][0] : problem[0][0].text;
      document.getElementById("button").textContent = "答えを見る";
      loadAndCacheImages(problem[0][0].images, "queImages");
      MathJax.typeset();
    } else {
      document.getElementById("answer").innerHTML = problem[0][1].text;
      document.getElementById("button").textContent = "次の問題へ";
      loadAndCacheImages(problem[0][1].images, "ansImages");
      const table = document
        .getElementById("resultTable")
        .getElementsByTagName("tbody")[0];
      const newRow = table.insertRow(0); // 新しい行を追加
      newRow.insertCell(0).textContent = id;
      newRow.insertCell(1).innerHTML = problem[0][0].text;
      newRow.insertCell(2).innerHTML = problem[0][1].text;
      const check = newRow.insertCell(3);
      check.className = 'check-td';
      // ラベルを作ってinputとカスタム見た目spanを入れる
      const label = document.createElement('label');
      label.className = 'custom-checkbox-label';

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'custom-checkbox-input';
      box.checked = checks.includes(uuid);
      box.dataset.id = String(uuid);
      box.name = 'checkbox';

      // カスタム見た目用のspan
      const customSpan = document.createElement('span');
      customSpan.className = 'custom-checkbox-span';

      // ラベルにinputとspanを追加
      label.appendChild(box);
      label.appendChild(customSpan);

      // セルにラベルを追加
      check.appendChild(label);

      // イベントリスナーはinputに付ける（変わらず）
      box.addEventListener('change', () => {
        const uid = Number(box.dataset.id);
        if (box.checked) {
          checks.push(uid);
        } else {
          checks = checks.filter(e => e != uid);
        }
        if (problemID == "default") return;
        const index = originalData.findIndex(e => e.id === problemID);
        if (index == -1) {
          originalData.push({id: problemID, contents: [...checks]});
        } else {
          originalData[index].contents = [...checks];
        }
        localStorage.setItem('checked', JSON.stringify(originalData));
      });
      problem.shift();
      updateProgressBar(Math.floor((id / len) * 100));
      if (problem.length == 0) {
        finish = true;
        document.getElementById("button").textContent = "終わる";
      }
    }
    answer = !answer;
    MathJax.typeset();
  } else {
    if (a) {
      shuffleArray(question);
      init();
    }
  }
}

function shuffleArray(array) {
  if (!shuffle) { return; }
  if (array.shuffle != undefined && array.shuffle) {
    // 配列の長さを取得
    for (let i = array.contents.length - 1; i > 0; i--) {
      // 0からiまでのランダムなインデックスを生成
      const j = Math.floor(Math.random() * (i + 1));

      // array[i] と array[j] を交換
      [array.contents[i], array.contents[j]] = [
        array.contents[j],
        array.contents[i],
      ];
    }
  } else {
    // 配列の長さを取得
    for (let i = array.length - 1; i > 0; i--) {
      // 0からiまでのランダムなインデックスを生成
      const j = Math.floor(Math.random() * (i + 1));

      // array[i] と array[j] を交換
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
function updateProgressBar(progress) {
  document.getElementById("progressBar").style.width = progress + "%";
}

document.getElementById('checkbox').addEventListener('change', () => {
  const flag = document.getElementById('checkbox').checked;
  if (question.contents === undefined) {
    shuffle = !flag;
    question = [...dataArray];
  } else {
    if (flag) {
      question.shuffle = false;
      question.contents = [...dataArray.contents];
    } else {
      question.shuffle = true;
    }
  }
  shuffleArray(question);
  init();
});

function loadAndCacheImages(urls, containerId) {
  const container = document.getElementById(containerId);

  for (const url of urls) {

    // すでにキャッシュされていればそれを使う
    if (imageCache[url]) {
      const cachedImg = imageCache[url].cloneNode(); // cloneして使う
      cachedImg.className = "images";
      container.appendChild(cachedImg);
    } else {
      const img = new Image();
      img.className = "images";
      img.src = url;

      // 読み込みが終わったらキャッシュに保存
      img.onload = () => {
        imageCache[url] = img;
      };

      container.appendChild(img);
    }
  }
}