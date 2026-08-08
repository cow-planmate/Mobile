---
target: 홈 / 일정 생성 화면
total_score: 16
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-08T07-30-19Z
slug: src-features-home-screens-homescreen-view-tsx
---
Method: dual-agent (A: ac3d4324d5416fc73 · B: a50327627c187dc51)

대상: planMate 홈 / 일정 생성 화면 (초기 탭). `HomeScreen.tsx` · `HomeScreen.view.tsx` · `HomeScreen.styles.ts` + 이 화면이 여는 `Header`, `SearchLocationModal`, `CalendarModal`, `PaxModal`, `SelectionModal`, `NotificationModal`.
모드: Operate (사용자가 과업을 완수하는 화면). 플랫폼: React Native 0.81 / Android 전용. 브라우저·에뮬레이터 없음 — 모든 수치는 소스에서 계산.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | 생성 시 전체화면 로더는 있으나, 목적지 조회 실패 시 번들 데이터로 조용히 폴백(`SearchLocationModal.tsx:78-80`). CTA에 busy 상태 없음 |
| 2 | Match System / Real World | 2 | 친구 2~5인 제품에 "성인/어린이(만 17세 이하)" 예약엔진 어휘. 생성 중인데 로더 문구는 "불러오는 중"(`AirplaneLoading.tsx:128`) |
| 3 | User Control and Freedom | 1 | 5개 모달 중 2개에서 Android Back 무효(`SearchLocationModal.tsx:257`, `CalendarModal.tsx:167`). 생성 중 취소 경로 의도적 차단(`HomeScreen.tsx:48,371`) |
| 4 | Consistency and Standards | 1 | normalize 구현 4벌, 파랑 계열 9종, 모달 5개에 radius 체계 3종. 정본 주 버튼(`AuthSubmitButton.tsx`)을 두고 홈이 재구현 |
| 5 | Error Prevention | 1 | 과거 날짜 선택 가능, 기간 상한 없음, 4개 필드 중 3개가 기본값으로 선점되어 미조작 폼도 제출 가능(`HomeScreen.tsx:61-67`) |
| 6 | Recognition Rather Than Recall | 3 | 카드에 모든 값이 항상 보이고 모달 재진입 시 현재 상태로 재시딩(`CalendarModal.tsx:36-48`, `SearchLocationModal.tsx:118-124`) |
| 7 | Flexibility and Efficiency | 1 | 검색·최근 목적지·기간 프리셋·일정 복제·진행 중 일정 목록 전무. 검색/최근 태그 스타일은 작성돼 있으나 렌더되지 않음(`SearchLocationModal.styles.ts:90-127,151-179`) |
| 8 | Aesthetic and Minimalist Design | 2 | 폼 자체는 정갈. 히어로는 North Star가 명시적으로 거부한 장식이고, 카드에는 시스템이 금지한 그림자(`HomeScreen.styles.ts:106-110`) |
| 9 | Error Recovery | 2 | 모든 실패가 "확인" 하나뿐인 모달 경고, 재시도 어포던스 없음(`HomeScreen.tsx:178,192,299-303`). MD3는 액션 있는 스낵바를 요구 |
| 10 | Help and Documentation | 1 | "일정생성"이 무엇을 만드는지, 친구 초대가 이후에 일어난다는 사실을 알리는 문구가 앱 첫 화면에 전무 |
| **Total** | | **16/40** | **Poor — 핵심 경험 보수 필요** |

## Design Specificity Verdict

**LLM 평가: 이 화면은 planMate를 위해 저작되지 않았다. 카테고리 교체 가능 수준.**

구성은 "사진 히어로 + 흰 슬로건 → 목적지/기간/인원/이동수단 4행 카드 → 전폭 파란 CTA". 야놀자·여기어때·아고다·익스피디아의 검색 패널과 동일하다. 히어로는 Unsplash 하드코딩 URL 2장을 5초 간격으로 회전시키며(`HomeScreen.view.tsx:22-23,148-153`), `rgba(0,0,0,0.3)` 스크림 위에 28sp 흰 볼드를 얹는다. 이는 DESIGN.md Overview가 이름을 지목해 거부한 구성("무드 사진 위의 큰 글씨")이다.

