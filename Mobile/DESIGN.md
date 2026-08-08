---
name: planMate
description: 친구들이 하나의 여행 일정을 동시에 짜는 Android 앱의 디자인 시스템
colors:
  departure-blue: "#1344FF"
  departure-blue-pressed: "#0F36D6"
  departure-blue-tint: "#E8EDFF"
  on-primary: "#FFFFFF"
  paper: "#FFFFFF"
  paper-recessed: "#F9FAFB"
  ink: "#111827"
  ink-label: "#4B5563"
  ink-muted: "#6B7280"
  ink-faint: "#9CA3AF"
  rule: "#E5E7EB"
  rule-strong: "#D1D5DB"
  rule-faint: "#F3F4F6"
  error: "#D92D20"
  error-border: "#F04438"
  success: "#067647"
  scrim: "rgba(16,20,27,0.45)"
  category-attraction: "#84CC16"
  category-attraction-bg: "#F7FEE7"
  category-lodging: "#F97316"
  category-lodging-bg: "#FFF7ED"
  category-dining: "#3B82F6"
  category-dining-bg: "#EFF6FF"
  category-custom: "#8B5CF6"
  category-custom-bg: "#F5F3FF"
  category-other: "#6B7280"
  category-other-bg: "#F9FAFB"
typography:
  display:
    fontFamily: "Pretendard-Bold"
    fontSize: "28sp"
    lineHeight: "36sp"
    letterSpacing: "-0.56"
  title:
    fontFamily: "Pretendard-Bold"
    fontSize: "22sp"
    lineHeight: "30sp"
    letterSpacing: "-0.4"
  headline:
    fontFamily: "Pretendard-SemiBold"
    fontSize: "18sp"
    lineHeight: "26sp"
    letterSpacing: "-0.22"
  bodyLg:
    fontFamily: "Pretendard-Regular"
    fontSize: "16sp"
    lineHeight: "24sp"
    letterSpacing: "0"
  body:
    fontFamily: "Pretendard-Regular"
    fontSize: "14sp"
    lineHeight: "22sp"
    letterSpacing: "0"
  label:
    fontFamily: "Pretendard-Medium"
    fontSize: "13sp"
    lineHeight: "18sp"
    letterSpacing: "0"
  caption:
    fontFamily: "Pretendard-Medium"
    fontSize: "12sp"
    lineHeight: "16sp"
    letterSpacing: "0.24"
  button:
    fontFamily: "Pretendard-SemiBold"
    fontSize: "16sp"
    lineHeight: "24sp"
    letterSpacing: "0"
rounded:
  xs: "6dp"
  sm: "10dp"
  md: "14dp"
  lg: "20dp"
  xl: "26dp"
  full: "9999dp"
spacing:
  xs: "4dp"
  s: "8dp"
  m: "16dp"
  l: "24dp"
  xl: "32dp"
  xxl: "40dp"
  section: "48dp"
components:
  button-primary:
    backgroundColor: "{colors.departure-blue}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: "52dp"
    width: "100%"
  button-primary-pressed:
    backgroundColor: "{colors.departure-blue-pressed}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: "52dp"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.departure-blue}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: "52dp"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.bodyLg}"
    rounded: "{rounded.md}"
    padding: "0 16dp"
    height: "52dp"
  chip-unselected:
    backgroundColor: "{colors.rule-faint}"
    textColor: "{colors.ink-label}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: "10dp 14dp"
  chip-selected:
    backgroundColor: "{colors.departure-blue}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: "10dp 14dp"
  card-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "16dp"
  timeline-place-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "4dp"
    padding: "16dp"
  nav-bar-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-faint}"
    typography: "{typography.caption}"
    height: "60dp"
  fab:
    backgroundColor: "{colors.departure-blue}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: "60dp"
---

# Design System: planMate

## Overview

**Creative North Star: "공유 작업판 (The Shared Worktable)"**

planMate는 여러 사람의 손이 동시에 올라오는 하나의 판이다. 화면은 자기를 주장하지 않고, 지금 판 위에 무엇이 놓였고 누가 그것을 만지고 있는지를 오차 없이 비춘다. 시각적 무게는 전부 내용물 — 장소 카드, 시간, 참여자 — 에 실리고, 인터페이스는 그 사이를 가르는 선으로만 존재한다.

