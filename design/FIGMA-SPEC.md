# planMate 디자인 시스템 — Figma 빌드 스펙

> 대상 플랫폼: **Android / Galaxy 전용** (One UI + Material 3 + WCAG 2.2 AA)
> 기준 기기: **Galaxy S24 — 384 × 832 dp**
> 근거: UI/UX 진단 Step 0–3 (심각도 4 = 13건, 심각도 3 = 36건)

이 문서는 Figma에서 시안을 만들 때 필요한 **모든 수치와 규칙**입니다. 값은 `planmate-tokens.json`이 원본이고, 이 문서는 그 값을 어디에 어떻게 쓰는지를 정의합니다.

---

## 0. 시작하기

### 0-1. 토큰 임포트

**Tokens Studio for Figma** (권장 — 라이트/다크 모드가 그대로 넘어옴)

1. 플러그인 실행 → `Tools` → `Load from file/folder`
2. `planmate-tokens.json` 선택
3. 좌측 토큰 세트에 `global` / `light` / `dark` 3개가 보이면 성공
4. `Themes` 탭 → `Light`, `Mode` 그룹 확인 → **Export to Figma** → `Variables` 선택
5. 컬렉션 이름 `Semantic`, 모드 `Light` / `Dark` 로 생성됨

**대안** — Figma 기본 Variables만 쓰고 싶다면 `Variables Import Export` 플러그인으로 같은 JSON을 넣고, 아래 §1의 컬렉션 구조를 수동으로 맞춥니다.

### 0-2. 폰트

**Pretendard** 를 로컬에 설치한 뒤 Figma를 재시작합니다.
Regular / Medium / SemiBold / Bold **4종만** 사용합니다.

> 앱 번들에는 `Pretendard-Regular.otf` 등 정적 4종을 넣습니다. 현재 코드에 있는 `Pretendard Variable` 단일 파일 + `fontWeight` 조합은 RN 0.81 Android에서 굵기 축 제어가 불안정합니다. `Inter_*` 5종은 **한글 글리프가 없어** 시스템 서체로 폴백되던 원인이므로 번들에서 제거합니다.

---

## 1. Variables 컬렉션

세 개로 나눕니다. 화면과 컴포넌트는 **`Semantic`만 참조**하고 `Primitives`를 직접 쓰지 않습니다.

### `Primitives` — 모드 없음

| 그룹 | 개수 | 내용 |
|---|---|---|
| `blue/50…900` | 10 | 브랜드 램프 (hue 228 고정) |
| `gray/0…950` | 12 | 중립 |
| `red`, `green`, `amber` | 각 3–5 | 시맨틱 원색 |

### `Semantic` — 모드 2개 (**Light** / **Dark**)

화면에서 쓰는 유일한 색상 컬렉션입니다.

| 변수 | Light | Dark |
|---|---|---|
| `bg` | `gray/0` | `gray/950` |
| `surface` | `gray/50` | `#151A23` |
| `surfaceRaised` | `gray/0` | `#1D232E` |
| `border` | `gray/200` | `#2A313D` |
| `borderStrong` | `gray/300` | `#3A424F` |
| `text` | `gray/900` | `#E4E7EC` |
| `textSecondary` | `gray/500` | `gray/400` |
| `textDisabled` | `gray/400` | `gray/500` |
| `primary` | `blue/500` | `blue/300` |
| `primaryPressed` | `blue/600` | `blue/400` |
| `onPrimary` | `gray/0` | `blue/900` |
| `primaryContainer` | `blue/50` | `blue/800` |
| `error` / `errorBorder` / `errorBg` | `#D92D20` / `#F04438` / `#FEF3F2` | `#F97066` / `#F97066` / `#2C1512` |
| `success` / `successBg` | `#067647` / `#ECFDF3` | `#32D583` / `#0C2E1D` |
| `warning` / `warningBg` | `#B54708` / `#FFFAEB` | `#FDB022` / `#33230A` |
| `scrim` | `rgba(16,20,27,.45)` | `rgba(0,0,0,.60)` |
| `category/{sight,lodging,food,cafe,etc}/{accent,bg,text}` | 15개 | 15개 |

**다크 본문이 순백이 아닌 이유** — `#FFFFFF`는 다크 배경 대비 17.5:1로 과도해 야간에 글자가 번져 보입니다(헤일레이션). `#E4E7EC`는 15.1:1로 충분히 높으면서 눈이 편합니다.

### `Dimensions` — 모드 없음