더 중요한 것은 없는 것이다. PRODUCT.md가 정의한 두 핵심 메커니즘 — 실시간 동시 편집, 일정→여행기→커뮤니티 순환 — 이 이 화면에 단 한 픽셀도 없다. 동행자, 접속 상태, 역할, 진행 중인 일정, 한 시간 전 친구들과 편집하던 일정으로 돌아갈 경로가 전부 부재하다. "인원"은 사람이 아니라 정수이고, 2~5인이 함께 짠다는 제품 전제는 숫자 `1`로 표현된다. planMate 고유 표식은 워드마크와 초대 배지뿐이며, 배지는 화면에서 물리적으로 가장 작은 요소다.

이 화면은 자기 디자인 시스템의 시그니처(타임라인 장소 카드, 4dp 카테고리 좌측 테두리)와도 어휘를 공유하지 않는다. 단순히 generic한 것이 아니라 소속 시스템과 불일치한다.

**결정론적 스캔:** 번들 detector(`detect.mjs --json src/features/home/screens src/components/common`)는 exit 2로 5건을 반환했으나 3건만 대상 범위 안이고(`HomeScreen.styles.ts:38` `#0047FF`, `Header.tsx:158` `#0047FF`, `Header.tsx:255` `#EF4444`), 그중 1건은 죽은 코드다. HTML/CSS 룰 엔진이라 RN 코드에서는 실제 존재하는 색 리터럴 101개 중 3개만 잡았고 터치 타깃·인셋·접근성은 하나도 잡지 못했다. detector의 exit 2는 커버리지 신호로 읽으면 안 된다.

Assessment B의 자체 스캔이 실질 증거다:

| 항목 | 측정값 |
|---|---|
| 대상 파일 색 리터럴 | 101개 / 9개 파일 |
| `design/tokens.ts`에서 온 값 | **0개** |
| 경쟁하는 팔레트 정의 | 6벌 |
| 살아 있는 "primary blue" | 4종 (`#1344FF`, `#0047FF`, `#2563EB`, `#1E3A8A`) |
| 빨강 | 3종 (`#FF3B30`, `#EF4444`, `#D92D20`) |
| shadow/elevation 선언 | 20개 / 4개 표면 (Android에서 16개는 무효) |
| 서로 다른 elevation 값 | 4종 (5, 5, 8, 20) |
| 인터랙티브 요소 | 30개 |
| 48dp 미만 | **13개** (최소 25dp 알림 벨) |
| `hitSlop` 사용 | **0회** |
| 접근성 속성 전무 | **30/30** |
| `useSafeAreaInsets()` 사용 | **0/13** (같은 저장소의 다른 12개 화면은 사용) |
| 대비 계산 쌍 | 29쌍, **11쌍 기준 미달** |
| 홈 카드 vs 자기 모달의 스케일 괴리 | 800dp에서 **85%** |

**시각 오버레이:** 사용 불가. 브라우저·개발 서버·에뮬레이터가 없는 환경이며 Android 앱을 렌더할 방법이 없다. 스크린샷으로 검증된 항목은 없다.

## Overall Impression

폼 구조 자체는 Operate 모드에 맞게 잘 잡혀 있다. 문제는 그 위아래다. 위로는 제품의 정체성이 스톡 사진으로 대체되어 있고, 아래로는 플랫폼 계약(Back, 인셋, 터치 타깃, 폰트 스케일)이 이 화면에서만 지켜지지 않는다. 같은 저장소의 인증 화면들과 `ItineraryEditorScreen`은 이 계약을 지킨다 — 즉 팀은 방법을 알고 있고, 앱의 첫 화면만 그 규율 밖에 있다.

가장 큰 기회 하나: 히어로 180dp를 스톡 사진에서 "진행 중인 일정과 지금 편집 중인 친구"로 바꾸는 것. 제품의 차별점이 자기 현관에 나타나고, 동시에 DESIGN.md가 거부한 구성이 사라진다.

## What's Working

**1. 4행 카드는 Operate 모드에 정확히 맞는 형태다.** 라벨 위·값 아래 4행, 모든 값이 동시에 보이고 각 행이 단일 목적 모달 하나만 연다(`HomeScreen.view.tsx:186-216`). 작업 기억에 부담을 주지 않으며 행 높이도 48dp를 넘긴다. 이 화면에서 판단이 가장 잘 선 부분이다.

