let shuffle = true;
let dataArray = [];
let question = [];
let problem = [];
let answer = false;
let finish = false;
let id = 0;
let len = 0;



const fileContent = localStorage.getItem('fileContent');
const fileName = localStorage.getItem('fileName');
document.getElementById('fileName').textContent = fileName;
try {
    // JSONとしてパースして配列に変換
    dataArray = JSON.parse(fileContent);
    question = JSON.parse(fileContent);
    shuffleArray(question);
    init();
} catch (error) {
    console.error('ファイルの内容がJSONとしてパースできません:', error);
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