`space/1…9`, `radius/xs…full`, `border/hairline·focus·selected`, `size/*` 전체.

---

## 2. Text Styles

**7개.** 이 목록에 없는 크기는 만들지 않습니다.

| 스타일 이름 | Size / Line | Weight | Tracking | 용도 |
|---|---|---|---|---|
| `display` | 28 / 36 | Bold | −0.56 | 화면 대제목 |
| `title` | 22 / 30 | Bold | −0.4 | 카드 대제목, 일정 이름 |
| `headline` | 18 / 26 | SemiBold | −0.22 | 헤더 타이틀, 모달 제목 |
| `bodyLg` | 16 / 24 | Regular | 0 | 입력값, 본문 강조 |
| `body` | 14 / 22 | Regular | 0 | 기본 본문 |
| `label` | 13 / 18 | Medium | 0 | 필드 라벨, 탭 라벨 |
| `caption` | 12 / 16 | Medium | +0.24 | 보조 설명, 배지 — **하한** |

**추가 1개** — `button` : 16 / 24 / **SemiBold** / 0. `bodyLg`의 굵기 변형이며 버튼 라벨 전용입니다.

> 기존 코드는 `9 10 11 12 13 14 15 16 17 18 20 24 36` **13종**을 썼고, One UI 접근성 규범의 12sp 하한을 위반하는 곳이 배지·라벨·탭바 등 **40곳 이상**이었습니다.

---

## 3. Effect Styles

**2개뿐입니다.**

| 이름 | 값 | 적용 대상 |
|---|---|---|
| `flat` | 그림자 없음 | 카드, 리스트 아이템, 입력 필드 → **테두리 1px로만 표현** |
| `raised` | `Y 2 · Blur 8 · #000 10%` | FAB, 드롭다운, 바텀시트, 스낵바 → **실제로 떠 있는 것만** |

> 기존 코드는 `theme.ts`에 "No shadows" 라고 써 두고 **22개 파일이 그림자를 사용**하고 있었습니다. 규칙이 비현실적이라 지켜지지 않았으므로, "떠 있는 것만"으로 현실화합니다.

---

## 4. 프레임 규격

| 용도 | 크기 | 비고 |
|---|---|---|
| **기본 작업 프레임** | **384 × 832** | Galaxy S24 |
| 검증 A | 360 × 800 | Galaxy A 시리즈 |
| 검증 B | 320 × 720 | 최소 대응 |
| 검증 C | 673 × 841 | **Z Fold 펼침** — 콘텐츠 최대 폭 480 중앙 정렬 |

**레이아웃 그리드**: Columns 1 / Margin **20** / Stretch
**기준선**: 4px 그리드 (간격 토큰이 전부 4배수)

**시스템 영역** (프레임 안에 실제로 그립니다 — 앱이 edge-to-edge 이므로 필수)

| 영역 | 높이 | 비고 |
|---|---|---|
| 상태바 | 30 | 시계 + 인디케이터 |
| 제스처 내비게이션 바 | 24 | 하단 핸들 |

> `targetSdkVersion = 36`이라 edge-to-edge가 강제되고 opt-out이 없습니다. 인증 화면 6개가 iOS 전용 `SafeAreaView`를 쓰고 있어 **갤럭시에서 콘텐츠가 시스템 바 아래로 파고드는 상태**입니다. 시안에서 이 두 영역을 항상 그려 두면 침범을 눈으로 잡을 수 있습니다.

---

## 5. 컴포넌트 인벤토리

각 항목의 숫자는 **Auto Layout 설정값**입니다.

### 5-1. Button

| Variant 속성 | 값 |
|---|---|
| `type` | `primary` / `secondary` / `ghost` |
| `size` | `lg` / `sm` |
| `state` | `default` / `pressed` / `disabled` |
| `icon` | `none` / `leading` |

```
lg   H 52 고정 · W Fill · 가로 · 가운데 정렬 · gap 9 · padding 0/20 · radius md(14)
sm   H 36 고정 · 가로 · gap 6 · padding 0/14 · radius sm(10)
```

| type | 배경 | 텍스트 | 테두리 |
|---|---|---|---|
| primary | `primary` | `onPrimary` | — |
| secondary | `bg` | `text` | 1 `borderStrong` |
| ghost | 없음 | `primary` | — |

`pressed` = 배경 `primaryPressed`, `disabled` = 배경 `border` + 텍스트 `textDisabled`.