**2. 모달 재진입 시 상태 복원이 이 화면 최고의 디테일이다.** `CalendarModal`은 props로 재시딩할 뿐 아니라 오늘이 아니라 현재 시작일이 있는 달로 포커스하고(`:36-48`), `SearchLocationModal`은 퍼지 지역 매칭으로 현재 목적지를 선택 상태로 복원하며 28개 도시 목록을 1시간 캐시 + 오프라인 폴백으로 유지한다(`:62-96,118-124`). 이런 폼이 대개 틀리는 지점을 맞혔다.

**3. 컨테이너/뷰/스타일 분리가 실제로 값을 한다.** `HomeScreenView`는 30개 prop을 받고 지역 상태를 하나만 갖는다. 아래 수정 대부분이 구조 변경이 아니라 스타일 파일과 prop 편집으로 끝난다.

## Priority Issues

### [P0] Android 시스템 Back이 모달 두 곳에서 죽어 있다

- **무엇:** `SearchLocationModal.tsx:257`과 `CalendarModal.tsx:167`이 `<Modal>`에 `onRequestClose`를 주지 않는다. 이 prop이 없으면 RN Android 모달은 하드웨어/제스처 Back을 완전히 무시한다. `CalendarModal`은 배경이 `Pressable`이 아닌 일반 `View`(`:168`)라 배경 탭 닫기도 없어, 유일한 탈출구가 36×36dp X 버튼뿐이다.
- **왜 중요한가:** Back은 Android에서 가장 많이 쓰이고, 갇혔다고 느낄 때 사용자가 가장 먼저 시도하는 조작이다. DESIGN.md Do 항목("시스템 Back 제스처가 항상 동작하게 둔다")의 정면 위반이며, 이 목록에서 가장 싼 수정이다.
- **고치기:** 두 모달에 `onRequestClose={onClose}` 추가. `CalendarModal`의 `centeredView`를 `Pressable`로 감싸고 `modalView`에 전파 차단 — `SelectionModal.tsx:36-37`과 `NotificationModal.tsx:56-57`이 이미 올바르게 하고 있다.
- **명령:** `/impeccable harden`

### [P0] edge-to-edge가 강제되는 환경에서 인셋을 상수로 박았다

- **무엇:** `targetSdkVersion 36`에 투명 시스템 바 — edge-to-edge를 끌 수 없다. 그런데 보정이 전부 하드코딩이다. `Header.tsx:147`은 `paddingTop: normalize(38)`, `HomeScreen.view.tsx:156`은 **Android에서 no-op인** RN 내장 `SafeAreaView`, `AppStack.tsx:34-43`은 `height: 60` + `paddingBottom: 8` + `marginBottom: 6`을 탭바에 넣는다. `@react-navigation/bottom-tabs`는 숫자 `height`가 오면 인셋을 무시하고, 사용자 `tabBarStyle`을 라이브러리의 `paddingBottom: insets.bottom` **뒤에** 펼치므로 인셋이 덮인다.
- **왜 중요한가:** 3버튼 내비게이션(48dp 인셋)에서 탭 라벨이 시스템 바 아래로 들어가고, 제스처 내비게이션에서는 6dp 여백이 스와이프 영역에 걸린다. `normalize(38)`은 412dp 기기에서 약 45dp로 스케일되는데 이는 어떤 실제 상태바 높이와도 무관한 값이다. 같은 저장소의 다른 12개 화면은 `useSafeAreaInsets()`를 쓴다. 앱의 초기 탭만 예외다.
- **고치기:** RN `SafeAreaView`를 `View` + `react-native-safe-area-context`의 `useSafeAreaInsets()`로 교체(이미 의존성이며 내비게이터 안에 컨텍스트가 제공됨). `Header`의 `paddingTop`을 `insets.top + 8`로. `baseTabBarStyle`에서 `height`·`paddingBottom`·`marginBottom` 제거.
- **명령:** `/impeccable adapt`

### [P1] 스크롤 컨테이너가 없어 주 CTA가 화면 밖으로 밀릴 수 있다

