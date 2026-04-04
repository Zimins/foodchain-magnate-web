# Food Chain Magnate - Ketchup Expansion Spec

## Context
"The Ketchup Mechanism and Other Ideas" 확장팩의 게임 스펙.
확장팩은 **모듈 시스템**으로 구성되며, 각 모듈을 독립적으로 또는 조합하여 사용할 수 있다.
본 문서는 base-game-spec.md의 기본 규칙을 전제로 한다.

---

## 1. 모듈 목록

| 모듈 | 핵심 추가 요소 |
|-----|------------|
| New Districts | 새 맵 타일 5~6개, 아파트, 공원 |
| Kimchi | 김치 마스터, 김치 토큰 |
| Sushi | 스시 쿡/셰프, 스시 토큰 |
| Noodles | 누들 쿡/셰프, 누들 토큰 |
| Coffee | 바리스타 계열, 커피숍, 커피 토큰 |
| Lobbyists | 로비스트, 도로 공사 타일, 공원 타일 |
| New Milestones | 기존 마일스톤 교체 ("First Used" 방식), Hard Choices |
| Rural Marketeers | 시골 지역 마케팅 캠페인 |
| Gourmet Food Critic | 미식 평론가 |
| Mass Marketeer | 대량 마케팅 |
| Night Shift Managers | 야간 교대 매니저 |
| Ketchup Mechanism | 후발주자 보상 시스템 |
| Movie Stars | 영화배우 |
| Reserve Prices | 준비금 가격 |
| Fry Chefs | 튀김 셰프 |
| 6 Players | 6인 지원 |

---

## 2. 직원 트레이 변경 (공통 규칙)

### 2.1 Unique (1X) 직원 추가
- 모듈이 새 1X 직원을 추가하면, 플레이어 수에 맞게 투입:
  - 2~3인: 각 타입 1장
  - 4인: 각 타입 2장
  - 5~6인: 각 타입 3장

### 2.2 Luxuries Manager 추가
- Sushi, Kimchi, Coffee, Noodles 모듈 사용 시: 각 모듈당 Luxuries Manager 1장 추가

### 2.3 Executive Vice President
- 확장팩에 3장 포함. 마일스톤 보상 전용 (셋업 시 트레이에 넣지 않음)

### 2.4 Kitchen Trainee 교체
- **Sushi, Kimchi, Coffee, Noodles** 모듈 사용 시:
  - 기본판 Kitchen Trainee 12장 → 확장판 "Any Cook" Kitchen Trainee 12장으로 교체

### 2.5 Marketing Trainee 교체
- **Rural Marketeer, Gourmet Food Critic, Mass Marketeer** 모듈 사용 시:
  - 기본판 Marketing Trainee 12장 → 확장판 Marketing Trainee 12장으로 교체

---

## 3. New Districts 모듈

### 3.1 개요
- 새 맵 타일 5개 (Lobbyists 모듈 사용 시 6개)를 기존 타일에 섞어서 맵 구성
- 새 타일에는 아파트, 다중 공급처, 정원 있는 집 등 포함

### 3.2 특수 맵 타일

#### 3-레모네이드 공급처 타일
- 3개의 레모네이드 공급처가 한 타일에 존재
- Cart Operator/Truck Driver로 경유 시 각각 별도 공급처로 취급 (1~3개 통과 가능)
- Zeppelin이 이 타일 진입 시 3개 모두에서 수집

#### 집 21, 22 타일
- 일반 규칙 적용

#### 집 25 타일 (정원 내장)
- 시작부터 정원 보유, 추가 정원 불가
- 수요 카운터 최대 5개, 구매 시 2배 가격

### 3.3 아파트 (Apartments)

**핵심 규칙: 아파트는 "집"으로 취급** (별도 명시 없는 한)

#### "Pi" 아파트
- 4개의 도로 입구 (각 곡선 가장자리에 연결)
- 각 도로는 서로 연결되지 않음 (언더패스 아님)
- 우편함 마케팅은 아파트를 통과할 수 있음

