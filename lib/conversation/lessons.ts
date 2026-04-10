import type { Locale } from '@/lib/i18n/translations';

/**
 * Temporary: opens NHK WORLD-JAPAN lesson pages (Harumi does not host video).
 * Lessons 1–9: `01.html` … `09.html`; 10+: `10.html` …
 */
export function externalConversationVideoUrl(lessonNumber: number): string {
  const path =
    lessonNumber >= 1 && lessonNumber <= 9
      ? String(lessonNumber).padStart(2, '0')
      : String(lessonNumber);
  return `https://www3.nhk.or.jp/nhkworld/lesson/en/video/${path}.html`;
}

/** Preview image from NHK lesson share metadata (`og:image`); files are `lesson{n}.jpg` (no zero-pad). */
export function nhkLessonOgImageUrl(lessonNumber: number): string {
  return `https://www3.nhk.or.jp/nhkworld/lesson/assets/images/og/lesson${lessonNumber}.jpg`;
}

export type ConversationLesson = {
  id: number;
  titleEn: string;
  titleVi: string;
  titleJa: string;
  phraseJa: string;
  phraseEn: string;
  phraseVi: string;
};

/** 48 situational dialogues (metadata aligned with public NHK “Easy Japanese (NEW)” lesson list). */
export const CONVERSATION_LESSONS: ConversationLesson[] = [
  { id: 1, titleEn: 'Where is Haru-san House?', titleVi: 'Nhà Haru-san ở đâu?', titleJa: 'はるさんハウス', phraseJa: 'はるさんハウスはどこですか', phraseEn: 'Where is Haru-san House?', phraseVi: 'Nhà Haru-san ở đâu ạ?' },
  { id: 2, titleEn: "I'm Tam. I'm a student.", titleVi: 'Tôi là Tam, sinh viên.', titleJa: '自己紹介', phraseJa: 'タムです　学生です', phraseEn: "I'm Tam. I'm a student.", phraseVi: 'Tôi là Tam. Tôi là sinh viên.' },
  { id: 3, titleEn: "I'm from Vietnam.", titleVi: 'Tôi đến từ Việt Nam.', titleJa: '出身', phraseJa: 'ベトナムから来ました', phraseEn: "I'm from Vietnam.", phraseVi: 'Tôi đến từ Việt Nam.' },
  { id: 4, titleEn: "I'm going to study Japanese at a university.", titleVi: 'Tôi sẽ học tiếng Nhật ở đại học.', titleJa: '将来の予定', phraseJa: '大学で日本語を勉強します', phraseEn: "I'm going to study Japanese at a university.", phraseVi: 'Tôi sẽ học tiếng Nhật ở đại học.' },
  { id: 5, titleEn: 'I studied by listening to the radio.', titleVi: 'Tôi học qua đài.', titleJa: '勉強法', phraseJa: 'ラジオで勉強しました', phraseEn: 'I studied by listening to the radio.', phraseVi: 'Tôi đã học qua đài.' },
  { id: 6, titleEn: 'Does this train go to Ikebukuro?', titleVi: 'Tàu này có đi Ikebukuro không?', titleJa: '行き先', phraseJa: 'この電車は池袋に行きますか', phraseEn: 'Does this train go to Ikebukuro?', phraseVi: 'Tàu này có đi Ikebukuro không?' },
  { id: 7, titleEn: 'Please speak slowly.', titleVi: 'Làm ơn nói chậm thôi.', titleJa: '話すスピード', phraseJa: 'ゆっくり話してください', phraseEn: 'Please speak slowly.', phraseVi: 'Làm ơn nói chậm thôi.' },
  { id: 8, titleEn: 'This is my friend, Ayaka-san.', titleVi: 'Đây là bạn tôi, Ayaka-san.', titleJa: '紹介', phraseJa: '友達のあやかさんです', phraseEn: 'This is my friend, Ayaka-san.', phraseVi: 'Đây là bạn tôi, Ayaka-san.' },
  { id: 9, titleEn: 'What is this?', titleVi: 'Cái này là gì?', titleJa: '名前を聞く', phraseJa: 'これは何ですか', phraseEn: 'What is this?', phraseVi: 'Cái này là gì?' },
  { id: 10, titleEn: 'How much is this hair dryer?', titleVi: 'Máy sấy này bao nhiêu tiền?', titleJa: '値段', phraseJa: 'このドライヤーはいくらですか', phraseEn: 'How much is this hair dryer?', phraseVi: 'Máy sấy này bao nhiêu tiền?' },
  { id: 11, titleEn: 'Do you have any lucky charms?', titleVi: 'Có bùa omamori không ạ?', titleJa: '在庫', phraseJa: 'お守りはありますか', phraseEn: 'Do you have any lucky charms?', phraseVi: 'Có bùa omamori không ạ?' },
  { id: 12, titleEn: 'This is a cute amulet, isn’t it?', titleVi: 'Omamori dễ thương nhỉ?', titleJa: '印象', phraseJa: 'かわいいお守りですね', phraseEn: 'This is a cute amulet, isn’t it?', phraseVi: 'Omamori dễ thương nhỉ?' },
  { id: 13, titleEn: 'I want to see the snow.', titleVi: 'Tôi muốn xem tuyết.', titleJa: '願望', phraseJa: '雪が見たいです', phraseEn: 'I want to see the snow.', phraseVi: 'Tôi muốn xem tuyết.' },
  { id: 14, titleEn: 'I want to go to Japan someday.', titleVi: 'Tôi muốn thử đi Nhật.', titleJa: '願望', phraseJa: '日本へ行ってみたいです', phraseEn: 'I want to go to Japan someday.', phraseVi: 'Tôi muốn đi Nhật một lần.' },
  { id: 15, titleEn: 'To the monkey hot spring, please.', titleVi: 'Cho đến suối nước nóng khỉ.', titleJa: 'タクシー', phraseJa: '猿の温泉までお願いします', phraseEn: 'To the monkey hot spring, please.', phraseVi: 'Cho đến suối nước nóng khỉ, làm ơn.' },
  { id: 16, titleEn: 'This is a world-famous hot spring.', titleVi: 'Suối nước nóng nổi tiếng thế giới.', titleJa: '印象', phraseJa: '有名な温泉です', phraseEn: 'This is a world-famous hot spring.', phraseVi: 'Đây là suối nước nóng nổi tiếng thế giới.' },
  { id: 17, titleEn: "I've been traveling around Japan.", titleVi: 'Tôi đang du lịch khắp Nhật.', titleJa: '旅行中', phraseJa: '日本を旅行しています', phraseEn: "I've been traveling around Japan.", phraseVi: 'Tôi đang du lịch khắp Nhật Bản.' },
  { id: 18, titleEn: 'It was really fun.', titleVi: 'Vui lắm ạ.', titleJa: '感想', phraseJa: 'すごく楽しかったです', phraseEn: 'It was really fun.', phraseVi: 'Vui lắm ạ.' },
  { id: 19, titleEn: "I'd like a pair of gloves.", titleVi: 'Tôi muốn mua găng tay.', titleJa: '購入', phraseJa: '手袋が欲しいんですが', phraseEn: "I'd like a pair of gloves.", phraseVi: 'Tôi muốn mua găng tay.' },
  { id: 20, titleEn: "Please don't put wasabi in.", titleVi: 'Không cho wasabi vào nhé.', titleJa: '注文', phraseJa: 'わさびは入れないでください', phraseEn: "Please don't put wasabi in.", phraseVi: 'Làm ơn không cho wasabi vào.' },
  { id: 21, titleEn: "I'm in the clock tower.", titleVi: 'Tôi đang ở trong tháp đồng hồ.', titleJa: '場所', phraseJa: '時計台の中にいます', phraseEn: "I'm in the clock tower.", phraseVi: 'Tôi đang ở trong tháp đồng hồ.' },
  { id: 22, titleEn: "Let's take a photo.", titleVi: 'Chụp ảnh nhé.', titleJa: '誘い', phraseJa: '写真を撮りましょう', phraseEn: "Let's take a photo.", phraseVi: 'Chụp ảnh nhé.' },
  { id: 23, titleEn: 'I like this cat.', titleVi: 'Tôi thích con mèo này.', titleJa: '好み', phraseJa: '私はこのねこが好きです', phraseEn: 'I like this cat.', phraseVi: 'Tôi thích con mèo này.' },
  { id: 24, titleEn: "I can't eat raw eggs.", titleVi: 'Tôi không ăn được trứng sống.', titleJa: '食の制限', phraseJa: '生卵は食べられません', phraseEn: "I can't eat raw eggs.", phraseVi: 'Tôi không ăn được trứng sống.' },
  { id: 25, titleEn: 'My throat hurts.', titleVi: 'Họng tôi đau.', titleJa: '体の不調', phraseJa: 'のどが痛いんです', phraseEn: 'My throat hurts.', phraseVi: 'Họng tôi đau.' },
  { id: 26, titleEn: 'This Japanese omelet is sweet and delicious.', titleVi: 'Trứng cuộn ngọt và ngon.', titleJa: '味の表現', phraseJa: 'この卵焼き、甘くておいしいです', phraseEn: 'This Japanese omelet is sweet and delicious.', phraseVi: 'Trứng cuộn kiểu Nhật này ngọt và ngon.' },
  { id: 27, titleEn: 'Which one is the most tasty?', titleVi: 'Cái nào ngon nhất?', titleJa: '選択', phraseJa: 'どれが一番おいしいですか', phraseEn: 'Which one is the most tasty?', phraseVi: 'Cái nào ngon nhất?' },
  { id: 28, titleEn: 'May I take photos here?', titleVi: 'Tôi chụp ảnh được không?', titleJa: '許可', phraseJa: '写真を撮ってもいいですか', phraseEn: 'May I take photos here?', phraseVi: 'Tôi chụp ảnh ở đây được không?' },
  { id: 29, titleEn: 'I went to listen to a piano recital.', titleVi: 'Tôi đi nghe biểu diễn piano.', titleJa: '経験', phraseJa: 'ピアノの演奏を聴きに行きました', phraseEn: 'I went to listen to a piano recital.', phraseVi: 'Tôi đã đi nghe biểu diễn piano.' },
  { id: 30, titleEn: 'We sang songs and danced together.', titleVi: 'Chúng tôi cùng hát và nhảy.', titleJa: '過去の行動', phraseJa: '一緒に歌ったり、おどったりしました', phraseEn: 'We sang songs and danced together.', phraseVi: 'Chúng tôi đã cùng hát và nhảy.' },
  { id: 31, titleEn: "Why don't we all go together?", titleVi: 'Cùng đi không?', titleJa: '誘い', phraseJa: '一緒に行きませんか', phraseEn: "Why don't we all go together?", phraseVi: 'Mọi người cùng đi không?' },
  { id: 32, titleEn: 'How can I get to the Ninja Museum?', titleVi: 'Đến bảo tàng Ninja thế nào?', titleJa: '道順', phraseJa: '忍者博物館まで、どう行ったらいいですか', phraseEn: 'How can I get to the Ninja Museum?', phraseVi: 'Làm sao để đến bảo tàng Ninja?' },
  { id: 33, titleEn: 'How long does it take to get in?', titleVi: 'Phải chờ bao lâu?', titleJa: '待ち時間', phraseJa: 'どのくらい待ちますか', phraseEn: 'How long does it take to get in?', phraseVi: 'Phải chờ khoảng bao lâu?' },
  { id: 34, titleEn: "I've read it.", titleVi: 'Tôi đã đọc rồi.', titleJa: '経験', phraseJa: '読んだことあります', phraseEn: "I've read it.", phraseVi: 'Tôi đã đọc (truyện) rồi.' },
  { id: 35, titleEn: 'I want to go to Owakudani and eat a black egg.', titleVi: 'Muốn đến Owakudani ăn trứng đen.', titleJa: '願望・順序', phraseJa: '大涌谷に行って、黒たまごが食べたいです', phraseEn: 'I want to go to Owakudani and then eat a black egg.', phraseVi: 'Tôi muốn đến Owakudani rồi ăn trứng đen.' },
  { id: 36, titleEn: 'From what time to what time can we use the bath?', titleVi: 'Bồn tắm mở mấy giờ?', titleJa: '時間の尋ね方', phraseJa: 'お風呂は何時から何時までですか', phraseEn: 'From what time to what time can we use the bath?', phraseVi: 'Bồn tắm dùng từ mấy giờ đến mấy giờ?' },
  { id: 37, titleEn: "The TV won't turn on…", titleVi: 'Ti vi không bật được…', titleJa: '不具合', phraseJa: 'テレビがつかないんですが・・・', phraseEn: "The TV won't turn on…", phraseVi: 'Ti vi không bật được…' },
  { id: 38, titleEn: 'I prefer outside.', titleVi: 'Tôi thích bên ngoài hơn.', titleJa: '比較', phraseJa: '外のほうがいいです', phraseEn: 'I prefer outside.', phraseVi: 'Tôi thích chỗ ngoài hơn.' },
  { id: 39, titleEn: 'I lost my wallet.', titleVi: 'Tôi làm rơi ví.', titleJa: '失敗', phraseJa: '財布を落としてしまいました', phraseEn: 'I lost my wallet.', phraseVi: 'Tôi đánh rơi ví.' },
  { id: 40, titleEn: 'Since it was my first earthquake, I was startled.', titleVi: 'Lần đầu nên tôi giật mình.', titleJa: '理由', phraseJa: '初めてだったから、びっくりしました', phraseEn: 'Since it was my first earthquake, I was startled.', phraseVi: 'Vì lần đầu trải qua động đất nên tôi giật mình.' },
  { id: 41, titleEn: 'Can we buy tickets?', titleVi: 'Có mua được vé không?', titleJa: '可能', phraseJa: 'チケットを買うことができますか', phraseEn: 'Can we buy tickets?', phraseVi: 'Chúng tôi có mua được vé không?' },
  { id: 42, titleEn: "I'm going to give them to Yuuki-san.", titleVi: 'Tôi định đưa cho Yuuki-san.', titleJa: '予定', phraseJa: '悠輝さんに渡すつもりです', phraseEn: "I'm going to give them to Yuuki-san.", phraseVi: 'Tôi định đưa cho Yuuki-san.' },
  { id: 43, titleEn: 'You look well.', titleVi: 'Trông bạn khỏe nhỉ.', titleJa: '様子', phraseJa: '元気そうですね', phraseEn: 'You look well.', phraseVi: 'Trông bạn khỏe nhỉ.' },
  { id: 44, titleEn: "I've heard he's giving another recital.", titleVi: 'Nghe nói sẽ có thêm buổi hòa nhạc.', titleJa: '伝聞', phraseJa: 'またコンサートがあるそうです', phraseEn: "I've heard he's giving another recital.", phraseVi: 'Nghe nói sẽ có thêm buổi biểu diễn.' },
  { id: 45, titleEn: 'Would you check the Japanese in my email?', titleVi: 'Bạn kiểm tra giúp tiếng Nhật trong mail?', titleJa: '依頼', phraseJa: '日本語をチェックしてもらえませんか', phraseEn: 'Would you check the Japanese in my email?', phraseVi: 'Bạn kiểm tra giúp phần tiếng Nhật trong email được không?' },
  { id: 46, titleEn: "It's small but beautiful.", titleVi: 'Nhỏ mà đẹp nhỉ.', titleJa: '印象', phraseJa: '小さいけどきれいですね', phraseEn: "It's small but beautiful.", phraseVi: 'Nhỏ mà đẹp nhỉ.' },
  { id: 47, titleEn: 'How do you do it?', titleVi: 'Làm thế nào vậy?', titleJa: '方法', phraseJa: 'どうやってするんですか', phraseEn: 'How do you do it?', phraseVi: 'Làm thế nào vậy?' },
  { id: 48, titleEn: 'When I graduate, I want to work in Japan.', titleVi: 'Sau khi tốt nghiệp muốn làm việc ở Nhật.', titleJa: '将来', phraseJa: '卒業したら、日本で働きたいです', phraseEn: 'When I graduate, I want to work in Japan.', phraseVi: 'Sau khi tốt nghiệp tôi muốn làm việc ở Nhật.' },
];

export function lessonTitle(lesson: ConversationLesson, locale: Locale): string {
  if (locale === 'vi') return lesson.titleVi;
  if (locale === 'ja') return lesson.titleJa;
  return lesson.titleEn;
}

export function lessonPhraseSub(lesson: ConversationLesson, locale: Locale): string {
  if (locale === 'vi') return lesson.phraseVi;
  if (locale === 'ja') return lesson.phraseEn;
  return lesson.phraseEn;
}