> **주의** — 기존 로그인 버튼은 회색(비활성처럼 보임)인데 실제로는 눌렸습니다. 어포던스와 동작이 반대였습니다. 회색 비활성 대신 **항상 활성 색을 유지하고, 누르면 미입력 필드로 포커스를 옮기는** 방식을 권장합니다.

### 5-2. Field / Text

| Variant 속성 | 값 |
|---|---|
| `state` | `empty` / `filled` / `focus` / `error` / `readonly` |
| `trailing` | `none` / `icon` / `action` |

```
Min H 56 · W Fill · 세로 · gap 2 · padding 9/16 · radius md(14)
테두리  default 1 border · focus 1.5 primary · error 1.5 errorBorder
라벨    caption / textSecondary
값      bodyLg / text
플레이스홀더  bodyLg / textSecondary   ← textDisabled 아님
```

> **플레이스홀더에 `gray/400`을 쓰지 마세요.** 대비 2.54:1로 AA 미달이며, 이 값이 코드 전체에 115회 쓰여 있던 것이 진단의 핵심 항목(L-8)입니다.

**오류 메시지** — 필드 바로 아래 `gap 8`, 가로 배치, `아이콘 15 + 텍스트 body / error`.
색상만으로 오류를 표현하지 않습니다(WCAG 1.4.1). **아이콘 + 문장이 항상 함께** 있어야 하고, 토스트처럼 사라지지 않습니다.

### 5-3. IconButton

```
48 × 48 · radius full · 아이콘 22 가운데
배지  Min W 18 · H 18 · radius full · caption · 배경 primary · 테두리 2 bg
```

> 터치 타깃 48은 타협 불가입니다. 기존 코드의 위반: 툴바 버튼 32, 헤더 뒤로가기 34, 비밀번호 삭제 20, 알림 벨 25.

### 5-4. Card / Trip

| Variant 속성 | 값 |
|---|---|
| `shared` | `false` / `true` |

```
W Fill · 세로 · gap 8 · padding 16/18 · radius lg(20) · 테두리 1 border · effect flat
├ 상단행   가로 · gap 8 · [D-Day 배지] [공유받음 pill?] [⋮ 우측 정렬]
├ 제목     title
└ 메타행   가로 · gap 14 · [📅 기간] [📍 장소 N곳] [👤 N명]  ← body / textSecondary
D-Day 배지  padding 4/9 · radius xs(6) · caption Bold · 배경 primary(내 일정) / warning(공유받음)
```

> 이 카드에는 **체크리스트를 넣지 않습니다.** 기존에는 모든 카드에 `숙소 예약 확인 ✅ / 짐 싸기 완료 ○ / 맛집 리스트 체크 ○`가 동일하게 하드코딩돼 있었고 진행률도 전부 `1/3`이었습니다. 카드 높이의 절반이 가짜였습니다.

### 5-5. AppHeader

| Variant 속성 | 값 |
|---|---|
| `leading` | `none` / `back` |
| `center` | `title` / `progress` |
| `actions` | `0` / `1` / `2` / `3` |

```
H 56 · W Fill · 가로 · 가운데 · gap 6 · padding 0/8/0/4
뒤로가기  IconButton — 항상 왼쪽(leading)
타이틀    headline · Fill · 1줄 말줄임
```

> 기존 회원가입 화면은 뒤로가기가 `position:absolute; right:24`로 **왼쪽 화살표가 화면 오른쪽**에 있었고, 비밀번호 찾기 화면과 위치가 달랐습니다.

### 5-6. ProgressSegments

```
가로 · gap 5 · 세그먼트 H 4 · radius 2 · Fill
완료/현재 primary · 남음 border
우측에 "2 / 3" caption / textSecondary
```

### 5-7. Chip

| Variant 속성 | 값 |
|---|---|
| `type` | `filter` / `choice` / `add` |
| `selected` | `false` / `true` |

```
H 36 · 가로 · gap 6 · padding 0/16 · radius full
default   테두리 1 border · label / textSecondary
selected  배경 primaryContainer · 테두리 없음 · label Bold / primary
add       테두리 1 dashed border · label / textSecondary
```

### 5-8. TabBar

```
H 60 · 가로 · 아이템 Fill · 테두리-상단 1 border · 배경 bg
아이템  세로 · 가운데 · gap 3 · 아이콘 23 · caption
활성 primary · 비활성 textDisabled
※ 아래에 제스처 바 24 별도
```

### 5-9. FAB

```
56 × 56 · radius full · 배경 primary · 아이콘 26 onPrimary · effect raised
위치  right 18 · bottom 88 (탭바 60 + 28)
```

### 5-10. DayTab

