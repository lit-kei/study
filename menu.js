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