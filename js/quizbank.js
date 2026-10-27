/* 일일 퀴즈 문제 은행
   - act: 이 활동을 마친 학생에게만 출제됩니다.
   - t: 'ox' 또는 'mc'(객관식). a: 정답 ('O'/'X' 또는 보기 번호 0부터).
   - 문제 문장은 lang/ko.js 의 qz_문제ID, 해설은 qz_문제ID_x 에 있습니다. 보기(o)는 문장 키입니다.
   - 문제를 추가하려면 한 줄 복사해서 id를 새로 정하고, lang/ko.js 에 문장과 해설을 추가합니다. */
var QUIZ = [
  /* 소화계 1: 영양소 검출 */
  { id: 'd1a', act: 'd1', t: 'ox', a: 'O' },
  { id: 'd1b', act: 'd1', t: 'ox', a: 'X' },
  { id: 'd1c', act: 'd1', t: 'ox', a: 'X' },
  { id: 'd1d', act: 'd1', t: 'mc', o: ['d1_rs_protein', 'd1_rs_starch', 'd1_rs_fat', 'd1_rs_sugar'], a: 0 },
  { id: 'd1e', act: 'd1', t: 'mc', o: ['c_orange', 'c_navy', 'c_purple', 'c_red'], a: 0 },
  { id: 'd1f', act: 'd1', t: 'mc', o: ['d1_o_rs', 'd1_o_pf', 'd1_o_f', 'd1_o_sp'], a: 0 },
  { id: 'd1g', act: 'd1', t: 'mc', o: ['d1_rs_fat', 'd1_rs_starch', 'd1_rs_protein', 'd1_rs_sugar'], a: 0 },
  /* 소화계 2: 구조와 기능 */
  { id: 'd2a', act: 'd2', t: 'mc', o: ['qz_w_digest', 'qz_w_absorb', 'qz_w_excrete', 'qz_w_circ'], a: 0 },
  { id: 'd2b', act: 'd2', t: 'ox', a: 'X' },
  { id: 'd2c', act: 'd2', t: 'ox', a: 'O' },
  { id: 'd2d', act: 'd2', t: 'ox', a: 'O' },
  { id: 'd2e', act: 'd2', t: 'ox', a: 'O' },
  { id: 'd2f', act: 'd2', t: 'mc', o: ['qz_o_teeth', 'qz_o_stomeso', 'qz_o_liverpanc', 'qz_o_smalllarge'], a: 0 },
  { id: 'd2g', act: 'd2', t: 'mc', o: ['d2_o_stom', 'd2_o_eso', 'd2_o_large', 'd2_o_anus'], a: 0 },
  { id: 'd2h', act: 'd2', t: 'mc', o: ['d2_o_small', 'd2_o_large', 'd2_o_stom', 'd2_o_eso'], a: 0 },
  /* 소화계 3: 침의 소화 작용 */
  { id: 'd3a', act: 'd3', t: 'mc', o: ['qz_w_enzyme', 'e_bile', 'qz_w_hcl', 'd5_villus'], a: 0 },
  { id: 'd3b', act: 'd3', t: 'ox', a: 'X' },
  { id: 'd3c', act: 'd3', t: 'mc', o: ['d3_t2', 'd3_t1', 'd3_t3'], a: 0 },
  { id: 'd3d', act: 'd3', t: 'mc', o: ['n_sugar', 'n_starch', 'n_protein', 'n_fat'], a: 0 },
  /* 소화계 4: 소화효소 */
  { id: 'd4a', act: 'd4', t: 'ox', a: 'O' },
  { id: 'd4b', act: 'd4', t: 'ox', a: 'O' },
  { id: 'd4c', act: 'd4', t: 'ox', a: 'X' },
  { id: 'd4d', act: 'd4', t: 'mc', o: ['qz_w_hcl', 'e_bile', 'e_tryp', 'e_amyl'], a: 0 },
  { id: 'd4e', act: 'd4', t: 'mc', o: ['p_amino', 'p_glu', 'p_fatty', 'p_malt'], a: 0 },
  { id: 'd4f', act: 'd4', t: 'mc', o: ['p_fatty', 'p_amino', 'p_glu', 'p_malt'], a: 0 },
  /* 소화계 5: 흡수 */
  { id: 'd5a', act: 'd5', t: 'mc', o: ['qz_w_wider', 'qz_w_narrower', 'qz_w_same'], a: 0 },
  { id: 'd5b', act: 'd5', t: 'mc', o: ['qz_w_blood', 'e_bile', 'j_gastric', 'j_saliva'], a: 0 },
  { id: 'd5c', act: 'd5', t: 'mc', o: ['d5_water', 'p_glu', 'p_amino', 'p_fatty'], a: 0 },
  { id: 'd5d', act: 'd5', t: 'mc', o: ['d2_o_anus', 'd2_o_large', 'd2_o_small', 'd2_o_stom'], a: 0 },
  { id: 'd5e', act: 'd5', t: 'ox', a: 'X' },
  /* 순환계 1: 심장 */
  { id: 'c1a', act: 'c1', t: 'mc', o: ['qz_w_circsys', 'qz_w_digsys', 'qz_w_ressys', 'qz_w_excsys'], a: 0 },
  { id: 'c1b', act: 'c1', t: 'ox', a: 'X' },
  { id: 'c1c', act: 'c1', t: 'ox', a: 'X' },
  { id: 'c1d', act: 'c1', t: 'ox', a: 'O' },
  { id: 'c1e', act: 'c1', t: 'ox', a: 'O' },
  { id: 'c1f', act: 'c1', t: 'mc', o: ['h_ra', 'h_rv', 'h_la', 'h_lv'], a: 0 },
  /* 순환계 2: 혈관과 혈액 */
  { id: 'c2a', act: 'c2', t: 'mc', o: ['c2_v_c', 'c2_v_a', 'c2_v_v'], a: 0 },
  { id: 'c2b', act: 'c2', t: 'mc', o: ['c2_v_a', 'c2_v_c', 'c2_v_v'], a: 0 },
  { id: 'c2c', act: 'c2', t: 'mc', o: ['c2_v_v', 'c2_v_a', 'c2_v_c'], a: 0 },
  { id: 'c2d', act: 'c2', t: 'mc', o: ['c2_rbc', 'c2_wbc', 'c2_plt', 'c2_plasma'], a: 0 },
  { id: 'c2e', act: 'c2', t: 'mc', o: ['c2_plt', 'c2_rbc', 'c2_wbc', 'c2_plasma'], a: 0 },
  { id: 'c2f', act: 'c2', t: 'mc', o: ['c2_many', 'c2_few'], a: 0 },
  /* 순환계 3: 순환 경로 */
  { id: 'c3a', act: 'c3', t: 'mc', o: ['c3_matex', 'c3_gasex'], a: 0 },
  { id: 'c3b', act: 'c3', t: 'mc', o: ['c3_gasex', 'c3_matex'], a: 0 },
  { id: 'c3c', act: 'c3', t: 'mc', o: ['h_ra', 'h_la', 'h_rv', 'h_lv'], a: 0 },
  { id: 'c3d', act: 'c3', t: 'mc', o: ['h_la', 'h_ra', 'h_lv', 'h_rv'], a: 0 },
  { id: 'c3e', act: 'c3', t: 'ox', a: 'X' },
  { id: 'c3f', act: 'c3', t: 'mc', o: ['c2_v_c', 'c2_v_a', 'c2_v_v'], a: 0 },
  /* 호흡계 1: 구조와 기능 */
  { id: 'r1a', act: 'r1', t: 'mc', o: ['qz_w_ressys', 'qz_w_circsys', 'qz_w_digsys', 'qz_w_excsys'], a: 0 },
  { id: 'r1b', act: 'r1', t: 'ox', a: 'O' },
  { id: 'r1c', act: 'r1', t: 'mc', o: ['r_bron', 'r_trach', 'r_alv', 'r_nose'], a: 0 },
  { id: 'r1d', act: 'r1', t: 'ox', a: 'X' },
  /* 호흡계 2: 폐의 구조적 특징 */
  { id: 'r2a', act: 'r2', t: 'mc', o: ['r_alv', 'r_bron', 'r_trach', 'r_dia'], a: 0 },
  { id: 'r2b', act: 'r2', t: 'ox', a: 'X' },
  { id: 'r2c', act: 'r2', t: 'mc', o: ['c3_o2', 'c3_co2'], a: 0 },
  { id: 'r2d', act: 'r2', t: 'ox', a: 'O' },
  /* 호흡계 3: 호흡 운동의 원리 */
  { id: 'r3a', act: 'r3', t: 'ox', a: 'X' },
  { id: 'r3b', act: 'r3', t: 'mc', o: ['qz_r_o1', 'qz_r_o2', 'qz_r_o3', 'qz_r_o4'], a: 0 },
  { id: 'r3c', act: 'r3', t: 'ox', a: 'O' },
  { id: 'r3d', act: 'r3', t: 'mc', o: ['r3_low', 'r3_high', 'r3_eq'], a: 0 },
  { id: 'r3e', act: 'r3', t: 'mc', o: ['qz_r_o5', 'qz_r_o6', 'qz_r_o7'], a: 0 },
  /* 호흡계 4: 모형과 실제 */
  { id: 'r4a', act: 'r4', t: 'mc', o: ['r_lung', 'r_rib', 'r_dia', 'r_trach'], a: 0 },
  { id: 'r4b', act: 'r4', t: 'mc', o: ['r_rib', 'r_lung', 'r_dia', 'r_trach'], a: 0 },
  { id: 'r4c', act: 'r4', t: 'ox', a: 'X' },
  /* 배설계 1: 구조와 기능 */
  { id: 'e1a', act: 'e1', t: 'mc', o: ['qz_w_excsys', 'qz_w_digsys', 'qz_w_circsys', 'qz_w_ressys'], a: 0 },
  { id: 'e1b', act: 'e1', t: 'ox', a: 'X' },
  { id: 'e1c', act: 'e1', t: 'mc', o: ['x_uret', 'x_ure', 'x_pelvis', 'x_blad'], a: 0 },
  { id: 'e1d', act: 'e1', t: 'mc', o: ['x_neph', 'x_pelvis', 'x_cortex', 'x_blad'], a: 0 },
  /* 배설계 2: 오줌 생성 과정 */
  { id: 'e2a', act: 'e2', t: 'mc', o: ['qz_x_filter', 'qz_x_reab', 'qz_x_secr'], a: 0 },
  { id: 'e2b', act: 'e2', t: 'mc', o: ['qz_x_reab', 'qz_x_filter', 'qz_x_secr'], a: 0 },
  { id: 'e2c', act: 'e2', t: 'mc', o: ['qz_x_secr', 'qz_x_filter', 'qz_x_reab'], a: 0 },
  { id: 'e2d', act: 'e2', t: 'ox', a: 'O' },
  { id: 'e2e', act: 'e2', t: 'ox', a: 'O' },
  /* 배설계 3: 배설계의 이상 */
  { id: 'e3a', act: 'e3', t: 'mc', o: ['qz_x_reab', 'qz_x_filter', 'qz_x_secr'], a: 0 },
  { id: 'e3b', act: 'e3', t: 'mc', o: ['qz_x_filter', 'qz_x_reab', 'qz_x_secr'], a: 0 },
  { id: 'e3c', act: 'e3', t: 'ox', a: 'O' },
  /* 세포호흡 1: 세포호흡 */
  { id: 's1a', act: 's1', t: 'mc', o: ['qz_s_cel', 'qz_s_photo', 'qz_s_digest'], a: 0 },
  { id: 's1b', act: 's1', t: 'ox', a: 'X' },
  { id: 's1c', act: 's1', t: 'ox', a: 'O' },
  { id: 's1d', act: 's1', t: 'mc', o: ['qz_s_mito', 'qz_s_nuc', 'qz_s_wall'], a: 0 },
  /* 세포호흡 2: 1분 달리기 */
  { id: 's2a', act: 's2', t: 'mc', o: ['qz_s_up', 'qz_s_down', 'qz_s_same'], a: 0 },
  { id: 's2b', act: 's2', t: 'ox', a: 'O' },
  { id: 's2c', act: 's2', t: 'ox', a: 'O' },
  /* 세포호흡 3: 기관계의 통합적 작용 */
  { id: 's3a', act: 's3', t: 'mc', o: ['qz_w_circsys', 'qz_w_ressys', 'qz_w_digsys', 'qz_w_excsys'], a: 0 },
  { id: 's3b', act: 's3', t: 'mc', o: ['qz_w_excsys', 'qz_w_digsys', 'qz_w_circsys', 'qz_w_ressys'], a: 0 },
  { id: 's3c', act: 's3', t: 'ox', a: 'X' }
];