| Variant 속성 | 값 |
|---|---|
| `selected` | `false` / `true` |

```
H 48 · 세로 · 가운데 · padding 0/14 · radius md(14) · 테두리 1 border
"N일차" label Bold / textSecondary
"08.20 수" caption / textDisabled
selected  배경 primary · 텍스트 onPrimary
```

### 5-11. TimelineBlock

| Variant 속성 | 값 |
|---|---|
| `category` | `sight` / `lodging` / `food` / `cafe` / `etc` |

```
W Fill · 세로 · gap 0 · padding 9/12 · radius md(14)
테두리-왼쪽 4 category/accent · 배경 category/bg
이름  body Bold / category/text
시간  caption / category/text 85%
```

**타임라인 격자**

```
시간당 높이   80        ← 기존 180
15분 눈금     20
시각 라벨     42 폭 · caption / textDisabled · 기준선 위로 6 이동
블록 좌측 시작 68 (여백 16 + 라벨 42 + 간격 10)
```

> 기존 180dp/시간에서는 하루 11시간이 2,020dp라 화면에 **3.3시간**만 보였고, 하루를 다 보려면 3.4스크린을 스크롤해야 했습니다. 여행 계획의 핵심 판단인 "이 날이 빡빡한가"를 할 수 없는 구조였습니다. 80dp면 **8.3시간**이 한 화면에 들어옵니다.

### 5-12. ListRow (설정 행)

| Variant 속성 | 값 |
|---|---|
| `type` | `nav` / `toggle` / `danger` |

```
Min H 56 · 가로 · 가운데 · gap 12 · padding 0/16 · radius md(14) · 테두리 1 border
아이콘 20 textSecondary · 라벨 bodyLg · 우측 chevron 20 textDisabled
danger  아이콘·라벨 error
```

### 5-13. Snackbar

```
Min H 48 · 가로 · gap 12 · padding 12/16 · radius lg(20) · 배경 surfaceRaised
테두리 1 border · effect raised · 하단 여백 16 + 탭바
텍스트 body / text · 액션 label Bold / primary
```

### 5-14. BottomSheet

```
W Fill · 세로 · gap 20 · padding 24/20/32 · radius xl(26) 상단만 · effect raised
핸들   W 36 · H 4 · radius full · border · 가운데
제목   headline · 본문 body / textSecondary
버튼행 가로 · gap 12 · 각 Fill
```

> `Alert.alert`(안드로이드 네이티브)와 커스텀 모달 **두 시스템이 동시에** 쓰이고 있었습니다. 같은 화면에서 일정 삭제는 시스템 다이얼로그, 계정 탈퇴는 흰 커스텀 모달이 떴습니다. 바텀시트 하나로 통합합니다.

### 5-15. SearchBar

```
H 48 · 가로 · 가운데 · gap 8 · padding 0/14 · radius md(14)
배경 surface · 테두리 1 border
아이콘 18 textSecondary · 입력 body / text · 플레이스홀더 textSecondary
우측 지우기 IconButton 40 (입력값 있을 때만)
```

> 기존 피드 검색창은 `clearButtonMode="while-editing"`을 쓰는데 **iOS 전용 prop이라 갤럭시에서 무효**입니다. 지우기 버튼을 직접 그려야 합니다.

### 5-16. FeedCard (여행기)

| Variant 속성 | 값 |
|---|---|
| `layout` | `card` / `row` |

```
card  W Fill · 세로 · gap 0 · radius lg(20) · 테두리 1 border
      ├ 썸네일 H 180 · radius lg 상단만 · 지역 배지 좌상단 오버레이
      └ 본문 padding 16 · gap 8 · [작성자행] [제목 title] [설명 body 2줄] [태그+기간] [통계행]

row   W Fill · 가로 · gap 12 · padding 16 · radius lg(20) · 테두리 1 border
      ├ 좌측 Fill · gap 6 · [지역배지+제목] [설명 1줄] [작성자·레벨·시간·기간] [통계행]
      └ 썸네일 88 × 88 · radius md(14)
```

> **토글 라벨은 "카드 / 목록"** 입니다. 기존 코드는 `LayoutGrid`(2×2) 아이콘으로 격자를 약속해 놓고 `numColumns={1}`이 고정이라 2열이 나오지 않습니다. 아이콘과 결과를 일치시키세요.

### 5-17. PostCard (커뮤니티 게시글)