- **무엇:** `styles.scrollContainer`(`HomeScreen.styles.ts:19-21`)는 이름만 남은 `{flex: 1}`이고, 적용 대상은 일반 `View`(`HomeScreen.view.tsx:167`)다. 이 화면에 `ScrollView`가 없다. 360dp·scale 1.0에서 콘텐츠 높이는 헤더 70 + 히어로 180 + 16 + 카드 410 + 하단 40 ≈ **716dp**인데, 360×640 기기의 가용 높이는 640 − 60(탭바) = **580dp**다.
- **왜 중요한가:** 화면이 작은 보급형 Android에서 "일정생성" — 이 화면이 존재하는 유일한 이유 — 가 뷰포트 밖에 렌더되고 도달할 방법이 없다. 실패 신호조차 없이 그냥 없다. 실기기 측정은 못 했으나 산술과 스크롤 컨테이너 부재는 확인된 사실이다.
- **고치기:** `HomeScreen.view.tsx:167`의 `View`를 `ScrollView` + `contentContainerStyle={styles.scrollContainer}` + `keyboardShouldPersistTaps="handled"`로. 히어로가 남는다면 고정 `normalize(180)` 대신 비율 높이로.
- **명령:** `/impeccable adapt`

### [P1] 이 화면은 읽히지도 조작되지도 않는다 — 접근성 0/30, 폰트 스케일 전역 차단, 터치 타깃 13개 미달, 대비 11쌍 미달

- **무엇:** 네 가지가 같은 뿌리다.
  - `accessibilityLabel|accessibilityRole|accessibilityState`가 대상 13개 파일에서 **0회**. 인터랙티브 요소 30개 전부 무표식. TalkBack은 각 `InputRow`를 역할 없는 텍스트 두 개로 읽는다. 아이콘 전용 버튼(닫기 5개, 월 이동 2개, 인원 스테퍼 2개, 알림 벨)은 레이블이 아예 없다. 선택 상태(칩·날짜·옵션)는 색으로만 전달된다.
  - `src/utils/fontScalingGuard.ts:20-30`이 JSX 런타임을 패치해 앱 전체 `Text`/`TextInput`에 `allowFontScaling: false`를 주입한다. Android 글꼴 크기 설정이 앱 어디에서도 동작하지 않는다. WCAG 1.4.4 정면 위반이며, DESIGN.md의 The sp Rule이 폭 기반 스케일이라 이를 대체하지 못한다.
  - 48dp 미만 터치 타깃 13개, `hitSlop` 0회. 최악은 **스타일 prop 자체가 없는 알림 벨 25dp**(`Header.tsx:97`)이고 배지는 응답 영역 **바깥**에 있다. 달력은 41.6dp 셀 42개가 간격 0으로 붙어 있어(320dp 기기에서 36.9dp) 오탭이 조용히 여행 기간을 바꾼다.
  - 대비 미달 11쌍. 플레이스홀더·필드 라벨 `#9CA3AF`/흰색 = **2.54:1**, 목적지 확인 문구 `#D1D5DB`/`#F3F4F6` = **1.34:1**(사용자에게 무엇을 하라고 알려주는 문장이 모달에서 가장 안 읽힌다), 타 월 날짜 ≈**1.2:1**인데 여전히 탭 가능, 히어로 흰 글씨는 밝은 사진에서 **2.10:1**까지 떨어지고 이를 막는 코드가 없다.
- **왜 중요한가:** PRODUCT.md와 DESIGN.md가 48dp·인셋·접근성 관행을 이미 약속했고, 인증 화면들은 그것을 지킨다(`accessibilityRole`/`accessibilityLabel` 83건이 전부 `src/features/auth` 아래). 첫 화면과 모든 공용 모달만 규율 밖이다. 여행 당일 이동 중 한 손 사용이라는 사용 장면에서 이건 부가 항목이 아니라 기본 조작성이다.
- **고치기:** 모든 `TouchableOpacity`에 `accessibilityRole="button"` + 라벨과 현재 값을 합친 `accessibilityLabel`("여행지, 현재 제주"), 선택형 컨트롤에 `accessibilityState={{selected}}`, CTA에 `{{disabled}}`, 벨에 `알림 N건`. 전역 폰트 스케일 차단을 컴포넌트별 `maxFontSizeMultiplier`(1.3~1.5)로 교체. 벨과 닫기 버튼에 `hitSlop` 12, 칩 `paddingVertical` 12 + `gap` 8, `dayCell` `minHeight: 48`, 알림 수락/거절 `minHeight: 48`. 라벨을 `#4B5563`(7.0:1)로, 미완성 CTA는 회색 비활성화 대신 DESIGN.md대로 0.55 불투명도 + 이유 안내.
- **명령:** `/impeccable audit` → `/impeccable harden`

