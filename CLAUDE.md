# 모델 라우팅 규칙

세 개의 백엔드를 작업 형태에 따라 자동 선택한다. 모델 선택은 수동 조작 없이 아래 규칙만으로 결정한다. 사용자가 모델을 명시하면 그 지정이 항상 우선한다.

| 백엔드 | 경로 | 모델 고정 | 추론 |
|---|---|---|---|
| Claude (오케스트레이터) | Claude Code 본체 | `opus` 고정 — Opus 5 | `effortLevel: xhigh` |
| Claude (기계적 작업) | `mechanic` 서브에이전트 (Agent 도구) | `sonnet` 고정 — Sonnet 5 | `effort: high` |
| Antigravity | `mcp__antigravity__ask_antigravity` | `gemini-3.8-flash-high` 고정 | `effort: high` 고정 |
| Codex | `mcp__codex__codex` | `gpt-5.6-sol` 고정 | `model_reasoning_effort: xhigh` 기본 |

네 값 모두 설정 파일에 박혀 있으므로 호출할 때 모델·추론 인자를 다시 적지 않는다. 예외는 Codex의 짧은 조회뿐이다(아래 2절).

## 1. Claude 자체 모델 전환

`~/.claude/settings.json`의 `"model": "opus"`로 세션 전체가 Opus 5 고정이다. 플랜 모드 진입 여부로 모델이 바뀌지 않는다 — `opusplan`은 쓰지 않는다(실행 구간이 대부분인 이 프로젝트에서 자동으로 Sonnet 5로 떨어지는 게 체감상 손해였음).

대신 판단이 필요 없는 정형 작업은 `Agent` 도구로 `mechanic` 서브에이전트(`App/.claude/agents/mechanic.md`, `model: sonnet`)에 위임한다. 이미 결정된 계획을 그대로 실행하는 경우에만 위임하고, 설계·판단이 섞인 작업은 Opus 5가 직접 한다.

- 설계·아키텍처 판단·정합성 추론·모호한 버그 진단·코드 리뷰 → Opus 5 직접 수행
- 이미 승인된 계획의 기계적 실행: 대량 치환/리네임, 한 패턴을 따르는 다중 파일 편집, 테스트·빌드·린트 실행 및 결과 보고, 로그 확인 → `mechanic` 서브에이전트
- 위임 프롬프트에는 "무엇을 어떻게"까지 이미 정해서 넘긴다. 서브에이전트가 판단할 여지를 남기지 않는다.

`effortLevel`은 `low|medium|high|xhigh`만 유효하다. `max`는 스키마에서 조용히 버려져 모델 기본값으로 떨어지므로 쓰지 않는다. 서브에이전트 frontmatter의 `effort:` 필드는 `max`도 유효하지만, 가드레일(4절)에 따라 `high` 이상을 쓴다.

## 2. 읽기 전용 작업 분기

| 작업 형태 | 백엔드 |
|---|---|
| 단발 사실 확인, 5개 파일 미만, 대화 맥락 필요 | Claude 본체 |
| 짧고 닫힌 질의(개수, 존재 여부, 특정 값) | Codex, `config: {model_reasoning_effort: "low"}` |
| 저장소 전반 구조화 조사·인벤토리·감사 | Antigravity |
| 좁고 어려운 정합성 추론(경쟁 조건, 백엔드-앱 계약 불일치, 알고리즘 정확성) | Codex(기본 xhigh) |
| 병합 전 고위험 검증 | 위 둘을 병렬 실행 후 교차 대조 |

위임 왕복은 최소 30초에서 2분이 소요된다. Claude가 직접 수행해 더 빠른 작업은 위임하지 않는다.

## 3. 쓰기 작업

저장소 파일 수정·생성·삭제, 커밋, 테스트 실행은 **Claude(본체 또는 `mechanic` 서브에이전트)가 단독으로 수행한다.** Antigravity·Codex 같은 외부 위임 백엔드의 쓰기 능력은 다음과 같이 확인되어 있으나, 기본 경로로 쓰지 않는다.

- Antigravity는 `mode: "accept-edits"`로 파일 생성·편집이 가능하다(2026-09-03 실측). 셸 명령은 여전히 자동 거부된다 — `~/.gemini/antigravity-cli/settings.json`의 `permissions.allow`에 정확한 `command(...)` 문자열을 넣거나 `skip_permissions: true`를 써야 하고, 후자는 Claude Code auto mode 분류기가 차단한다.
- Codex 쓰기는 `approval-policy: "never"` + `sandbox: "workspace-write"`가 필요하며 미검증이다.

대량 정형 편집을 Antigravity에 넘기는 판단은 사용자 승인 후에만 한다.

## 4. 가드레일

- 위임 프롬프트는 자기완결적으로 작성한다. 서브 에이전트는 대화 맥락을 볼 수 없다.
- 백엔드 교차 점검 시 Antigravity는 `add_dirs`에 `Backend-v2`를, Codex는 `cwd`를 `App` 루트로 지정한다.
- **Antigravity의 빈 응답은 실패다.** 추론 수준과 무관하며, 원인은 print 모드가 응답할 수 없는 도구 권한 요청으로 턴이 중단된 것이다. "발견 없음"으로 읽지 않는다. 파일 작업이면 `mode: "accept-edits"`로, 셸이 필요하면 허용 규칙을 추가하고 재실행한다.
- 백엔드별 쿼터가 분리되어 있고 Codex는 한도 도달 이력이 있다. 저비용 작업은 Claude가 직접 처리하고 위임은 대규모 조사 또는 교차 검증 목적에 한정한다.
- 위임 결과는 실제 파일로 검증한 뒤 반영한다.
