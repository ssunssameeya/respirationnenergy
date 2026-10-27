/* ============================================================
   선생님이 직접 고치는 설정 파일입니다.
   - 따옴표(' ')와 쉼표(,)만 지우지 않으면 됩니다.
   - 고친 뒤 GitHub에 다시 올리면 바로 반영됩니다.
   - 점수(돌봄·활동 완료·코인·그림 가격 등)는 구글 시트 "설정"에서 바꿉니다.
   ============================================================ */
window.CFG = {

  /* 1) 구글 시트 연결 주소 (Apps Script 웹 앱 URL). 비워 두면 "연습 모드"(이 기기에만 저장)로 동작합니다. */
  API_URL: 'https://script.google.com/macros/s/AKfycbxE4homdSa8ppa0rvJKOPkCJ6wA1i-t8CNUe9dkrLSZmOJDTu0mGNqc2ca1ipYZzRcL/exec',

  /* 2) 성장 단계: need = 그 단계가 되는 데 필요한 누적 경험치 */
  LEVELS: [
    { need: 0,   name: { ko: '신생아', en: 'Newborn', zh: '新生儿', ru: 'Новорождённый', ar: 'مولود', vi: 'Sơ sinh' } },
    { need: 50,  name: { ko: '유아',   en: 'Toddler', zh: '幼儿', ru: 'Малыш', ar: 'طفل صغير', vi: 'Nhi đồng' } },
    { need: 130, name: { ko: '아동',   en: 'Child', zh: '儿童', ru: 'Ребёнок', ar: 'طفل', vi: 'Thiếu nhi' } },
    { need: 250, name: { ko: '청소년기', en: 'Teen', zh: '青少年', ru: 'Подросток', ar: 'مراهق', vi: 'Thiếu niên' } },
    { need: 420, name: { ko: '성인',   en: 'Adult', zh: '成人', ru: 'Взрослый', ar: 'بالغ', vi: 'Người lớn' } }
  ],

  /* 3) 성장 아이템(칭찬): 교사 페이지 버튼이 됩니다. 한 줄 복사해서 id, icon, xp, name만 바꾸면 추가됩니다. */
  ITEMS: [
    { id: 'snack',  icon: '🍪', xp: 3,  name: { ko: '과자',     en: 'Snack', zh: '零食', ru: 'Печенье', ar: 'وجبة خفيفة', vi: 'Bánh snack' } },
    { id: 'soy',    icon: '🥛', xp: 5,  name: { ko: '두유',     en: 'Soy milk', zh: '豆浆', ru: 'Соевое молоко', ar: 'حليب الصويا', vi: 'Sữa đậu nành' } },
    { id: 'burger', icon: '🍔', xp: 7,  name: { ko: '수제버거', en: 'Handmade burger', zh: '手工汉堡', ru: 'Домашний бургер', ar: 'برغر منزلي', vi: 'Burger tự làm' } },
    { id: 'buffet', icon: '🍖', xp: 10, name: { ko: '고기뷔페', en: 'Meat buffet', zh: '烤肉自助', ru: 'Мясной буфет', ar: 'بوفيه لحوم', vi: 'Buffet thịt' } }
  ],

  /* 4) 디버프 이벤트(패널티): xp는 음수로 적습니다. 그날 하루 캐릭터에 효과가 보입니다. */
  DEBUFFS: [
    { id: 'smell',  icon: '💨', xp: -3,  name: { ko: '냄새 공격', en: 'Stink attack', zh: '臭气攻击', ru: 'Вонючая атака', ar: 'هجوم الرائحة', vi: 'Tấn công mùi hôi' } },
    { id: 'tired',  icon: '🥱', xp: -5,  name: { ko: '기력 저하', en: 'Low energy', zh: '没力气', ru: 'Упадок сил', ar: 'ضعف الطاقة', vi: 'Kiệt sức' } },
    { id: 'virus',  icon: '🦠', xp: -10, name: { ko: '전염병',   en: 'Epidemic', zh: '传染病', ru: 'Эпидемия', ar: 'وباء', vi: 'Dịch bệnh' } }
  ],

  /* 5) 돌발 질병: 기관계마다 목록에 추가·삭제할 수 있습니다. 완료한 기관계의 질병만 나타납니다. */
  DISEASES: {
    dig: [ { ko: '장염: 배가 아프고 설사를 해요.', en: 'Gastroenteritis: stomach ache and diarrhoea.', zh: '肠胃炎：肚子痛，还拉肚子。', ru: 'Гастроэнтерит: болит живот и понос.', ar: 'التهاب المعدة والأمعاء: ألم في البطن وإسهال.', vi: 'Viêm ruột: đau bụng và tiêu chảy.' },
           { ko: '변비: 며칠째 변이 나오지 않아 배가 더부룩해요.', en: 'Constipation: no bowel movement for days, the belly feels bloated.', zh: '便秘：好几天没排便，肚子胀胀的。', ru: 'Запор: несколько дней нет стула, живот вздут.', ar: 'إمساك: لا تبرّز منذ أيام والبطن منتفخ.', vi: 'Táo bón: mấy ngày không đi ngoài, bụng đầy hơi.' },
           { ko: '위산 과다: 속이 쓰리고 신물이 올라와요.', en: 'Too much stomach acid: heartburn and sour taste.', zh: '胃酸过多：胃里烧得慌，还反酸水。', ru: 'Повышенная кислотность: изжога и кислый привкус.', ar: 'زيادة حمض المعدة: حرقة وطعم حامض.', vi: 'Thừa axit dạ dày: ợ nóng, ợ chua.' } ],
    cir: [ { ko: '카페인 과다 섭취: 에너지 음료를 많이 마셨더니 심장이 두근거려요.', en: 'Too much caffeine: heart pounding after many energy drinks.', zh: '咖啡因摄入过多：喝了很多能量饮料，心怦怦跳。', ru: 'Слишком много кофеина: после энергетиков сильно бьётся сердце.', ar: 'كافيين زائد: خفقان القلب بعد شرب كثير من مشروبات الطاقة.', vi: 'Quá nhiều caffeine: uống nhiều nước tăng lực nên tim đập thình thịch.' },
           { ko: '빈혈: 얼굴이 창백하고 일어설 때 어지러워요.', en: 'Anaemia: pale face and dizzy when standing up.', zh: '贫血：脸色苍白，站起来时头晕。', ru: 'Анемия: бледное лицо, кружится голова при вставании.', ar: 'فقر الدم: وجه شاحب ودوخة عند الوقوف.', vi: 'Thiếu máu: mặt tái, đứng dậy thì chóng mặt.' } ],
    res: [ { ko: '감기(기관지염): 기침이 나고 가래가 생겼어요.', en: 'Cold (bronchitis): coughing with phlegm.', zh: '感冒（支气管炎）：咳嗽，还有痰。', ru: 'Простуда (бронхит): кашель с мокротой.', ar: 'زكام (التهاب الشعب الهوائية): سعال مع بلغم.', vi: 'Cảm (viêm phế quản): ho và có đờm.' },
           { ko: '비염: 코가 막히고 콧물이 계속 나요.', en: 'Rhinitis: blocked and runny nose.', zh: '鼻炎：鼻子堵，一直流鼻涕。', ru: 'Ринит: нос заложен, течёт насморк.', ar: 'التهاب الأنف: انسداد الأنف وسيلانه.', vi: 'Viêm mũi: nghẹt mũi, chảy nước mũi liên tục.' } ],
    exc: [ { ko: '콩팥 결석: 옆구리가 찌르듯이 아파요.', en: 'Kidney stone: sharp pain in the side.', zh: '肾结石：腰侧像针扎一样痛。', ru: 'Камень в почке: резкая боль в боку.', ar: 'حصى الكلى: ألم حادّ في الجنب.', vi: 'Sỏi thận: đau nhói ở hông.' },
           { ko: '방광염: 오줌을 눌 때 따갑고 자주 마려워요.', en: 'Bladder infection: stinging and frequent urination.', zh: '膀胱炎：排尿时刺痛，总想上厕所。', ru: 'Цистит: жжение и частое мочеиспускание.', ar: 'التهاب المثانة: حرقة وكثرة التبول.', vi: 'Viêm bàng quang: buốt khi đi tiểu và mắc tiểu nhiều lần.' } ]
  },

  /* 6) 픽셀 그림 팔레트 16색 (첫 칸은 지우개=투명). 색 코드를 바꾸면 그림 도구 색이 바뀝니다. */
  PALETTE: ['', '#1b1b1b', '#ffffff', '#f2c6a0', '#c68642', '#6b3e1f', '#e53935', '#fb8c00',
            '#fdd835', '#43a047', '#1e88e5', '#3949ab', '#8e24aa', '#ec407a', '#90a4ae', '#4e342e'],

  /* 7) 랭킹에 보여 줄 인원 */
  RANK_TOP: 10,

  /* 8) 반 목록(시트에 반이 비어 있을 때만 쓰임. 교사 페이지는 시트에 적힌 반 이름을 그대로 씁니다) */
  CLASSES: ['1', '2', '3', '4', '5', '6', '7']
};
