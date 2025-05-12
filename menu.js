document.getElementById('folderInput').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files.length > 0) {
        // フォルダ構造をリセット
        document.getElementById('folderStructure').innerHTML = '';
        logFileTree(files);
    }
});
async function buildFileTree(files) {
    const fileTree = { files: [] };
    for (const file of files) {
        const pathParts = file.webkitRelativePath.split('/');
        const fileName = pathParts.pop();  // ファイル名を取得
        let currentNode = fileTree;

        // フォルダの作成・更新
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            let existingFolder = currentNode.files.find(f => f.name === part && f.type === 'folder');
            if (!existingFolder) {
                existingFolder = {
                    name: part,
                    type: 'folder',
                    files: []
                };
                currentNode.files.push(existingFolder);
            }
            currentNode = existingFolder;  // 次の階層に移動
        }

        // FileReaderの非同期処理を待つ
        const fileContent = await readFileAsync(file);

        // ファイルを追加
        currentNode.files.push({
            name: fileName,
            type: 'file',
            file: fileContent
        });
    }

    return fileTree;
}

// FileReaderをPromiseでラップする関数
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            resolve(event.target.result);  // ファイル内容を返す
        };
        reader.onerror = function(error) {
            reject(error);  // エラーが発生した場合はエラーを返す
        };
        reader.readAsText(file);  // ファイルを読み込む
    });
}

// 非同期関数の呼び出しで結果を待つ
async function logFileTree(files) {
    const fileTree = await buildFileTree(files);  // buildFileTreeの結果を待つ
    localStorage.setItem('folder', JSON.stringify(fileTree));
    recursion(fileTree.files, document.getElementById('folderStructure'));
}

document.addEventListener("DOMContentLoaded", function () {
    // localStorage から 'folder' データを取得
    const storedData = localStorage.getItem('folder');
    if (storedData) {
        try {
            const folderData = JSON.parse(storedData);

            // フォルダ構造を作成
            recursion(folderData.files, document.getElementById('folderStructure'));
        } catch (error) {
            console.error('JSONのパースに失敗しました:', error);
        }
    } else {
        console.log("フォルダデータが localStorage に見つかりませんでした。");
    }
});

// フォルダ構造を再帰的に作成する関数
function recursion(folder, parentElement) {
    const ul = document.createElement('ul');

    folder.forEach(element => {
        const li = document.createElement('li');
        li.textContent = element.name;
        if (element.type == 'folder') {
            li.classList.add('folder');
            const nestedUl = document.createElement('ul');
            nestedUl.classList.add('nested');
            li.appendChild(nestedUl);
            recursion(element.files, nestedUl);
        } else {
            li.classList.add('file');
            li.addEventListener('click', function() {
                localStorage.setItem('fileContent', element.file);
                localStorage.setItem('fileName', element.name);
                window.location.href = 'test.html'; // 画面遷移
            });
        }
        ul.appendChild(li);
    });
    parentElement.appendChild(ul);
}