밀도는 중간에서 높은 쪽이다. 여행 당일 이동 중에 한 손으로 훑는 화면이므로 정보는 촘촘하되, 구획은 명확한 1dp 경계선으로 끊는다. 종이 흰색 바탕 위에 회색 눈금선이 구조를 만들고, 채도 높은 색은 오직 둘 — 출발 신호 블루 하나와 장소 카테고리 5색 — 뿐이다. 이 절제가 있기 때문에 파란 버튼 하나가 화면에서 즉시 "다음 행동"으로 읽힌다.

거부하는 것: 그라디언트 표면, 장식용 그림자, 무드 사진 위의 큰 글씨, 아이콘의 화려한 색채. planMate는 감성 여행 앱이 아니라 여러 명이 실수 없이 합의를 만드는 도구다.

**Key Characteristics:**
- 흰 종이와 회색 눈금선으로 만든 구조. 깊이는 그림자가 아니라 선과 면 색으로 낸다.
- 채도 높은 색은 액센트 1개와 카테고리 5색으로 고정. 그 외 전부 무채색.
- Pretendard 단일 서체. 크기·굵기·자간만으로 위계를 만든다.
- 큰 제목에는 음수 자간(-0.56 ~ -0.22), 작은 라벨에는 양수 자간(+0.24).
- 모든 터치 타깃 48dp. 여백은 기기 인셋 값 위에 쌓고 고정하지 않는다.
- 누름은 반드시 눈에 보인다. 90ms 축소와 색 전환, 스프링으로 복귀.

## Colors

무채색 8단계 위에 채도 높은 파랑 하나와 카테고리 5색만 얹은, 의도적으로 좁은 팔레트다.

### Primary
- **출발 신호 블루 (Departure Blue)** (`{colors.departure-blue}`): 주 버튼, 선택된 칩, 활성 탭, FAB, 로고. 화면당 한 덩어리를 넘지 않는 것이 원칙이다. 이 색이 있는 곳이 곧 다음으로 가는 길이다.
- **눌린 블루** (`{colors.departure-blue-pressed}`): 주 버튼의 눌림 상태 배경. 색 전환은 즉시가 아니라 90ms 타이밍으로 들어간다.
- **블루 틴트** (`{colors.departure-blue-tint}`): 선택 상태의 배경, 정보 배지. 글자가 아닌 면에만 쓴다.

### Neutral
- **잉크 (Ink)** (`{colors.ink}`): 본문과 제목의 기본 글자색.
- **잉크 라벨** (`{colors.ink-label}`): 필드 라벨, 칩의 비선택 글자.
- **잉크 뮤트** (`{colors.ink-muted}`): 보조 설명, 메타 정보.
- **잉크 페인트** (`{colors.ink-faint}`): 플레이스홀더, 비활성 아이콘, 비활성 탭.
- **눈금선 (Rule)** (`{colors.rule}`): 기본 경계선. 이 시스템에서 구조를 만드는 유일한 수단이다.
- **강한 눈금선** (`{colors.rule-strong}`): 입력 필드처럼 더 붙잡아야 하는 경계.
- **옅은 눈금선** (`{colors.rule-faint}`): 목록 구분선, 비선택 칩 배경.
- **종이 (Paper)** (`{colors.paper}`) / **눌린 종이** (`{colors.paper-recessed}`): 기본 배경과 한 단 낮은 면.
- **스크림** (`{colors.scrim}`): 모달 뒤 어둠.

### Tertiary — 장소 카테고리
장소 블록을 종류별로 구분하는 유일한 다색 체계다. 각 카테고리는 테두리색과 배경색을 짝으로 가진다.

- **관광지** (`{colors.category-attraction}` / `{colors.category-attraction-bg}`)
- **숙소** (`{colors.category-lodging}` / `{colors.category-lodging-bg}`)
- **식당** (`{colors.category-dining}` / `{colors.category-dining-bg}`)
- **직접 추가** (`{colors.category-custom}` / `{colors.category-custom-bg}`)
- **검색·기타** (`{colors.category-other}` / `{colors.category-other-bg}`)

### Semantic
- **에러** (`{colors.error}`), 에러 테두리 (`{colors.error-border}`), **성공** (`{colors.success}`).

### Named Rules

