# 모델 라우팅 규칙

MCP 브리지로 연결된 3개 모델을 작업 형태에 따라 자동 선택한다. 사용자가 모델을 명시하면 그 지정이 항상 우선한다.

| 모델 | 경로 | 성격 |
|---|---|---|
| Opus 5 | Claude Code 본체 | 오케스트레이터. 편집·실행·검증 담당 |
| Gemini 3.7 Flash | `mcp__antigravity__ask_antigravity` | 읽기 전용 대규모 조사 |
| GPT-5.6 sol | `mcp__codex__codex` | 조회 및 심층 정합성 추론 |

## 1. 쓰기 작업은 Opus 5 단독

파일 수정·생성·삭제, 커밋, 테스트 실행은 위임하지 않는다. Antigravity의 쓰기 경로는 auto mode 분류기에 차단되며 `accept-edits` 모드는 빈 응답을 반환한다. Codex 쓰기 경로는 미검증이다.

## 2. 읽기 전용 작업 분기

| 작업 형태 | 모델 | 추론 속도 |
|---|---|---|
| 단발 사실 확인, 5개 파일 미만, 대화 맥락 필요 | Opus 5 native | 즉시 |
| 짧고 닫힌 질의(개수, 존재 여부, 특정 값) | GPT-5.6 sol | `low` |
| 저장소 전반 구조화 조사·인벤토리·감사 | Gemini 3.7 Flash | `high` 고정 |
| 좁고 어려운 정합성 추론(경쟁 조건, 백엔드-앱 계약 불일치, 알고리즘 정확성) | GPT-5.6 sol | `xhigh` |
| 병합 전 고위험 검증 | 위 둘을 병렬 실행 후 교차 대조 | 각각 최대 |

위임 왕복은 최소 30초에서 2분이 소요된다. Opus 5가 직접 수행해 더 빠른 작업은 위임하지 않는다.

## 3. 추론 속도 지정

| 모델 | 조절 | 지정 방법 |
|---|---|---|
| Opus 5 | 2단계 | 반복적 대화 작업은 `/fast`, 어려운 문제는 extended thinking |
| Gemini 3.7 Flash | 불가 | `gemini-3.7-flash-high` + `effort: high` 외 사용 금지 |
| GPT-5.6 sol | 4단계 | `config: {model_reasoning_effort: low\|medium\|high\|xhigh}`, 기본 xhigh |

Gemini 3.7 Flash는 low/medium effort에서 프롬프트 길이·구조와 무관하게 빈 응답을 반환하며 토큰만 소모한다. 속도 다이얼이 없는 모델로 취급한다.

## 4. 가드레일

- 위임 프롬프트는 자기완결적으로 작성한다. 서브 에이전트는 대화 맥락을 볼 수 없다.
- 백엔드 교차 점검 시 Antigravity는 `add_dirs`에 `Backend-v2`를, Codex는 `cwd`를 `App` 루트로 지정한다.
- Gemini의 빈 응답을 "발견 없음"으로 해석하지 않는다. 실패이므로 `high`로 재실행한다.
- 백엔드별 쿼터가 분리되어 있고 Codex는 한도 도달 이력이 있다. 저비용 작업은 Opus 5가 직접 처리하고 위임은 대규모 조사 또는 교차 검증 목적에 한정한다.
- 위임 결과는 실제 파일로 검증한 뒤 반영한다.