```
W Fill · 가로 · gap 12 · padding 16 · radius lg(20) · 테두리 1 border
├ 좌측 Fill · 세로 · gap 6
│   ├ 제목 body Bold / text · 2줄 말줄임
│   └ 메타행 가로 gap 6 — [작성자 caption] [LevelBadge] [· ] [시간 caption / textSecondary]
└ 우측 세로 gap 4
    ├ 썸네일 76 × 76 · radius md(14)   ← 이미지 있을 때만. placeholder 그리지 말 것
    └ 통계행 가로 gap 8 — 좋아요 / 댓글 / 조회
통계 아이콘 16 · 숫자 caption · 색은 셋 다 textSecondary 통일
```

> 기존에는 좋아요만 `#3B82F6`(브랜드 아닌 파랑), 댓글 `#6B7280`, 조회 `#9CA3AF`로 셋이 다른 색이었고 11px이었습니다. 셋은 동급 정보이므로 같은 색이어야 합니다.
> 그리고 **이미지가 없으면 썸네일 자리를 비웁니다.** 앱 글쓰기에 이미지 첨부가 없어 앱에서 쓴 글은 전부 회색 placeholder로 표시되고 있습니다.

### 5-18. LevelBadge

| Variant 속성 | 값 |
|---|---|
| `level` | `1` … `5` |

```
H 20 · padding 2/7 · radius xs(6) · caption Bold   ← 기존 9sp에서 상향
```

색은 **카테고리 팔레트를 재사용**해 새 색을 늘리지 않습니다. 1 → 5로 갈수록 채도가 오르는 승급 램프입니다.

| Lv | 이름 | 배경 | 글자 |
|---|---|---|---|
| 1 | 여행 입문자 | `gray/100` `#F3F4F6` | `gray/600` `#4B5563` |
| 2 | 여행 애호가 | `#F0FDF9` | `#115E56` |
| 3 | 여행 전문가 | `blue/50` `#EBEFFF` | `blue/700` `#0E2DAA` |
| 4 | 여행 마스터 | `#FFFAEB` | `#93370D` |
| 5 | 여행 레전드 | `#FDF2FA` | `#9E165F` |

> 기존 5쌍 중 Lv4 `#D97706`/`#FEF3C7`, Lv5 `#EF4444`/`#FEE2E2`는 소형 텍스트 대비 미달이었습니다.
> **레벨은 실제로 구현된 기능입니다** — 서버와 동일한 `게시글×3 + 댓글` 산식이 [levels.ts]에 있습니다. 피드 목록이 `LV.2`를 하드코딩하고 마이페이지가 "준비중"이라고 표시하던 건 오류입니다. **세 화면 모두 같은 컴포넌트를 씁니다.**

### 5-19. BoardTab (게시판 탭)

`Chip` 컴포넌트를 재사용합니다. 게시판은 자유게시판 / Q&A / 메이트 찾기 / 장소 추천 **4개뿐이라 가로 스크롤이 필요 없습니다** — `W Fill` 균등 분할.

> 기존에는 밑줄형 탭 + 가로 스크롤이었습니다. 앱 안에 탭 표현이 pill(날짜) · 밑줄(게시판) · 아이콘+라벨(하단) · 세그먼트(진행률) 4종으로 갈라져 있었습니다. **pill 하나로 통일합니다.**

### 5-20. CommentItem

| Variant 속성 | 값 |
|---|---|
| `depth` | `0` / `1` |

```
W Fill · 세로 · gap 6 · padding 12/0
depth 1 은 좌측 들여쓰기 32 + 좌측 세로선 2 border
├ 작성자행 가로 gap 6 — [Avatar 24] [이름 label] [LevelBadge] [시간 caption/textSecondary]
├ 본문 body / text
└ 액션행 가로 gap 16 — [답글] [수정] [삭제] [신고]  ← label / textSecondary, 각 탭 영역 44 이상
```

**대댓글은 1단계까지만.** 현재 구현의 판단이 옳으므로 유지합니다.

### 5-21. ReportSheet (신설 — 필수)

```
BottomSheet 기반
제목 "신고 사유를 선택해 주세요"
사유 목록 ListRow — 스팸 / 욕설·혐오 / 음란물 / 허위정보 / 기타
기타 선택 시 TextArea 노출
하단 [취소] [신고하기 — error 색]
```

작성자 프로필(`PublicProfileModal`)에는 **차단** 액션을 추가합니다.

> **현재 앱에는 신고·차단 UI가 하나도 없습니다.** Google Play의 사용자 생성 콘텐츠 정책은 신고 수단과 차단 수단을 요구합니다. 게시글·댓글·닉네임을 자유롭게 올리는 구조라 정책 적용 대상이며, 심사 반려 사유가 됩니다.

