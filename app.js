'use strict';
const fs = require('fs'); //fsはaFileSystemの略でファイルを扱うためのモジュール
const readline = require('readline'); //ファイルを一行ずつ読む
const rs = fs.createReadStream('./popu-pref.csv'); //streamは非同期で情報を扱うための概念で情報の流れ。
const rl = readline.createInterface({ input: rs, output: {} }); //rlオブジェクトでlineというイベントが発生したらこの無名関数をよぶ
const prefectureDataMap = new Map(); // key:都道府県 value: 集計データのオブジェクト
rl.on('line', lineString => {
    //無名関数の中身
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) { //valueがundefinedだったら初期化
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    };
});

rl.on('close', () => { //closeイベントは全ての行を読み込み終わった際に呼び出される
    //for-of構文で、
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    //連想配列(prefectureDataMap)を普通の配列に変換
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => { //sortに渡す関数を比較関数という。比較関数は2つの引数を受け取って前者の引数pair1を後者の引数pair2より前にしたいときは負の整数、pair2をpair1より前にしたいときは、正の整数、pair1とpair2の並びをそのままにしたいときは0を返す必要があります。大きい順に並べたいので、
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            key +
            ': ' +
            value.popu10 +
            ' => ' +
            value.popu15 +
            ' 変化率:' +
            value.change
        );
    });
    console.log(rankingStrings);
});