#### "9¾" 아파트
- 특별 규칙 없음

#### 수요 규칙
- 아파트에 수요 배치 시: 일반적으로 1개 놓을 때 **같은 타입 2개** 배치
- 아파트는 **수요 최대치 없음** (무제한)
- 수요 카운터는 단일 레스토랑이 전체 수요를 충족하지 않는 한 제거되지 않음

#### 정원 규칙
- 아파트에는 정원 배치 불가
- (공원은 Lobbyists 모듈에서 혜택 가능)

#### 디너타임 순서
- "Pi": 집 3과 4 사이
- "9¾": 집 9와 10 사이

### 3.4 공원 (Parks) — Lobbyists 모듈 필요
- 공원 타일 전용 맵 타일은 Lobbyists 모듈에서만 사용
- 공원에 직교 인접한 집/아파트: 음식/음료 아이템당 **2배** Item Price 지불
- 정원 + 공원: **3배** Item Price
- 여러 공원에 인접해도 보너스는 1회만
- 공원은 스시 수요나 수요 카운터 최대치에 영향 없음

---

## 4. Kimchi 모듈

### 4.1 컴포넌트
- Kimchi Master 카드 3장 (플레이어 수에 맞게)
- Luxuries Manager 1장 추가
- 김치 토큰 12개

### 4.2 Kimchi Master
- **고용**: 일반 규칙대로 Hire 가능
- **Phase 3 (Working 9-5)**: 플레이해도 즉시 효과 없음
- **Phase 7 (Cleanup)**: 다른 음식 폐기 후 김치 1개 **의무** 획득
- 김치는 다음 턴까지 보관, 그 후 일반 폐기 규칙 적용

### 4.3 디너타임 규칙
- 일반 식사 조건 + **김치 보유 레스토랑 우선**
- 여러 레스토랑이 수요를 충족할 수 있을 때:
  - 김치 보유 레스토랑이 있으면 → 그 레스토랑으로 감 (거리/가격 무시)
  - 김치 보유 레스토랑이 여럿이면 → 일반 Competition 규칙 적용
- 판매 시: 수요 카운터 제거 + 일치 재고 제거 + **김치 1개 추가 제거** (있으면)
- 김치도 일반 아이템처럼 현금 수집

### 4.4 마케팅
- 김치는 마케팅 불가

### 4.5 냉동고
- 김치를 냉동고에 저장 가능
- **단, 김치를 저장하면 다른 음식/음료 저장 불가** (김치 전용 냉동고)
- 김치 최대 10개 보관

---

## 5. Sushi 모듈

### 5.1 컴포넌트
- Sushi Cook 6장, Sushi Chef 3장 (플레이어 수에 맞게)
- Luxuries Manager 1장 추가
- 스시 토큰 40개

### 5.2 생산
- Sushi Cook: 스시 2개 생산
- Sushi Chef: 스시 5개 생산
- Kitchen Trainee를 "Any Cook" 버전으로 교체 (스시/버거/피자 중 택)

### 5.3 디너타임 규칙
- **정원이 있는 집에서만** 스시를 원함
- 정원 있는 집에서 레스토랑이 수요 수와 같거나 많은 스시를 보유하면:
  - 해당 레스토랑으로 감 (일반 식사보다 스시 우선)
  - 스시로 수요 전체를 대체 (수요 카운터 타입 무관)
- 스시 제공 레스토랑이 여럿이면 → Competition
- 스시 제공 레스토랑이 없으면 → 일반 규칙 (스시 무시)
- 판매 시: 수요 카운터 전부 제거 + 수요 수만큼 스시 제거

### 5.4 마케팅
- 스시는 마케팅 불가

### 5.5 기타
- 정원 없는 집은 스시를 원하지도, 먹지도 않음
- 공원은 정원이 아님 (스시에 영향 없음)
- 스시는 마일스톤 목적상 "음식"으로 취급
- 냉동고에 저장 가능
- 커피의 대체품으로 사용 불가

---