### 5-22. 기타

| 컴포넌트 | 규격 |
|---|---|
| `Avatar` | 64 / 40 / 24 / 18 · radius full · 이니셜은 `primaryContainer` 배경 + `primary` 글자 |
| `Badge / DDay` | padding 4/9 · radius xs · caption Bold |
| `StatRow` | 가로 · gap 8 · 아이콘 16 + 숫자 caption · **전부 textSecondary 동일 색** |
| `EmptyState` | 세로 · gap 8 · 가운데 · 아이콘 36 textDisabled · 제목 body · 액션 ghost 버튼 |
| `Requirement` | 가로 · gap 8 · **미충족 ○ 원 / 충족 ✓ 체크** — 색만 바꾸지 말 것 |

---

## 6. 화면 프레임 목록

### `03 Screens — Auth`
| 프레임 | 상태 |
|---|---|
| Intro | 기본 |
| Login | 기본 / 오류 / 로딩 |
| Signup Step 1 (이메일) | 입력 전 / 인증번호 발송됨 / 만료 |
| Signup Step 2 (비밀번호) | 입력 중 / 완료 |
| Signup Step 3 (프로필) | 기본 |
| ForgotPassword | 1단계 |

### `04 Screens — Trips`
| 프레임 | 상태 |
|---|---|
| MyTrips | 목록 / **빈 상태** / 관리 모드(다중 선택) |
| CreateTrip (FAB에서 진입) | 기본 |

### `05 Screens — Editor`
| 프레임 | 상태 |
|---|---|
| Editor — 시간표 | 일정 있음 / **빈 상태** |
| Editor — 추천 장소 | 목록 / 빈 상태 |
| Editor — 장소 배치 중 | 안내 배너 |
| ItineraryView | 기본 / 지도 열림 |

### `06 Screens — Feed` (여행기)
| 프레임 | 상태 |
|---|---|
| Feed — 카드형 | 목록 / **빈 상태** / 필터 적용됨 |
| Feed — 목록형 | 목록 |
| Feed — 필터 시트 | 지역 / 기간 / 정렬 |
| FeedDetail | 기본 / 가져가기 진행 중 / 가져가기 완료 |

> 탭 이름은 **"여행기"** 입니다. 코드상 `TravelFeed`이고 상세 화면도 "여행기 상세"인데 탭만 "피드"로 표기돼 커뮤니티와 구분되지 않았습니다.

### `07 Screens — Community`
| 프레임 | 상태 |
|---|---|
| Community | 목록 / **빈 상태** / 검색 결과 없음 / 오류 |
| Community — 핫글 포함 | 상단 핫글 캐러셀 |
| PostDetail | 본문 + 댓글 / 댓글 없음 |
| PostCreate | 작성 중 / 임시저장 확인 |
| **ReportSheet** | 사유 선택 / 기타 입력 |
| PublicProfile | 기본 (차단 액션 포함) |

### `08 Screens — Profile`
| 프레임 | 상태 |
|---|---|
| MyPage | 기본 |
| Settings | 기본 |
| Settings — 프로필 수정 | 기본 / 닉네임 중복 |

### `09 Patterns`
빈 상태 5종 · 오류 3종 · 로딩(스켈레톤) · 스낵바 3종 · 바텀시트 3종

### `10 Backlog` — 정의만, 배치 안 함
`AchievementBadge` · `ExpBar` · `ChecklistItem`
기능이 준비되면 §7-1의 복귀 위치에 붙입니다. **어떤 화면 프레임에도 넣지 마세요.**

---

### 탭 구조 최종안

```
[내 여행]  [여행기]  [커뮤니티]        ← 3탭 유지
   🧳        🗺        💬
   ＋FAB(일정 생성)      ＋FAB(글쓰기)
```

**Header(로고 + 프로필 배지 + 알림)를 매 탭에 반복하지 않습니다.** 현재 홈·피드·커뮤니티 3개 화면이 같은 Header를 얹고 그 아래 자체 검색/필터 바를 또 두어, 피드 기준 **크롬이 화면의 33%** 입니다. 각 화면은 자기 타이틀 행만 갖고, 알림은 한 곳에 둡니다.

> **빈 상태를 반드시 그려 주세요.** 현재 편집 화면과 조회 화면에는 빈 상태가 **아예 없어서**, 새 일정을 만들고 편집기에 도착한 첫 사용자가 안내 한 줄 없는 빈 격자를 마주합니다. 조회 화면은 장소가 0개면 로딩 애니메이션이 영원히 돌아갑니다.