### [P1] 제품의 차별점이 첫 화면에 없고, 기본값이 잘못된 계획을 만들어 낸다

- **무엇:** `HomeScreen.tsx:61-67`이 `startDate = endDate = 오늘`, `adults = 1`, `children = 0`, `transport = '대중교통'`으로 초기화한다. 따라서 `isFormValid`(`:204-209`)는 사실상 "목적지가 비어 있지 않음"으로 축소되고, 사용자가 화면을 읽기도 전에 3개 행이 자신 있는 답처럼 채워져 있다. 기본값의 정체는 **당일치기·1인·대중교통** 여행이다. 동시에 생성 흐름 어디에도 동행자가 없다. 기간 상한도 없어 `:261-268`이 날짜마다 타임테이블을 POST하므로 2027년을 오탭하면 수백 개 행이 조용히 생성된다.
- **왜 중요한가:** PRODUCT.md의 1차 사용자는 친구·연인 2~5인이다. 첫 사용자는 목적지만 고르고 파란 버튼을 눌러 1인 당일 계획을 만든 뒤, 다른 사람들이 이미 보고 있는 협업 편집기 안에서 그것을 수습해야 한다. 제품이 막아야 한다고 적어 둔 바로 그 상태다.
- **고치기:** 날짜·인원 기본값을 null로 돌려 행이 미응답 플레이스홀더로 읽히게 하고 `isFormValid`가 실제로 게이트하게 한다. `CalendarModal.onDayPress`(`:111-126`)에 `minDate = today`와 최대 기간 가드. "인원"을 "함께 갈 사람"으로 바꿔 생성 시점에 초대를 받는다 — 제품의 실제 메커니즘이 자기 현관에 나타난다.
- **명령:** `/impeccable shape` (인원 → 함께 갈 사람 재설계) → `/impeccable clarify`

## Persona Red Flags

**Casey (한 손·이동 중·자주 중단됨)**
- **알림 벨이 초대로 가는 유일한 경로인데, 동시에 화면에서 가장 닿기 어렵고(우상단) 가장 작다(25dp, 스타일 prop 없음, hitSlop 없음).** 돌아온 협업자가 앱을 여는 이유가 엄지가 갈 수 없는 곳에 있다.
- **상태 보존이 전무하다.** 폼 상태 8개가 전부 컨테이너의 `useState`(`HomeScreen.tsx:61-84`)다. 목적지 모달을 연 채 전화가 오거나 프로세스가 죽으면 전부 사라지고, 다시 오늘~오늘/성인 1명이 친절하게 채워져 있다.
- **생성 로더에서 빠져나올 수 없다.** `:46-51`이 `hardwareBackPress`에 `true`를 반환하고, `:53-59`가 `beforeRemove`를 `preventDefault`하며, `:367-374` 모달은 `transparent={false}`에 `onRequestClose={() => {}}`다. 약한 연결에서 요청이 멈추면 취소도 타임아웃도 진행률도 없다.
- **"거절"이 34dp 한 번의 탭으로 되돌릴 수 없다.** `NotificationModal.tsx:84-89`는 확인 없이 `onReject`를 쏘고, 컨테이너 주석(`HomeScreen.tsx:114-119`)이 서버가 요청 결과를 보관하지 않는다고 적고 있다.
- 히어로 `setInterval`(`HomeScreen.view.tsx:148-153`)이 세션 내내 5초마다 리렌더하며, 일시정지도 사용자 제어도 없다.

