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