---

## 7. 절대 어기면 안 되는 제약

Figma에서 자유롭게 조정하시되, 아래 6개는 **진단에서 나온 접근성·플랫폼 요구사항**이라 지켜 주세요. 어기면 코드로 옮길 때 되돌려야 합니다.

| # | 제약 | 근거 |
|---|---|---|
| 1 | **글자 12sp 미만 금지** | One UI 접근성 규범 |
| 2 | **`#9CA3AF`를 텍스트에 쓰지 않음** (2.54:1) | WCAG 1.4.3 |
| 3 | **터치 타깃 48 × 48 이상** | Material 3 / One UI |
| 4 | **오류는 색 + 아이콘 + 문장** (색 단독 금지) | WCAG 1.4.1 / 3.3.1 |
| 5 | **뒤로가기는 항상 좌측** | One UI / Material 3 |
| 6 | **주 액션(파란 채움) 화면당 1개**, 브랜드 파랑은 누를 수 있는 것에만 | 디자인 원칙 3 |
| 7 | **게시글·댓글에 신고, 작성자에 차단 동선 필수** | Google Play UGC 정책 |

**추가 원칙 — 없는 기능은 그리지 않습니다.**
현재 앱에는 "준비중" 자리표시자, 영구 비활성 버튼 1개, 장식용 카메라 배지 1개, 도달 불가 화면 2개가 있습니다. 회색으로 보여주는 것보다 **없는 편이 완성도 있게 보입니다.** 무엇을 지우고 무엇을 연결할지는 §7-1을 따르세요.

---

## 7-1. 보류 기능 — 지금 빼고, 돌아올 자리는 정해둔다

"준비중"으로 표시되던 4종은 **성격이 다릅니다.** 하나는 이미 구현된 기능이고, 셋은 미구현입니다.

| 기능 | 실제 상태 | 이번 시안 | 복귀 시점 |
|---|---|---|---|
| **레벨** | ✅ **구현 완료** — 서버 동기 산식(`게시글×3 + 댓글`), 5등급이 `levels.ts`에 존재. 커뮤니티는 실제 값 사용 중 | **그립니다** — §5-18 `LevelBadge` | — |
| 경험치 바 | ❌ 백엔드·로직 없음 | 빼기 | 레벨 배지 탭 → **바텀시트** |
| 업적 배지 | ❌ 백엔드·로직 없음 | 빼기 | **별도 화면** `마이페이지 › 업적` |
| 여행 체크리스트 | ❌ 고정 배열(`PREVIEW_TASKS`) | 빼기 | **일정 상세/편집 화면의 섹션** |

### 레벨은 지우지 마세요

마이페이지의 `🔒 LV.1 · 준비중`과 피드의 `LV.2` 하드코딩은 **없는 기능을 표시한 게 아니라, 있는 기능을 연결하지 않은 것**입니다. 세 화면(마이페이지 · 피드 · 커뮤니티)이 §5-18의 같은 컴포넌트를 쓰고 실제 값을 받습니다.

### 나머지 셋을 지금 빼는 이유

1. **디자인이 갇힙니다.** 업적 5개는 달성 조건도 서버 응답 형태도 없는 상태에서 그려졌습니다. 나중에 개수·진행률이 정해지면 어차피 다시 그립니다.
2. **비용이 비대칭입니다.** 나중에 붙이는 건 몇 분이지만, 지금 두면 모든 사용자가 매일 "준비중"을 봅니다.
3. **기능 플래그가 불필요합니다.** 켤 백엔드가 없으므로 플래그로 관리할 대상 자체가 없습니다. git 히스토리로 충분합니다.

### 복귀 위치를 지금 정하는 이유

자리를 안 정해두면 나중에 레이아웃을 다시 짜야 합니다.

- **경험치 바 → 바텀시트**: "다음 레벨까지 12점"은 궁금할 때만 보는 정보입니다. 프로필 상단에 상시 노출할 가치가 낮습니다.
- **업적 → 별도 화면**: 5개짜리 카드가 프로필 최상단을 차지할 이유가 없고, 20개로 늘어나도 별도 화면은 감당합니다.
- **체크리스트 → 일정 상세**: 개념은 유용하지만 **위치가 틀렸습니다.** 여행마다 준비물이 다른데 카드에 3줄로 요약될 정보가 아니고, 카드에 넣으면 목록 밀도가 다시 무너집니다.