**Jordan (첫 사용자)**
- **"일정생성"이 무엇을 하는지 화면 어디에도 없다.** 부제도, 첫 실행 힌트도, 친구를 나중에 초대할 수 있다는 안내도 없다. 예약 검색 폼으로 읽고 검색 결과를 기대한다.
- **네 개 중 세 개가 이미 채워져 있어** "누가 이미 맞게 설정해 둔 것"으로 읽힌다.
- **달력의 "확인"이 날짜 미선택 시 조용히 아무 일도 하지 않는다.** `handleConfirm`(`CalendarModal.tsx:128-134`)에 else 분기가 없고 비활성 스타일도 메시지도 없다. 살아 있어 보이는 죽은 컨트롤이다.
- **무엇을 하라는 안내가 모달에서 가장 안 읽히는 텍스트다** — "여행지를 선택해주세요" 1.34:1.
- **자기가 만들 수도, 해석할 수도 없는 오류**: "여행지가 올바르게 선택되지 않았습니다"(`HomeScreen.tsx:237-243`)는 서버 ID 매핑 실패로 발생한다.
- 인접 월의 흐린 날짜를 탭하면 선택되지만(`CalendarModal.tsx:250-255`) 달이 넘어가지 않아 선택이 보이지 않는 곳에 남는다.

**Sam (접근성 의존)**
- **접근성 속성 0/30.** TalkBack에서 `InputRow`는 역할 없는 텍스트 두 개, 아이콘 버튼 10개는 이름 없는 버튼이다.
- **시스템 글꼴 크기 설정이 앱 전체에서 무효**(`fontScalingGuard.ts:20-30`). 다른 항목과 달리 이것은 의도적이고 문서화된 결정이다.
- **측정된 대비 미달 4건**: 필드 라벨/플레이스홀더 2.54:1, 비활성 CTA 텍스트 2.05:1, 목적지 확인 문구 1.34:1, 타 월 날짜 ≈1.2:1(그런데 탭 가능).
- **스위치/키보드 접근**: 달력이 레이블 없는 셀 42개를 개별 포커스 대상으로 노출한다. 월/연도 그룹핑도, 날짜를 알려주는 레이블도 없어 "숫자" 42번을 지난다. 벨의 배지 숫자는 버튼과 연결되지 않은 별도 `View`라 0→3 변화가 아무것도 알리지 않는다.
- 알림 목록은 가상화되지 않은 `ScrollView`(`NotificationModal.tsx:70`)에 개수 안내가 없다.

## Minor Observations