**The One Blue Rule.** 출발 신호 블루는 화면 안에서 하나의 행동만 가리킨다. 주 버튼 옆에 파란 링크를 두거나 파란 아이콘을 흩뿌리면 이 규칙이 깨진다. 두 번째 강조가 필요하면 색이 아니라 굵기나 위치로 만든다.

**The No New Hex Rule.** 새 화면에서 새 hex를 만들지 않는다. 필요한 색이 없다면 새 색이 필요한 것이 아니라 위계 판단이 틀린 것이다. 현재 코드베이스는 이 규칙을 어긴 상태이며(`#0047FF`, `#2563EB`, `#1A73E8`, `#E11D48` 등) 정리 대상이다.

**The Category Border Rule.** 카테고리 색은 카드의 왼쪽 4dp 테두리와 옅은 배경으로만 나타난다. 글자색이나 아이콘 색으로 카테고리를 표현하지 않는다.

## Typography

**단일 서체:** Pretendard (Regular / Medium / SemiBold / Bold, 번들 OTF)

**Character:** 한글 화면비에 맞춰 설계된 중립 산세리프다. 장식이 전혀 없기 때문에 위계는 오로지 크기·굵기·자간으로만 만들어진다. 큰 글씨일수록 자간을 좁혀(-0.56 ~ -0.22) 덩어리로 읽히게 하고, 12sp 캡션에서는 자간을 벌려(+0.24) 흩어지지 않게 잡는다.

### Hierarchy
- **Display** (`{typography.display}`): 인증 화면 제목, 히어로 문구. 화면당 1회.
- **Title** (`{typography.title}`): 화면 제목, 모달 제목.
- **Headline** (`{typography.headline}`): 섹션 제목, 카드 헤더.
- **Body Large** (`{typography.bodyLg}`): 입력 필드 값, 본문 강조.
- **Body** (`{typography.body}`): 기본 본문, 목록 내용.
- **Label** (`{typography.label}`): 필드 라벨, 칩.
- **Caption** (`{typography.caption}`): 메타 정보, 탭 라벨, 타임스탬프.
- **Button** (`{typography.button}`): 버튼 라벨 전용.

### Named Rules

**The sp Rule.** 모든 글자 크기는 `sp()`(= `sf()`)를 거친다. 360dp 기준 폭에 대해 0.95~1.2로 클램프된 스케일이며, 화면마다 숫자를 손으로 고르지 않는다.

**The Four Weights Rule.** Pretendard 4종 외의 굵기를 요구하지 않는다. `fontWeight: '800'` 같은 지정은 번들된 Bold로 폴백되어 기기마다 다르게 렌더된다. 굵기는 `fontFamily`로만 지정한다.

## Layout

세로 스크롤 단일 컬럼이 기본이다. 화면 폭 전체를 쓰되 내용에는 좌우 16dp(밀도 높은 목록) 또는 24dp(인증·폼 화면) 여백을 준다.

- **간격 리듬:** 4 / 8 / 16 / 24 / 32 / 40 / 48dp. 16dp가 기본 단위이고 섹션 사이는 24dp 이상 벌린다.
- **반응형:** 폭 기반 스케일 하나로 처리한다(`src/design/scale.ts`, 기준 360dp, 0.95~1.2 클램프). 브레이크포인트는 없다.
- **시스템 인셋:** 상·하단 여백은 `useSafeAreaInsets()`에서 가져온다. 상단바 높이를 상수로 박으면 기기별로 어긋난다.
- **하단 내비게이션:** 3개 목적지(피드 / 일정 생성 / 커뮤니티), 높이 60dp, 상단 1dp 경계선.
- **밀도:** 목록 항목 세로 패딩 12~16dp, 카드 사이 간격 12dp.

### Named Rules

**The Inset Rule.** 하단 여백은 `insets.bottom + 16dp`처럼 기기가 알려 주는 값 위에 쌓는다. 고정값은 제스처 바에 깔린다.

## Elevation & Depth

**이 시스템은 그림자를 쓰지 않는다.** 깊이는 세 가지로만 표현한다. 1dp 경계선, 면 색의 단차(`{colors.paper}` ↔ `{colors.paper-recessed}` ↔ `{colors.rule-faint}`), 그리고 겹치는 층 뒤의 스크림이다. `theme.ts`의 `shadows.none`이 그림자에 대한 유일한 공식 값이다.

