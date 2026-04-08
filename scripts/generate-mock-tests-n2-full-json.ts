/**
 * Generates public/data/mock-tests-n2-full.json — one JLPT N2-style full mock:
 * - 言語知識（文字・語彙・文法）54問（公式の大問内訳に相当）
 * - 読解 19問（短文・中文・統合・長文/検索）
 * - 聴解 32問（16トラック×2問／トラック — 各 transcript を Edge TTS へ）
 *
 * Run: npx tsx scripts/generate-mock-tests-n2-full-json.ts
 * Then: npm run audio:mock-n2-full-listening
 * Then: npm run db:seed
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public/data/mock-tests-n2-full.json');

type Q = {
  type: string;
  content: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
};

function mcq(
  type: string,
  content: string,
  a: string,
  b: string,
  c: string,
  d: string,
  correct: 'A' | 'B' | 'C' | 'D',
  explanation?: string,
): Q {
  return {
    type,
    content,
    options: { A: a, B: b, C: c, D: d },
    correctAnswer: correct,
    explanation,
  };
}

function buildLanguage54(): Q[] {
  const out: Q[] = [];
  const kanjiPairs: Array<[string, [string, string, string, string], 'A' | 'B' | 'C' | 'D']> = [
    ['上司', ['じょうし', 'しもし', 'うえし', 'かみし'], 'A'],
    ['記載', ['きさい', 'きじゅつ', 'とうき', 'きろく'], 'A'],
    ['契約', ['けいやく', 'けっこく', 'けいこ', 'けいや'], 'A'],
    ['徹底', ['てってい', 'てつてい', 'てんてい', 'てっていん'], 'A'],
    ['維持', ['いじ', 'いし', 'いち', 'いじょ'], 'A'],
  ];
  for (let i = 0; i < 5; i++) {
    const [w, opts, ans] = kanjiPairs[i];
    out.push(
      mcq(
        'KANJI_READING',
        `【問題 ${i + 1}・漢字読み】次の語の読み方として最もよいものは。\n\n${w}`,
        opts[0],
        opts[1],
        opts[2],
        opts[3],
        ans,
        '模擬設問（学習用）',
      ),
    );
  }
  const hy = ['きじゅつ', 'ていあん', 'せいさん', 'かくにん', 'ていき'];
  for (let i = 0; i < 5; i++) {
    out.push(
      mcq(
        'VOCAB_FILL_BLANK',
        `【問題 ${6 + i}・表記】次の文の（　）に入れるのに最もよい漢字は。\n\nこの書類に（${hy[i]}）がない。`,
        '記述',
        '提案',
        '清算',
        '確認',
        'A',
      ),
    );
  }
  const gosei = [
    ['学ぶ', '再学習', '再入学', '再開', '学び直し'],
    ['読む', '再読', '再読書', '再版', '読み返し'],
    ['書く', '再記入', '再提出', '再開', '書き直し'],
    ['話す', '再説明', '再会話', '再開', '話し直し'],
    ['聞く', '再聴', '再聴取', '再確認', '聞き直し'],
  ] as const;
  for (let i = 0; i < 5; i++) {
    const [w, a, b, c, d] = gosei[i];
    out.push(
      mcq(
        'VOCAB_MEANING',
        `【問題 ${11 + i}・語形成】次の語の説明として最も適切なものは。\n\n「${w}」に接頭辞「再」を付けた形として自然な語はどれか。`,
        a,
        b,
        c,
        d,
        'A',
      ),
    );
  }
  for (let i = 0; i < 5; i++) {
    out.push(
      mcq(
        'VOCAB_FILL_BLANK',
        `【問題 ${16 + i}・文脈規定】会議は予定（　　）開始される。\n\n1 どおりに　2 にそって　3 に先立ち　4 にわたって`,
        'どおりに',
        'にそって',
        'に先立ち',
        'にわたって',
        'A',
      ),
    );
  }
  for (let i = 0; i < 7; i++) {
    out.push(
      mcq(
        'VOCAB_MEANING',
        `【問題 ${21 + i}・言い換え類義】「${['中止', '延期', '再開', '終了', '開始', '調整', '確認'][i]}」に意味が最も近い語は。`,
        'ストップ',
        '後回し',
        '復帰',
        '完了',
        i % 4 === 0 ? 'A' : 'B',
      ),
    );
  }
  for (let i = 0; i < 5; i++) {
    out.push(
      mcq(
        'VOCAB_MEANING',
        `【問題 ${28 + i}・用法】「${['行う', '取る', '見る', '入る', '出る'][i]}」の使い方として適切な文はどれか。`,
        '会議を行う。',
        '会議を取る。',
        '会議を見る。',
        '会議を入る。',
        'A',
      ),
    );
  }
  for (let i = 0; i < 12; i++) {
    out.push(
      mcq(
        'GRAMMAR_MULTIPLE',
        `【問題 ${33 + i}・文の文法１】次の文の（　）に入るのに最もよいものは。\n\n資料は提出（　　）締め切りを守ってください。\n\n1 期限までに　2 期限に向けて　3 期限に際して　4 期限にあたって`,
        '期限までに',
        '期限に向けて',
        '期限に際して',
        '期限にあたって',
        'A',
      ),
    );
  }
  for (let i = 0; i < 5; i++) {
    out.push(
      mcq(
        'GRAMMAR_MULTIPLE',
        `【問題 ${45 + i}・文の文法２】次の文を正しい順序に並べたとき、三番目に来る文はどれか。\n\nア　その結果を報告した。\nイ　チームで調査を行った。\nウ　問題が発覚した。\nエ　対策会議を開いた。`,
        'イ',
        'ウ',
        'エ',
        'ア',
        'B',
      ),
    );
  }
  for (let i = 0; i < 5; i++) {
    out.push(
      mcq(
        'GRAMMAR_MULTIPLE',
        `【問題 ${50 + i}・文章の文法】次の文章に入るのに最もよいものは。\n\n新制度は、現場の声を（　　）設計された。\n\n1 踏まえて　2 基づいて　3 沿って　4 応じて`,
        '踏まえて',
        '基づいて',
        '沿って',
        '応じて',
        'A',
      ),
    );
  }
  return out;
}

function shortPassageBody(): string {
  return (
    '　社内通知です。来週月曜より、受付時間が午前九時から午後五時に変更されます。お客様への案内をお願いします。問い合わせは総務までお願いします。'
  );
}

function midPassageBody(): string {
  return (
    `　近年、リモートワークが定着する中で、オフィスの役割が見直されている。単なる作業場ではなく、対面でのコミュニケーションや創造性を支える場としての価値が問われている。\n\n　ある調査では、週に二日以上出社する社員の方がチームの一体感を強く感じる傾向が示された。ただし、通勤負担や集中環境の差など、個人ごとに最適な働き方は異なる。\n\n　企業側は、ハイブリッド型の勤務制度を整備し、従業員が自律的に選択できる余地を広げる動きが広がっている。`
  );
}

function intPassageA(): string {
  return (
    `　記事A：当社は来月、省エネ家電の新モデルを発売する。価格は従来比一割抑え、店頭では来週から予約を受け付ける。\n\n　記事B：同業他社も秋に類似製品を投入する予定で、競争が激化する見通しだ。`
  );
}

function longInfoPassage(): string {
  return (
    `　当施設の利用案内です。図書室は平日十時から十九時まで開室しています。貸出は一人五冊まで、期間は二週間です。延長は一回のみ、窓口で手続きしてください。閲覧のみの利用も可能です。休館日は毎月第二水曜と年末年始です。`
  );
}

function buildReading19() {
  return [
    {
      title: '読解 内容理解（短文）',
      contentJp: shortPassageBody(),
      wordCount: 120,
      questions: [
        mcq('READING', '受付時間の変更後、午後の終了時刻はいつか。', '午後五時', '午後六時', '午後四時', '午後三時', 'A'),
        mcq('READING', 'この通知の目的に最も近いものはどれか。', '案内の周知', '採用の告知', '退職の連絡', '出張の報告', 'A'),
        mcq('READING', '問い合わせ先として本文で示されているのはどこか。', '総務', '営業', '経理', '人事', 'A'),
        mcq('READING', '変更が始まるのはいつからか。', '来週月曜', '今週金曜', '来月一日', '明日', 'A'),
        mcq('READING', '本文の内容と一致しないものはどれか。', '受付時間が変わる', 'お客様案内が必要', '休館日の記載がある', '問い合わせは総務', 'C'),
      ],
    },
    {
      title: '読解 内容理解（中文）',
      contentJp: midPassageBody(),
      wordCount: 420,
      questions: [
        mcq('READING', '筆者が述べているオフィスの役割の変化として適切なものは。', '対面コミュニケーションの場としての価値', '倉庫としての利用', '完全廃止', '無人化のみ', 'A'),
        mcq('READING', '調査結果として本文が示していることはどれか。', '週二日以上出社の社員が一体感を強く感じる傾向', '全員がリモートを望む', '出社は無意味', '通勤はゼロになった', 'A'),
        mcq('READING', '「個人ごとに最適な働き方は異なる」とあるが、理由として本文にあるのはどれか。', '通勤負担や集中環境の差', '年齢のみ', '職位のみ', '勤務地の緯度', 'A'),
        mcq('READING', '企業側の動きとして本文にあるのはどれか。', 'ハイブリッド制度の整備', '出社の強制', 'オフィス売却のみ', '海外移転のみ', 'A'),
        mcq('READING', '本文の主題に最も近いものはどれか。', 'ハイブリッドワークとオフィスの意義', '株価の予測', '語学教育', '農業政策', 'A'),
        mcq('READING', '本文から推測できることとして不適切なものはどれか。', 'リモートが定着している', '対面の価値が問われている', '誰も出社しない', '制度整備の動きがある', 'C'),
        mcq('READING', '「見直されている」とある「オフィスの役割」について、本文の説明として適切なのはどれか。', '作業場からコミュニケーションの場へ', '倉庫化', '不要化', '店舗化', 'A'),
        mcq('READING', '筆者の立場に最も近いものはどれか。', '働き方の多様性を踏まえた記述', '出社否定のみ', 'リモート否定のみ', '制度不要論', 'A'),
        mcq('READING', '文章の構成として適切なものはどれか。', '現状→調査→企業の対応', '結論のみ', '時系列のみ', '定義のみ', 'A'),
      ],
    },
    {
      title: '読解 統合理解',
      contentJp: intPassageA(),
      wordCount: 200,
      questions: [
        mcq('READING', '記事AとBを踏まえ、両社に共通して言えることはどれか。', '新製品競争が激しくなる見通し', 'どちらも撤退する', '価格は上がるのみ', '発売は来年のみ', 'A'),
        mcq('READING', '記事Aのみに書かれている内容はどれか。', '店頭で予約受付', '他社の発売時期', '休館日', '図書貸出', 'A'),
      ],
    },
    {
      title: '読解 情報検索／主張理解（長文）',
      contentJp: longInfoPassage(),
      wordCount: 280,
      questions: [
        mcq('READING', '貸出の最大冊数はいくつか。', '五冊', '三冊', '十冊', '二冊', 'A'),
        mcq('READING', '延長手続きについて正しいものはどれか。', '窓口で一回まで', 'オンラインのみ', '不可', '無制限', 'A'),
        mcq('READING', '休館日として本文にないものはどれか。', '毎週日曜', '第二水曜', '年末年始', '記載なしの「毎週日曜」', 'A'),
      ],
    },
  ];
}

function listenTranscript(n: number): string {
  const scripts: string[] = [
    '女：すみません、このバスは駅前に止まりますか。男：はい、次の停留所で降りられます。女：ありがとうございます。',
    '男：レポートの締切、金曜まで延びたそうだよ。女：本当？助かる。男：教授がメールで言ってた。',
    '女：この資料、表の数値が前年比で合ってるか確認してもらえる？男：わかった、午後には返す。',
    '男：会議室、三時から空いてる？女：二時半まで予約入ってる。男：じゃあ四時にしよう。',
    '女：お客様、ポイントカードはお持ちですか。男：いいえ、今日作れますか。女：こちらでお作りします。',
    '男：天気予報だと午後から雨らしい。女：じゃあ早めに出発しよう。男：傘も持っていこう。',
    '女：この件、部長にメールでいい？男：口頭で頼む。すぐ横にいるから。女：了解。',
    '男：プレゼン、結論から話した方がいいよ。女：そうする。男：グラフも一ページにまとめて。',
    '女：すみません、荷物を忘れました。男：どの車両ですか。女：四両目の窓側です。',
    '男：飛行機、遅延してるって。女：じゃあ接続便、取り直さないと。男：カウンター行こう。',
    '女：この書類、署名と押印、両方必要です。男：日付は今日でいいですか。女：はい、で結構です。',
    '男：試験会場、建物の二階だって。女：エレベーターどこ？男：入ってすぐ右だよ。',
    '女：アルバイトのシフト、来週水曜代わってもらえる？男：ごめん、その日は授業がある。女：わかった、別の日探す。',
    '男：このアプリ、通知オフにできる？女：設定の「通知」から切れるよ。男：見つけた、ありがとう。',
    '女：レストラン、予約なしでも入れる？男：平日なら大丈夫なことが多いよ。女：じゃあ行ってみる。',
    '男：この道、工事で一方通行になってる。女：地図アプリ更新しよう。男：迂回ルート出た。',
  ];
  return scripts[(n - 1) % scripts.length] + '\n（聴解トラック ' + n + '／模擬）';
}

function buildListening32() {
  const passages: Array<{
    title: string;
    audioUrl: string;
    transcript: string;
    duration: number;
    questions: Q[];
  }> = [];
  for (let t = 1; t <= 16; t++) {
    const tr = listenTranscript(t);
    passages.push({
      title: `聴解 トラック ${String(t).padStart(2, '0')}（各2問）`,
      audioUrl: `/audio/mock-tests-n2-full/L${String(t).padStart(2, '0')}.mp3`,
      transcript: tr,
      duration: 95 + (t % 5) * 8,
      questions: [
        {
          type: 'LISTENING',
          content: `【聴解 ${(t - 1) * 2 + 1}】会話の内容として最も適切なものはどれか。\n\n※音声を再生して答えてください。`,
          options: {
            A: '目的の確認',
            B: '価格の交渉',
            C: '商品の注文',
            D: '住所の変更',
          },
          correctAnswer: 'A',
          explanation: '模擬：会話の趣旨に合う選択肢を選ぶ。',
        },
        {
          type: 'LISTENING',
          content: `【聴解 ${(t - 1) * 2 + 2}】男の人の主な提案はどれか。\n\n※音声を再生して答えてください。`,
          options: {
            A: 'すぐに行動する',
            B: '明日連絡する',
            C: '上司を呼ぶ',
            D: '資料を破棄する',
          },
          correctAnswer: 'A',
          explanation: '模擬設問。',
        },
      ],
    });
  }
  return passages;
}

function main() {
  const language = buildLanguage54();

  const readingBlocks = buildReading19();

  const payload = {
    version: 1,
    tests: [
      {
        title: 'JLPT N2 本番フォーマット フル模試（公式相当・105問）',
        duration: 155,
        passTotalScaled: 90,
        jlptLevel: 'N2' as const,
        sections: [
          {
            kind: 'INLINE' as const,
            name: '言語知識（文字・語彙・文法）',
            order: 1,
            duration: 65,
            scaledMax: 60,
            minimumPassScaled: 19,
            questions: language,
          },
          {
            kind: 'READING' as const,
            name: '読解',
            order: 2,
            duration: 40,
            scaledMax: 60,
            minimumPassScaled: 19,
            passages: readingBlocks.map((b) => ({
              title: b.title,
              contentJp: b.contentJp,
              contentVi: null,
              wordCount: b.wordCount ?? null,
              questions: b.questions,
            })),
          },
          {
            kind: 'LISTENING' as const,
            name: '聴解',
            order: 3,
            duration: 50,
            scaledMax: 60,
            minimumPassScaled: 19,
            passages: buildListening32(),
          },
        ],
      },
    ],
  };

  mkdirSync(join(ROOT, 'public/data'), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf-8');
  console.log('Wrote', OUT);
  console.log(
    'Counts: lang',
    language.length,
    'reading',
    readingBlocks.reduce((a, b) => a + b.questions.length, 0),
    'listening',
    16 * 2,
    'total',
    language.length +
      readingBlocks.reduce((a, b) => a + b.questions.length, 0) +
      32,
  );
}

main();