- **죽은 코드가 살아 있는 헤더를 복제한다.** `HomeScreen.styles.ts:23-67`(`topBar`, `logo`, `topIcons`, `headerIconBtn`, `userAvatar`, `userNickname`)과 `:169`(`labelError`)는 참조 0. `Header.tsx`가 헤더를 가져간 뒤 남은 사본이고, 상태바 보정값이 서로 다르다(죽은 48dp vs 살아 있는 38dp). detector가 잡은 `#0047FF` 1건도 여기다.
- **`scrollContainer`라는 이름이 `View`에 붙어 있어** 스크롤 부재 버그가 눈에 띄지 않는다.
- **한 화면에 파랑 9종**: `#0047FF`(워드마크·CTA), `#1344FF`(토큰, 모달 확인 버튼), `#2563EB`(토요일), `#3B82F6`(비행기 — DESIGN.md의 category-dining 색), `#1E3A8A`, `#E8EDFF`, `#E0E7FF`, `#F0F4FF`, `#F5F7FF`. 홈 카드에서 달력을 열면 서로 다른 "브랜드 블루" 두 개가 동시에 보인다. 일요일은 토큰 error가 아니라 `#EF4444`.
- **The Flat Rule 위반 4건**: `HomeScreen.styles.ts:110`(5), `SearchLocationModal.styles.ts:52`(20), `CalendarModal.styles.ts:48`(8), `Header.tsx:227`(5). 같은 카드에서 열리는 모달 4개가 서로 다른 z 깊이에 있고, 그중 하나는 Android 다이얼로그 표준(24 상한)에 근접한 20이다.
- **The Four Weights Rule 위반 3건**: `fontWeight: '800'`이 `HomeScreen.styles.ts:37,88`과 `Header.tsx:158`에. 800 에셋이 번들되지 않아 Android가 기기별로 합성한다. `Header.tsx:213` 배지 텍스트는 `fontFamily` 자체가 없어 헤더에서 유일하게 Roboto로 렌더된다.
- **정본 주 버튼이 이미 있는데 쓰이지 않는다.** `AuthSubmitButton.tsx`는 DESIGN.md 사양 그대로다(RADIUS.md, 52dp, TYPO.button, 스프링 프레스, 로딩 크로스페이드, muted-not-disabled, 접근성 속성). 홈 CTA는 이를 radius 8·높이 50·`#0047FF`·Bold·회색 비활성화·프레스 애니메이션 없음·접근성 없음으로 재구현했다.
- **`normalize()` 구현이 4벌.** `design/scale.ts`는 0.95~1.2로 클램프하는데, 모달 4개는 각자 **클램프 없이** `size * (width/360)`을 재정의했다. 800dp 기기에서 홈 카드는 1.2배, 그 카드가 여는 모달은 2.22배 — **85% 괴리**. 두 스케일러 모두 모듈 로드 시점에 `Dimensions.get('window')`를 읽으므로 회전·폴딩에 반응하지 않는다.
- **radius 드리프트**: 카드 12, CTA 8, 모달 20, 옵션 카드 16, 확인 버튼 12와 14. `tokens.ts`의 `RADIUS`를 임포트하는 파일은 하나도 없다.
- **목적지 선택기에 죽은 의도**: `searchContainer`/`searchInput`/`clearButton`과 최근 검색 태그 스타일 20개가 완성돼 있으나 렌더되지 않는다. 이름이 "Search"인 모달에 `TextInput`이 하나도 없고 칩 28개만 있다.
- **NotificationModal만 스케일러를 전혀 쓰지 않는다** — 5개 fontSize와 모든 치수가 raw 숫자다. 360dp에서만 맞다.
- **비어 있는 알림 경로가 두 개인데 서로 모순된다**: `HomeScreen.tsx:196-202`가 벨 탭을 가로채 경고를 띄우므로 `NotificationModal.tsx:65-68`의 빈 상태는 이 화면에서 도달 불가능하다.
- **문구 불일치**: 버튼은 "일정생성", 탭은 "일정 생성".
- **`Theme.AppCompat.DayNight`**가 `styles.xml`에 남아 있어 라이트 고정 약속과 충돌한다 — 네이티브 다이얼로그와 텍스트 선택 UI가 시스템 다크 설정을 따른다.
- **히어로에 로딩 플레이스홀더·에러 폴백·`onError`가 없다.** 오프라인 첫 실행 시 첫 화면 상단 180dp가 `#E5E7EB` 위 흰 글씨(1.24:1)가 된다. `w=800`은 400dp 이상 기기에 부족하고, 5초 인터벌은 모달이 화면을 덮고 있을 때도 계속 돈다.
- **감정 정점이 어긋나 있다.** 이 화면의 끝인 `AirplaneLoading`은 앱에서 가장 공들인 에셋(커스텀 SVG 비행기, 속도가 다른 구름 5개 레이어, 독립 시퀀스 3개)인데, 문구는 생성인데 "불러오는 중", 브랜드는 약속된 "planMate"가 아니라 "PlanMate", 두 텍스트 스타일 모두 `fontFamily` 없이 `fontWeight`만 지정해 앱 유일의 딜라이트 순간이 Pretendard가 아닌 Roboto로 렌더된다. 그리고 `ItineraryEditor`가 `animation: 'none'`이라 하드컷으로 끝난다.

## Questions to Consider

1. **히어로 180dp가 5초마다 도는 Unsplash 사진이고, DESIGN.md는 "무드 사진 위의 큰 글씨"를 이 시스템이 거부하는 것으로 이름 지어 두었다. 그 180dp가 대신 "진행 중인 일정 2개"와 지금 친구들이 편집 중인 계획을 보여준다면, 사진을 그리워할 사용자가 한 명이라도 있을까 — 그리고 제품의 실제 차별점이 마침내 자기 현관에 보이지 않을까?**

2. **폼은 "성인 1명 / 어린이(만 17세 이하)"라는 호텔 예약 분류를 묻는다. 정의된 사용자는 친구·연인 2~5인이다. "인원"을 "함께 갈 사람"으로 바꾸고 초대가 일정이 만들어지기 *전에* 여기서 일어난다면, 이 화면은 무엇이 되는가?**

3. **네 행이 사용자가 손대기 전에 이미 답해져 있다 — 오늘~오늘, 성인 1명, 대중교통. 이 기본값들은 탭을 아껴 주는가, 아니면 다른 세 사람이 지켜보는 협업 편집기 안에서 누군가 수습해야 할 잘못된 계획을 제조하는가?**