> **현재 상태와의 차이:** 코드베이스에는 `elevation` 지정이 38곳, `shadowOpacity`가 32곳 남아 있다(홈 화면 카드 `elevation: 5`, 커뮤니티 포스트 카드 `elevation: 1`, 바텀시트 `elevation: 20` 등). 이는 시스템 규범이 아니라 정리 대상이다. 새로 만드는 화면에는 넣지 않는다.

### Named Rules

**The Flat Rule.** 새 코드에 `elevation`, `shadowColor`, `shadowOpacity`, `shadowRadius`를 쓰지 않는다. 떠 보이게 하고 싶다면 경계선을 주거나 배경 면 색을 한 단 바꾼다.

**The Scrim Rule.** 화면 위에 겹치는 층(모달, 바텀시트, 메뉴)은 그림자가 아니라 스크림으로 분리된다. 스크림이 있으면 그림자는 필요 없다.

## Shapes

모서리는 크기에 비례해 커진다. 작을수록 각지고 클수록 둥글다.

- **4dp:** 타임라인 장소 카드. 왼쪽 4dp 카테고리 테두리와 짝을 이루는 거의 각진 형태다.
- **`{rounded.xs}` (6dp):** 칩, 배지, 작은 아이콘 버튼.
- **`{rounded.sm}` (10dp):** 목록 카드, 컨테이너.
- **`{rounded.md}` (14dp):** 입력 필드, 주 버튼. 이 시스템에서 가장 많이 쓰이는 값이다.
- **`{rounded.lg}` (20dp) / `{rounded.xl}` (26dp):** 모달, 바텀시트 상단.
- **`{rounded.full}`:** 아바타, FAB, 원형 배지.

**테두리 굵기:** 기본 1dp. 입력 필드는 1.5dp로 고정하고 포커스 시에도 굵기를 바꾸지 않는다. 굵기가 변하면 박스 크기가 함께 변해 입력 중 글자가 흔들린다. 4dp는 카테고리 테두리(왼쪽 한 변) 전용이다.

### Named Rules

**The Constant Stroke Rule.** 상태 변화는 테두리 색으로 알린다. 굵기는 바꾸지 않는다.

## Components

### Buttons

주 버튼은 확신에 차 있고 반응이 분명하다. 누르면 즉시 줄고 색이 진해지며, 떼면 살짝 튀며 돌아온다.

- **Shape:** 넉넉히 둥근 사각형(`{rounded.md}` = 14dp), 높이 52dp, 폭 100%.
- **Primary:** 출발 신호 블루 배경과 흰 글자, Button 타이포.
- **Pressed:** 배경이 `{colors.departure-blue-pressed}`로 90ms(`Easing.out(quad)`) 전환되며 동시에 0.985배 축소. 복귀는 스프링(damping 14, stiffness 260, mass 0.5).
- **Muted (아직 진행 불가):** 비활성화하지 않는다. 불투명도를 0.55로 낮추기만 하고, 눌리면 무엇이 모자란지 알린다. 회색으로 죽이면 이유를 알려줄 기회가 사라진다.
- **Loading:** 라벨과 스피너를 같은 자리에서 180ms 교차 페이드. 버튼 크기는 변하지 않는다.
- **Outline / Ghost:** 투명 배경에 블루 글자. Outline은 1dp 블루 테두리를 더한다.

### Inputs / Fields

- **Style:** 흰 배경, 1.5dp `{colors.rule}` 테두리, `{rounded.md}`, 최소 높이 52dp, 좌우 16dp 패딩.
- **Focus:** 테두리 색만 바뀐다(굵기 고정).
- **Error:** 테두리 `{colors.error-border}`, 메시지 `{colors.error}`.
- **아이콘 버튼(비밀번호 보기 등):** 아이콘 크기와 무관하게 48×48dp를 채운다.

### Chips

선호 테마와 필터 선택에 쓰인다.

- **Unselected:** `{colors.rule-faint}` 배경, `{colors.ink-label}` 글자, 1dp `{colors.rule}` 테두리.
- **Selected:** 출발 신호 블루 배경과 흰 글자. 테두리도 같은 블루로 채워 경계가 사라지게 한다.
- **Shape:** `{rounded.xs}`, 패딩 10dp × 14dp, 칩 사이 간격 10dp.

