let shuffle = true;
let dataArray = [];
let question = [];
let problem = [];
let answer = false;
let finish = false;
let id = 0;
let len = 0;


// 現在のURLのクエリパラメータを取得する場合
const params = (new URLSearchParams(window.location.search)).get("f");

const fileContent = localStorage.getItem('fileContent');
const fileName = localStorage.getItem('fileName');
document.getElementById('fileName').textContent = fileName;
try {
    setArray();
    question = [...dataArray];
    shuffleArray(question);
    init();
} catch (error) {
    console.error('ファイルの内容がJSONとしてパースできません:', error);
}

function setArray() {
    switch (params) {
        case 'pp':
            dataArray = [["～である be","be - was - been"],["～させる let","let - let - let"],["支える bear","bear - bore - borne"],["横たわる lie","lie - lay - lain"],["打つ、負かす beat","beat - beat - beaten"],["なくす lose","lose - lost - lost"],["～になる become","become - became - become"],["作る make","make - made - made"],["始める begin","begin - began - begun"],["意味する mean","mean - meant - meant"],["噛む bite","bite - bit - bitten"],["会う meet","meet - met - met"],["吹く blow","blow - blew - blown"],["追い越す overtake","overtake - overtook - overtaken"],["壊す break","break - broke - broken"],["支払う pay","pay - paid - paid"],["持ってくる bring","bring - brought - brought"],["置く put","put - put - put"],["建てる build","build - built - built"],["読む read","read - read - read"],["燃やす burn","burn - burnt - burnt"],["乗る ride","ride - rode - ridden"],["買う buy","buy - bought - bought"],["ベルが鳴る ring","ring - rang - rung"],["つかむ catch","catch - caught - caught"],["上がる rise","rise - rose - risen"],["選ぶ choose","choose - chose - chosen"],["走る run","run - ran - run"],["来る come","come - came - come"],["言う　 say","say - said - said"],["費用がかかる cost","cost - cost - cost"],["見る see","see - saw - seen"],["切る cut","cut - cut - cut"],["売る sell","sell - sold - sold"],["掘る dig","dig - dug - dug"],["送る send","send - sent - sent"],["する do","do - did - done"],["置く set","set - set - set"],["描く draw","draw - drew - drawn"],["振る shake","shake - shook - shaken"],["飲む drink","drink - drank - drunk"],["発射する shoot","shoot - shot - shot"],["運転する drive","drive - drove - driven"],["見せる show","show - showed - shown"],["食べる eat","eat - ate - eaten"],["閉じる shut","shut - shut - shut"],["落ちる fall","fall - fell - fallen"],["歌う sing","sing - sang - sung"],["食べ物を与える feed","feed - fed - fed"],["沈む sink","sink - sank - sunk"],["感じる feel","feel - felt - felt"],["座る sit","sit - sat - sat"],["戦う fight","fight - fought - fought"],["眠っている sleep","sleep - slept - slept"],["捜して見つける find","find - found - found"],["話す speak","speak - spoke - spoken"],["忘れる forget","forget - forgot - forgotten, forgot"],["金を使う spend","spend - spent - spent"],["手に入れる get","get - got - gotten"],["広げる spread","spread - spread - spread"],["与える give","give - gave - given"],["立つ stand","stand - stood - stood"],["行く go","go - went - gone"],["盗む steal","steal - stole - stolen"],["育つ grow","grow - grew - grown"],["掃く sweep","sweep - swept - swept"],["掛ける hang","hang - hung - hung"],["泳ぐ swim","swim - swam - swum"],["持つ have","have - had - had"],["持って行く take","take - took - taken"],["聞える hear","hear - heard - heard"],["教える teach","teach - taught - taught"],["打つ hit","hit - hit - hit"],["言う、知らせる tell","tell - told - told"],["手でつかむ hold","hold - held - held"],["思う、考える think","think - thought - thought"],["傷つける hurt","hurt - hurt - hurt"],["投げる throw","throw - threw - thrown"],["保つ keep","keep - kept - kept"],["理解する understand","understand - understood - understood"],["知っている know","know - knew - known"],["目が覚める wake","wake - woke - woken"],["横たえる lay","lay - laid - laid"],["身につける wear","wear - wore - worn"],["導く lead","lead - led - led"],["勝つ win","win - won - won"],["去る leave","leave - left - left"],["書く write","write - wrote - written"],["貸す lend","lend - lent - lent"]];
            document.getElementById('fileName').textContent = '過去分詞';
            break;
    
        default:
            dataArray = JSON.parse(fileContent);
            break;
    }
}

function init() {
    id = 0;
    updateProgressBar(0);
    const table = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
    document.getElementById('question').innerHTML = '&#x00A0;';
    document.getElementById('answer').innerHTML = '&#x00A0;';
    table.innerHTML = '';
    document.getElementById('progressLabel').innerText = '進捗状況';
    document.getElementById('button').textContent = 'スタート';
    document.querySelector('#myImage').src = "";
    answer = false;
    finish = false;
    if (question.contents != undefined) {
        problem = question.contents.slice(0);
        len = question.contents.length;
    } else {
        problem = question.slice(0);
        len = question.length;
    }
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    var fileName = this.files.length > 0 ? this.files[0].name : '';
    document.getElementById('fileName').textContent = fileName;
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // ファイルの内容を取得
            const fileContent = e.target.result;
            try {
                // JSONとしてパースして配列に変換
                dataArray = JSON.parse(fileContent);
                question = JSON.parse(fileContent);
                shuffleArray(question);
                console.log(dataArray);
                init();
            } catch (error) {
                console.error('ファイルの内容がJSONとしてパースできません:', error);
            }
        };
        reader.readAsText(file);
    }
});

document.onkeydown = hoge;

function hoge() {
    next(false);
}

document.getElementById('button').addEventListener('click', function() {
    next(true);
});

function next(a) {
    if (!finish) {
        if (!answer) {
            id++;
            document.querySelector('#myImage').src = "";
            document.getElementById('progressLabel').innerText = '進捗: ' + String(id) + ' / ' + String(len);
            document.getElementById('answer').innerHTML = '&#x00A0;';
            document.getElementById('question').innerHTML = problem[0][0];
            document.getElementById('button').textContent = '答えを見る';
            try {
                if (problem[0][2] != undefined) {
                    document.querySelector('#myImage').src = "images/" + problem[0][2] + ".png";
                }
            } catch (error) {
                console.error("A");
            }
        } else {
            document.getElementById('answer').innerHTML = problem[0][1];
            document.getElementById('button').textContent = '次の問題へ';
            const table = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
            const newRow = table.insertRow(); // 新しい行を追加
            newRow.insertCell(0).textContent = id;
            newRow.insertCell(1).innerHTML = problem[0][0];
            newRow.insertCell(2).innerHTML = problem[0][1];
            problem.shift();
            updateProgressBar(Math.floor(id / len * 100));
            if (problem.length == 0) {
                finish = true;
                document.getElementById('button').textContent = '終わる';
            }
        }
        answer = !answer;
    } else {
        if (a) {
            shuffleArray(question);
            init();
        }
    }
}

function shuffleArray(array) {
    if (array.shuffle != undefined && array.shuffle) {
        // 配列の長さを取得
        for (let i = array.contents.length - 1; i > 0; i--) {
            // 0からiまでのランダムなインデックスを生成
            const j = Math.floor(Math.random() * (i + 1));
            
            // array[i] と array[j] を交換
            [array.contents[i], array.contents[j]] = [array.contents[j], array.contents[i]];
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
    document.getElementById('progressBar').style.width = progress + '%';
}