## 6. Noodles 모듈

### 6.1 컴포넌트
- Noodle Cook 6장, Noodle Chef 3장 (플레이어 수에 맞게)
- Luxuries Manager 1장 추가
- 누들 토큰 40개, 대형 누들 토큰 12개

### 6.2 생산
- Noodle Cook: 누들 6개 생산
- Noodle Chef: 누들 36개 생산 (5x 토큰 사용)
- Kitchen Trainee를 "Any Cook" 버전으로 교체

### 6.3 디너타임 규칙
- 일반 식사 조건을 먼저 확인:
  - 정확히 수요를 충족하는 레스토랑이 있으면 → 일반 규칙
- **정확한 매칭이 불가능할 때만** 누들 체크:
  - 수요 카운터 수와 같거나 많은 누들을 보유한 레스토랑이 있으면 → 그 레스토랑으로 감
  - 누들로 수요 전체를 대체 (수요 카운터 타입 무관)
  - 여러 레스토랑이 충분한 누들 보유 시 → Competition
- 판매 시: 수요 카운터 전부 제거 + 수요 수만큼 누들 제거

### 6.4 마케팅
- 누들은 마케팅 불가

### 6.5 기타
- 누들은 마일스톤 목적상 "음식"으로 취급
- 냉동고에 저장 가능
- 커피의 대체품으로 사용 불가

---

## 7. Coffee 모듈

### 7.1 컴포넌트
- Barista Trainee 12장, Barista 6장, Lead Barista 3장 (플레이어 수에 맞게)
- Luxuries Manager 1장 추가
- 커피 토큰 40개
- 커피숍 토큰 18개 (플레이어당 3개 할당)
- "First Coffee Sold" 마일스톤 카드
- 모듈 마일스톤 보드 부착물

### 7.2 커피숍 규칙

**배치:**
- 커피숍 = 1칸 차지
- **모든 면에서 입구** (직교 인접한 모든 도로에 연결)
- 맵 타일당 최대 1개 커피숍
- Infinite range로 배치 (단, Training으로 얻는 경우 기존 레스토랑/커피숍에서 Road Range 2 이내)

**커피숍을 얻는 3가지 방법:**
1. Barista Trainee → Barista 훈련 시
2. Barista → Lead Barista 훈련 시
3. "First Coffee Sold" 마일스톤 획득 시

**3개 모두 배치된 경우:** 새 커피숍을 얻으면 기존 1개를 이동 가능

**기능:**
- 커피만 판매 (음식/음료 불가)
- 직원의 Range 계산 시 출발점으로 사용 가능 (예: Truck Driver를 커피숍에서 출발)
- Barista/Lead Barista가 커피 생산 (일반 음식과 같은 방식)
- 커피는 음료가 **아님** (마일스톤 목적)

### 7.3 디너타임 커피 판매

**순서:**
1. 먼저 일반 규칙대로 어느 레스토랑에서 식사할지 결정
2. 식사할 레스토랑이 정해지면 → 커피 판매 단계 (일반 판매 전)
3. 식사할 레스토랑이 없으면 → 커피 판매도 없음

**커피 경로 결정:**
1. 집에서 식사할 레스토랑까지의 **최단 거리 경로** 추적
2. 경로는 가능한 한 많은 커피 보유 레스토랑/커피숍에 직교 인접하도록 연장
3. 경로상 직교 인접한 각 레스토랑/커피숍에서 커피 1개씩 자동 구매

**동률 경로 (Tied Routes):**
- 같은 최단 거리의 여러 경로 중 커피를 가장 많이 파는 경로 선택
- 여전히 동률이면: 모든 동률 경로에 **공통으로** 나타나는 커피 원천에서만 구매
- 동률 경로에서 다른 원천은 구매하지 않음 (집이 결정 불가)