### Cards / Containers

- **Corner:** `{rounded.sm}`(10~12dp).
- **Background:** `{colors.paper}`.
- **Border:** 1dp `{colors.rule}`. 이것이 카드를 카드로 만드는 유일한 장치다.
- **Shadow:** 없음(Elevation & Depth 참조).
- **Padding:** 16dp, 카드 사이 간격 12dp.

### Navigation

- **하단 바:** 흰 배경, 상단 1dp `{colors.rule}` 경계선, 높이 60dp, 아이콘 아래 라벨.
- **활성/비활성:** 아이콘과 라벨이 함께 `{colors.departure-blue}` ↔ `{colors.ink-faint}`로 바뀐다. 배경 강조나 인디케이터 바는 쓰지 않는다.
- **라벨:** Pretendard SemiBold 11sp.
- **아이콘:** lucide-react-native, strokeWidth 1.8.
- **화면 전환:** `slide_from_right`, 250ms. 일정 편집·조회 화면만 `animation: 'none'`으로 즉시 전환한다. 실시간 편집 화면에서 전환 애니메이션은 지연으로 읽힌다.

### FAB

- 우하단 고정(bottom 30dp, right 20dp), 60×60dp 원형, 출발 신호 블루.
- 화면당 하나, 주 행동 하나에만 쓴다. 보조 행동에 FAB를 쓰지 않는다.

### 타임라인 장소 카드 (Signature Component)

이 앱의 정체성을 가장 강하게 드러내는 컴포넌트다.

- 흰 카드, 모서리 4dp, 패딩 16dp, 왼쪽 4dp 카테고리 색 테두리.
- 배경은 카테고리의 옅은 배경색, 제목과 메타 텍스트는 같은 카테고리 계열의 짙은 색.
- 나머지 세 변에는 테두리가 없다. 왼쪽 한 줄만으로 종류를 알린다.
- 시간·이동수단 메타는 12sp Regular, 액션 아이콘은 28dp에 간격 8dp로 오른쪽 정렬.

## Do's and Don'ts

### Do:
- **Do** 모든 색을 `src/design/tokens.ts`에서 가져온다. 화면 파일 상단에 `const COLORS = { ... }`를 새로 만들지 않는다.
- **Do** 글자 크기는 `sp()`, 여백과 치수는 `sf()`를 거친다.
- **Do** 깊이가 필요하면 1dp 경계선이나 면 색 단차를 쓴다(**The Flat Rule**).
- **Do** 모든 터치 타깃을 48dp 이상으로 채우고 인접 타깃 사이에 8dp를 둔다.
- **Do** 상·하단 여백을 `useSafeAreaInsets()` 값 위에 쌓는다(**The Inset Rule**).
- **Do** 카테고리를 왼쪽 4dp 테두리와 옅은 배경으로만 표현한다(**The Category Border Rule**).
- **Do** 누름에 시각 반응을 준다. 90ms 축소와 색 전환, 스프링 복귀.
- **Do** 시스템 Back 제스처가 항상 동작하게 둔다.

### Don't:
- **Don't** `elevation` / `shadowColor` / `shadowOpacity` / `shadowRadius`를 쓴다.
- **Don't** 새 hex 값을 만든다. `#0047FF`, `#2563EB`, `#1A73E8`는 기존 위반 사례이며 `{colors.departure-blue}`로 수렴시킨다(**The No New Hex Rule**).
- **Don't** 화면 하나에 파란 강조를 두 군데 이상 둔다(**The One Blue Rule**).
- **Don't** `fontWeight: '800'`처럼 번들되지 않은 굵기를 지정한다(**The Four Weights Rule**).
- **Don't** 포커스나 상태 변화에 테두리 굵기를 바꾼다(**The Constant Stroke Rule**).
- **Don't** 그라디언트를 표면이나 글자에 쓴다. `react-native-linear-gradient`는 이미지 위 가독성 오버레이 용도로만 쓴다.
- **Don't** 진행 불가 상태의 주 버튼을 회색으로 비활성화한다. 흐리게 두고 이유를 알린다.
- **Don't** 다크 테마 변형을 만든다. 이 제품은 라이트 테마 고정이다.
- **Don't** iOS 컨트롤(Cupertino 스위치·다이얼로그)이나 iOS 전용 관용구를 이식한다.