document.getElementById('downloadButton').addEventListener('click', function() {
    const zip = new JSZip();
    
    // ダウンロードしたいファイルのパスと内容（仮のデータ）
    // フォルダ内のファイルのリストをここで定義する
    const files = [
        { name: 'folder/徳川.txt', content: `{"contents":[["徳川1代将軍","徳川家康"],["徳川2代将軍","徳川秀忠"],["徳川3代将軍","徳川家光"],["徳川4代将軍","徳川家綱"],["徳川5代将軍","徳川綱吉"],["徳川6代将軍","徳川家宣"],["徳川7代将軍","徳川家継"],["徳川8代将軍","徳川吉宗"],["徳川9代将軍","徳川家重"],["徳川10代将軍","徳川家治"],["徳川11代将軍","徳川家斉"],["徳川12代将軍","徳川家慶"],["徳川13代将軍","徳川家定"],["徳川14代将軍","徳川家茂"],["徳川15代将軍","徳川慶喜"]],"shuffle":false}` },
        { name: 'folder/過去分詞.txt', content: '[["～である be","be - was - been"],["～させる let","let - let - let"],["支える bear","bear - bore - borne"],["横たわる lie","lie - lay - lain"],["打つ、負かす beat","beat - beat - beaten"],["なくす lose","lose - lost - lost"],["～になる become","become - became - become"],["作る make","make - made - made"],["始める begin","begin - began - begun"],["意味する mean","mean - meant - meant"],["噛む bite","bite - bit - bitten"],["会う meet","meet - met - met"],["吹く blow","blow - blew - blown"],["追い越す overtake","overtake - overtook - overtaken"],["壊す break","break - broke - broken"],["支払う pay","pay - paid - paid"],["持ってくる bring","bring - brought - brought"],["置く put","put - put - put"],["建てる build","build - built - built"],["読む read","read - read - read"],["燃やす burn","burn - burnt - burnt"],["乗る ride","ride - rode - ridden"],["買う buy","buy - bought - bought"],["ベルが鳴る ring","ring - rang - rung"],["つかむ catch","catch - caught - caught"],["上がる rise","rise - rose - risen"],["選ぶ choose","choose - chose - chosen"],["走る run","run - ran - run"],["来る come","come - came - come"],["言う　 say","say - said - said"],["費用がかかる cost","cost - cost - cost"],["見る see","see - saw - seen"],["切る cut","cut - cut - cut"],["売る sell","sell - sold - sold"],["掘る dig","dig - dug - dug"],["送る send","send - sent - sent"],["する do","do - did - done"],["置く set","set - set - set"],["描く draw","draw - drew - drawn"],["振る shake","shake - shook - shaken"],["飲む drink","drink - drank - drunk"],["発射する shoot","shoot - shot - shot"],["運転する drive","drive - drove - driven"],["見せる show","show - showed - shown"],["食べる eat","eat - ate - eaten"],["閉じる shut","shut - shut - shut"],["落ちる fall","fall - fell - fallen"],["歌う sing","sing - sang - sung"],["食べ物を与える feed","feed - fed - fed"],["沈む sink","sink - sank - sunk"],["感じる feel","feel - felt - felt"],["座る sit","sit - sat - sat"],["戦う fight","fight - fought - fought"],["眠っている sleep","sleep - slept - slept"],["捜して見つける find","find - found - found"],["話す speak","speak - spoke - spoken"],["忘れる forget","forget - forgot - forgotten, forgot"],["金を使う spend","spend - spent - spent"],["手に入れる get","get - got - gotten"],["広げる spread","spread - spread - spread"],["与える give","give - gave - given"],["立つ stand","stand - stood - stood"],["行く go","go - went - gone"],["盗む steal","steal - stole - stolen"],["育つ grow","grow - grew - grown"],["掃く sweep","sweep - swept - swept"],["掛ける hang","hang - hung - hung"],["泳ぐ swim","swim - swam - swum"],["持つ have","have - had - had"],["持って行く take","take - took - taken"],["聞える hear","hear - heard - heard"],["教える teach","teach - taught - taught"],["打つ hit","hit - hit - hit"],["言う、知らせる tell","tell - told - told"],["手でつかむ hold","hold - held - held"],["思う、考える think","think - thought - thought"],["傷つける hurt","hurt - hurt - hurt"],["投げる throw","throw - threw - thrown"],["保つ keep","keep - kept - kept"],["理解する understand","understand - understood - understood"],["知っている know","know - knew - known"],["目が覚める wake","wake - woke - woken"],["横たえる lay","lay - laid - laid"],["身につける wear","wear - wore - worn"],["導く lead","lead - led - led"],["勝つ win","win - won - won"],["去る leave","leave - left - left"],["書く write","write - wrote - written"],["貸す lend","lend - lent - lent"]]' },
        { name: 'folder/準二級プラス', content: '[["describe","を描写する"],["offer 動","offer A BでAにBを申し出る、AにBを提供する"],["form 動","を組織する、を形作る"],["face 動","に直面する、のほうに顔を向ける"],["department","部門、（大学の）学部、学科"],["charity","慈善（事業）"],["rent 動","を借りる、を貸す"],["irritate","を苛立たせる"],["civilize","を文明化する"],["produce","を生産する、を引き起こす"],["reserve","を予約する、を取っておく"],["grocery","食料雑貨"],["officer","警察官、巡査、公務員、将校"],["construction","建設、建造物"],["several","いくつかの"],["valuable","高価な、有益な"],["sincerely","心から、誠実に"],["attend","に出席する"],["disturb","の邪魔をする、に迷惑をかける"],["concern","関心事、心配"],["equipment","用具、設備"],["cough","せき"],["gallery","美術館、画廊"],["relative 名","親類、身内"],["employee","従業員"],["wealthy","裕福な、豊富な"],["particular","特定の、詳細な"],["immediately","直ちに、直接に"],["avoid","を避ける"],["manage","を何とかやり遂げる、を経営する"],["suffer","苦しむ、患う"],["prevent","を防ぐ、を妨げる"],["argue","と主張する、議論する"],["promote","を促進する、を昇進させる"],["advertise","を宣伝する"],["refer","参照する、言及する"],["surf","（ウェブサイトなど）を見て回る、サーフィンをする"],["instance","具体的な例、実例"],["statement","声明、陳述"],["fat 名","脂肪"],["agency","代理店、（政府の）機関"],["majority","大多数、多数派、大部分"],["disease","病気"],["opportunity","機会"],["survey 名","（詳細な）調査"],["surface","表面、外見"],["excuse 名","言い訳、弁解"],["cleaner","洗剤、クリーニング店"],["confident","確信して、自信のある"],["ordinary","普通の、並の"],["worth 形","価値がある"],["further","さらに、もっと遠くに"],["gradually","徐々に"],["eventually","結局（は）"],["indeed","実は、本当に"],["despite","にもかかわらず"],["remain","のままである、残る"],["film","を撮影する、を映画化する"],["bother","（人）に迷惑をかける、（人）を悩ます"],["package","（小さな）包み"],["refrigerator","冷蔵庫"],["championship","選手権大会、選手権"],["debate 名","討論"],["favor","親切な行為、好意"],["semester","学期"],["audio","音声の"],["alike 形","似ている、同様で"],["nearly","ほとんど、もう少しで～するところで"],["hardly","ほとんど～ない"],["hopefully","願わくば、上手くいけば"],["whenever","～するときはいつでも、いつ～しようとも"],["memorize","を暗記する、を記憶する"],["skip 動","を抜かす、跳ねる"],["enlarge","を大きくする"],["broadcast 動","を放送する"],["puzzle 動","を当惑させる、を悩ます"],["avenue","大通り"],["channel","チャンネル、海峡"],["harvest 名","収穫"],["tutor","家庭教師、個人教師"],["puppy","子犬"],["palace","宮殿、大邸宅"],["pace","速さ、ペース"],["typical","典型的な"],["awake","目が覚めて"],["unfriendly","不親切な、よそよそしい"],["aware","知って、気づいて"],["properly","適切に、礼儀正しく"],["whether","かどうか、であろうとなかろうと"],["whatever","～するものは何でも、たとえ何を～しても、たとえ何が～であろうと"],["whoever","～する人は誰でも、誰が～でも"]]'}
    ];
    
    // ファイルをZIPに追加
    files.forEach(file => {
        zip.file(file.name, file.content);
    });

    // ZIPファイルを生成してダウンロード
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'folder.zip';
        link.click();
    });
});