**수집 규칙:**
- 커피는 의무 구매 ("보이면 반드시 구매")
- 목적지 레스토랑 자체는 커피를 판매하지 않음
- 같은 원천에서 경로를 여러 번 지나도 1개만 판매
- 커피는 일반 아이템처럼 가격 적용 (정원/공원 보너스 포함)
- 커피는 음료가 아니므로 "First Drink Marketed" 마일스톤 보너스 미적용

### 7.4 마케팅
- 커피는 마케팅 불가

### 7.5 Cleanup
- 모든 미판매 커피 폐기 (냉동고 저장 불가)

### 7.6 마일스톤
- "First Coffee Sold": 최초 커피 판매 시 → Cleanup 단계에서 커피숍 1개 배치 (Range 제한 없음)

---

## 8. Lobbyists 모듈

### 8.1 컴포넌트
- Lobbyist 카드 6장
- Roadwork 토큰 8개 (공사 중 / 완성 양면)
- Park 타일 4개 (양면)
- "First Lobbyist Used" 마일스톤 카드
- 모듈 마일스톤 보드 부착물

### 8.2 맵 셋업 변경
- 게임 시작 전 6개의 새 맵 타일 중 사용할 것을 합의
- 5~6인 게임: 6개 모두 필수
- 선택한 타일을 기존 타일에 섞어 맵 구성
- 미사용 타일은 근처에 보관 ("First Lobbyist Used" 마일스톤용)
- 도로 공사 타일과 공원 근처에 배치

### 8.3 Lobbyist 행동
- Phase 3에서 집/정원 배치 후, 레스토랑 배치 전에 수행
- 각 플레이된 Lobbyist: 빈 칸에 **도로 1개** 또는 **공원 1개** 배치
- 배치 위치: 자신의 Entrance Corner에서 Road Range 2 이내의 도로에 인접한 빈 칸

### 8.4 도로 배치 규칙
- "공사 중" 면으로 배치
- 화살표 2개: 하나는 반드시 자신의 Entrance Corner 또는 Range 2 이내 도로 칸을 가리킴
- 다른 화살표: 아무 방향 (또는 빈 칸)
- 각 화살표가 가리키는 직교 인접 도로 칸에 Roadwork 토큰 배치
- 기존 또는 이번 턴 다른 플레이어가 배치한 Roadwork 토큰을 가리킬 수 있음 (그 위에 새 타일 놓지 않음)
- 맵 가장자리를 넘어가면 안 됨

### 8.5 도로 경로와 Roadwork
- 공사 중 도로: 경로 추적 시 거리 +1 추가 (타일 경계와 별도)
- Cleanup 시: 모든 Roadwork 토큰 제거, "공사 중" 도로를 뒤집어 완성 도로로

### 8.6 공원 규칙
- Park 타일 양면 사용 가능
- 배치 규칙은 도로와 동일한 위치 제한
- **디너타임 효과:**
  - 공원에 직교 인접한 집/아파트: 음식/음료당 **2배 Item Price**
  - 정원 있는 집 + 공원 인접: **3배 Item Price**
  - 여러 공원에 인접해도 1회만 적용
  - 스시 수요나 수요 카운터 최대치에 영향 없음

### 8.7 "First Lobbyist Used" 마일스톤
- 최초 도로/공원 배치 시 획득
- 즉시 추가 맵 타일 1개 배치 (턴 순서대로):
  - 셋업 시 남은 맵 타일 중 선택
  - 기존 맵에 직교 인접하게 배치 (그리드 정렬)
  - 비행기/Freeway가 있는 가장자리에는 인접 배치 불가
  - 새 타일에 즉시 레스토랑, 공원, 도로 배치 가능

---

## 9. New Milestones 모듈

### 9.1 개요
- 기존 마일스톤 보드를 확장판 Insert로 교체
- 3개의 마일스톤에 "Remove after turn 2" 토큰 배치:
  - First Marketeer Used
  - First Trainer Used
  - First Recruiting Girl Used

### 9.2 Hard Choices
- 턴 2가 끝난 후, 위 3개 마일스톤이 아직 미획득이면:
  - 모든 플레이어가 X 표시
  - "Remove after turn 2" 토큰 제거