### Figma 처리

`10 Backlog` 페이지를 만들어 `AchievementBadge` · `ExpBar` · `ChecklistItem` 컴포넌트를 **정의만 해두고 어떤 화면에도 배치하지 않습니다.** 기능이 준비되면 위 위치에 붙이기만 하면 됩니다.

---

## 8. 빌드 순서 체크리스트

```
□ 1. Pretendard 설치 → Figma 재시작
□ 2. planmate-tokens.json 임포트 → Variables 3개 컬렉션 생성 (Light/Dark 모드 확인)
□ 3. Text Styles 8개 등록 (7 + button)
□ 4. Effect Styles 2개 등록
□ 5. 384 × 832 프레임 + Grid(margin 20) 템플릿 생성, 상태바·제스처바 포함
□ 6. 컴포넌트 §5 순서대로 제작 — Button → Field → IconButton 부터
□ 7. 화면 프레임 §6 제작
□ 8. Dark 모드로 전환해 전 화면 검수 ← 컴포넌트가 Semantic만 참조하면 자동 반영
□ 9. 673 폭 프레임으로 폴더블 검수 (콘텐츠 최대 480 중앙)
□ 10. §7 제약 6개 육안 검수
```

---

## 9. 작업 후 저에게 보내주실 것

Figma 링크는 제가 열 수 없으므로 **아래 3가지**를 주시면 이어서 진행하겠습니다.

| # | 항목 | 방법 |
|---|---|---|
| 1 | **화면 프레임 PNG** | 프레임 선택 → Export → **PNG 2x** → 화면 이름으로 저장. 라이트/다크 각각 |
| 2 | **변경된 토큰** | 값을 바꾸셨다면 Tokens Studio → `Tools` → `Export` → JSON |
| 3 | **변경 메모** | "카드 라운드를 24로 올림", "탭 순서 바꿈" 같은 한 줄씩. 의도한 변경과 실수를 구분하기 위해 필요합니다 |

파일은 `App/design/figma-export/` 에 두시면 제가 바로 읽습니다.

받은 뒤 진행할 내용:
- 시안 ↔ §7 제약 6개 대조 검수
- 확정 시안 기준으로 **Step 6 적용 로드맵** 작성 (P0 16건 / P1 21건 / P2 15건 → 작업 단위 · 영향 파일 · 공수 · 의존 순서)
- `src/design/tokens.ts` + `scale.ts` 실제 코드 생성

---

## 부록 — 이주 매핑

코드에서 Figma로 옮길 때, 그리고 반대로 돌아올 때의 대응표입니다.

| 기존 값 | 신규 토큰 | 등장 횟수 |
|---|---|---|
| `#0047FF` `#3B82F6` `#2563EB` `#1A73E8` `#3B5BDB` `#57A0EE` `#91C0F8` `#1E3A8A` | `blue/500` 계열로 흡수 | 파랑 18종 |
| `#9CA3AF` (텍스트) | `textSecondary` = `gray/500` | 115회 중 텍스트분 |
| `#FF3B30` `#EF4444` `#E11D48` `#FF453A` | `error` `#D92D20` | 4종 |
| `#34C759` `#10B981` `#059669` | `success` `#067647` | 3종 |
| `#FF9500` `#FFA500` `#D97706` | `warning` `#B54708` | 3종 |
| `Inter_*` 5종 | **제거** | 4개 파일 |
| `'Pretendard Variable'` | `Pretendard` 정적 4종 | 13곳 |
| `borderRadius: 8` | `radius/md` = 14 | 47회 |
| `borderRadius: 12` | `radius/lg` = 20 | 23회 |
| `fontSize: 9 / 10 / 11` | `caption` = 12 | 34회 |
| `fontSize: 13 / 15 / 17` | `label 13` / `body 14` / `bodyLg 16` | 29회 |
| `normalize()` 16벌 | `sf()` / `sp()` — 클램프 0.95–1.20 | 16개 파일 |
| `COLORS` 로컬 7벌 | Semantic 컬렉션 | 7개 파일 |
| `HOUR_HEIGHT = 180` | `size/hourRow` = 80 | 2개 파일 |
| `LEVEL_BADGE_COLORS` 5쌍 | §5-18 카테고리 팔레트 재사용 | levels.ts |
| 하드코딩 `LV.2` (피드) | 실제 레벨 + `LevelBadge` 공용 | TravelFeedList |
| 밑줄형 게시판 탭 | `Chip` 재사용 | CommunityScreen |