- 이를 통해 초반 마케팅/훈련/고용 경쟁을 촉진

### 9.3 "Used" vs "Played" 마일스톤
- 기존 "First X Played" → "First X Used"로 변경
- **차이점**: "Used"는 해당 카드의 효과를 실제로 사용해야 함
  - 단순히 Work Slot에 배치하는 것만으로는 불충분
  - Working 9-5, Dinnertime, Payday 중 1개 이상의 효과를 발동해야 함
- Training, 급여 지불, 카드 플레이 자체는 "사용"으로 인정되지 않음

### 9.4 확장 마일스톤 상세

| 마일스톤 | 조건 | 효과 |
|--------|-----|-----|
| First Marketeer Used | 마케터로 실제 캠페인 배치 | 1) 마케터의 수요 배치 시 $5/카운터 획득 2) 디너타임 시 자신의 레스토랑까지 거리 -2 |
| First Campaign Manager Used | Campaign Manager로 두 번째 캠페인 배치 | Campaign Manager가 동일 타입/동일 아이템/동일 duration의 2번째 캠페인 배치 가능. CM은 양쪽 캠페인에 연결되어 소진 시 반환 |
| First Brand Manager Used | Brand Manager로 캠페인 배치 | 비행기 캠페인에 2개의 **다른** 아이템 카운터 배치 가능 (각 같은 duration, 최대 4). 매 마케팅 페이즈에 A 아이템 먼저, B 아이템 다음 |
| First Brand Director Used | Brand Director로 캠페인 배치 | 모든 종류의 캠페인을 라디오처럼 영구 + 무급으로 만듦. 영구 깃발 사용, duration 1개만 배치 (제거 안 됨). Brand Director 영구 Busy |
| First Burger Sold | 버거 판매 | CEO가 4 Work Slot. 은행 준비금 카드 효과 무시 |
| First Pizza Sold | 첫 3개 집이 피자 구매 시 | 판매한 집이 있는 타일의 합법적 빈 칸에 라디오 마케팅 캠페인 배치 (피자 카운터 2개, duration 2). 마케터에 연결 안 됨, $5 마케터 마일스톤 보너스 미적용 |
| First Lemonade Sold | 레모네이드 판매 | 이후 플레이 직원을 같은 색(타입)으로만 훈련 가능. 훈련 직원은 같은 Work Slot에 재배치, 즉시 사용 가능 |
| First Beer Sold | 맥주 판매 | 급여를 아이템 카운터로 지불 가능 (커피 제외). 1 카운터 = 1인 급여. 현금과 혼합 가능 |
| First Soda Sold | 소다 판매 | 냉동고 획득 (기본판과 동일) |
| First Recruiting Girl Used | Recruiting Girl로 고용 수행 | Executive VP를 supply에서 On the Beach로 (무급 영구). supply 소진 시 게임 박스에서 가져옴 |
| First Trainer Used | Trainer로 훈련 수행 | 무료 Trainer 1명 On the Beach로 (이후 급여 불필요) |
| First Cart Operator Used | Cart Operator로 음료 수집 | Cart Operator/Truck Driver/Zeppelin이 공급처당 4개 수집. Truck Driver는 6개 |
| First Discount Manager Used | Discount Manager로 가격 할인 | 매 턴 $3+ 할인 시, Restructuring 종료 시 은행에서 $100 제거 (게임에서 영구 제거). 여러 플레이어 보유 시 각각 적용 |
| First Waitress Used | Waitress 디너타임 보너스 | 직원 급여가 $3/명 ($5 대신). Recruiting Manager/HR Director 할인은 여전히 $5 |
| First House Built | 집 배치 | Training 중첩 가능 (기본판 "First to Pay $20" 마일스톤과 유사) |
| First New Restaurant | 새 레스토랑 배치 | 새 레스토랑의 "우편함 범위" 내에 무료 영구 우편함 배치 (마케터 연결 없음, $5 마케터 마일스톤 보너스 미적용) |

---

## 10. 모듈 조합 시 우선순위

디너타임에서 여러 특수 음식 모듈이 겹칠 때의 우선순위:

1. **스시** (정원 있는 집 전용) — 최우선
2. **김치** — 스시 다음
3. **일반 식사** (정확한 수요 매칭)
4. **누들** — 정확한 매칭이 없을 때만

### 상세 해결 순서:
1. 정원 있는 집이고, 수요 수 이상의 스시를 가진 레스토랑이 있으면 → 스시로 해결
2. 수요를 정확히 충족 + 김치 보유 레스토랑이 있으면 → 김치 레스토랑 우선
3. 수요를 정확히 충족하는 레스토랑이 있으면 → 일반 Competition
4. 수요 수 이상의 누들을 가진 레스토랑이 있으면 → 누들로 해결
5. 어디서도 충족 불가 → 집에 머무름

---

## 11. 추가 모듈 (개요)

### 11.1 Rural Marketeers
- 시골 지역(맵 외곽) 전용 마케팅 캠페인 토큰 4개
- Marketing Trainee 교체 필요

### 11.2 Gourmet Food Critic
- 미식 평론가 토큰 4개
- 특정 레스토랑에 평론가 보내서 보너스/페널티

### 11.3 Freeway
- 고속도로 토큰 3개
- 맵 가장자리에 배치, 장거리 연결 제공

### 11.4 Night Shift Managers
- 야간 교대 매니저: 추가 라운드 행동

### 11.5 Ketchup Mechanism
- 후발주자 보상: 뒤처진 플레이어에게 추가 혜택

### 11.6 Movie Stars
- 영화배우가 레스토랑 방문 시 추가 수입

### 11.7 Reserve Prices
- 은행 준비금 카드 추가 (다양한 금액)

### 11.8 6 Players
- 6인 게임 지원:
  - 맵 크기: 5x5 또는 4x6 타일
  - 새 맵 타일 6개 모두 필수
  - 시작 은행: $300

---

## 12. 온라인 구현 시 확장팩 고려사항

### 12.1 모듈 선택 UI
- 게임 생성 시 사용할 모듈을 체크박스로 선택
- 추천 조합 프리셋 제공 (룰북의 Suggested Scenarios)
- 모듈 간 의존성/비호환성 자동 체크

### 12.2 추천 시나리오 프리셋

| 시나리오 | 모듈 조합 |
|---------|---------|
| New Milestones | New Milestones만 |
| Your First Cup of Coffee | Coffee (± New Milestones) |
| Korean City | New Districts + Kimchi (아파트 타일 1개 이상 필수) |
| Nightlife | New Milestones + Night Shift Managers |
| Sustenance | Coffee + Fry Chefs |
| Upmarket Area | New Milestones + Park Tile + New Districts + Gourmet Food Critic + Sushi |
| City Builder | Lobbyists + New Districts + Rural Marketeers |
| Asian Fusion | Sushi + Kimchi + Noodles + Ketchup |
| First Mover | Hard Choices + Ketchup + Movie Stars + Lobbyists + Reserve Prices |
| Overtime | Night Shift Managers + Mass Marketeer + New Districts + Rural Marketeers + Noodles + Reserve Prices |
| Henri Lo Menu | 6 Players 제외 전부 |

### 12.3 커피 경로 자동 계산
- 커피 판매는 완전 자동 해결 (플레이어 결정 없음)
- 최단 경로 탐색 + 최대 커피 판매 경로 선택 알고리즘 필요
- 동률 경로의 "공통 원천" 판별 로직 복잡 — 구현 우선순위 주의

### 12.4 아파트 수요 시스템
- 아파트의 무제한 수요 카운터: 일반 집과 다른 데이터 구조 필요
- 수요 배치 시 2배 로직

### 12.5 Lobbyist 도로 배치
- 인터랙티브 도로/공원 배치 UI 필요
- 공사 중 도로의 +1 거리 패널티 시각화
- Cleanup 시 자동 뒤집기 애니메이션
