# Food Chain Magnate Web - Game Spec Document

## Context
Food Chain Magnate (FCM) 보드게임을 온라인 멀티플레이어 웹 게임으로 구현하기 위한 스펙 문서.
Revised Deluxe Edition 룰북 (revised_original.pdf) 기반.

---

## 1. 게임 개요

- **플레이어 수**: 2~5명
- **목표**: 게임 종료 시 가장 많은 현금을 보유한 플레이어 승리
- **종료 조건**: 은행이 2번 파산 (bank breaks twice)
- **핵심 메커니즘**: 카드 기반 인력 관리, 가변 도시 맵, 마케팅/생산/판매 경쟁

---

## 2. 게임 셋업

### 2.1 맵 구성

| 플레이어 수 | 맵 크기 | 시작 은행 | Unique 직원 수 | 제거할 빌보드 |
|-----------|--------|---------|-------------|-----------|
| 2 | 3x3 타일 | $100 | 각 타입 1장 | #12, #15, #16 |
| 3 | 3x4 타일 | $150 | 각 타입 1장 | #15, #16 |
| 4 | 4x4 타일 | $200 | 각 타입 2장 | #16 |
| 5 | 4x5 타일 | $250 | 전부 사용 | 없음 |

- 20개의 맵 타일 중 필요한 만큼 랜덤 배치, 각 타일 방향도 랜덤
- 타일에는 도로(roads), 위치(locations), 빈 칸(empty squares), 다리(bridges) 포함
- 도로 연결이 안 맞아도 상관없음

### 2.2 맵 타일 요소
- **도로(Road)**: 위치들을 연결. 인접한 타일의 도로가 직교로 맞닿으면 하나의 연속 도로
- **빈 칸(Empty Square)**: 레스토랑, 집, 캠페인 토큰 등을 배치할 수 있는 공간
- **다리(Bridge)**: 2개의 도로가 같은 칸을 통과하되 연결되지 않음
- **위치(Location)**: 레스토랑, 집, 음료 공급처, 마케팅 캠페인 등

### 2.3 Supply 배치
- **집 공급**: 집+정원 콤보 토큰 8개
- **정원 토큰**: 8개
- **캠페인 토큰**: 빌보드, 우편함, 비행기, 라디오 타워 + Busy 마커 16개
- **음식/음료 토큰**: 버거, 피자, 소다, 레모네이드, 맥주 각 40개
- **은행**: 플레이어당 $50 (나머지는 별도 보관)
- **냉동고 타일**: 플레이어당 1개

### 2.4 플레이어 셋업
각 플레이어가 받는 것:
- 메뉴 1개
- 마일스톤 보드 1개
- CEO 카드 1장 (10종 중 택 1)
- 턴 순서 마커 1개
- 레스토랑 토큰 3개
- 드라이브인 토큰 3개
- 은행 준비금 카드 3장 ($100, $200, $300) → 비밀리에 1장 선택, 나머지 반환

### 2.5 시작 레스토랑 배치
- 턴 순서의 **마지막** 플레이어부터 **역순**으로 배치
- 배치 또는 패스 가능
- 패스한 플레이어는 나중에 턴 순서대로 배치

**레스토랑 배치 규칙:**
- 4칸의 빈 칸을 차지 (2x2)
- Entrance Corner가 1개 이상의 도로에 인접해야 함
- 다른 레스토랑의 Entrance Corner와 같은 맵 타일에 있으면 안 됨 (셋업 시에만)

---

## 3. 직원 시스템

### 3.1 직원 카드 속성
- **Entry-Level 아이콘**: 직접 고용 가능 여부
- **Action**: 플레이 시 수행하는 행동
- **Range**: 레스토랑에서 맵 상 행동할 수 있는 최대 거리 (도로/공중)
- **Training Options**: 승급 가능한 상위 직원 타입
- **Work Slots**: 하위에 배치할 수 있는 직원 수 (매니저만)
- **Unique 아이콘**: 회사 내 1명만 보유 가능
- **Salary 아이콘**: 매 라운드 $5 급여 지급 필요

### 3.2 직원 타입 및 트레이닝 경로

#### 매니저 계열 (Management Trainee에서 시작)
```
Management Trainee → Junior Vice President → Vice President → Senior Vice President → Executive Vice President
                   → Recruiting Manager → HR Director
                   → Coach → Guru
                   → Local Manager → Regional Manager
                   → New Business Developer
                   → Discount Manager → Luxuries Manager
                   → Pricing Manager
                   → Waitress
                   → CFO (First to Have $100 마일스톤으로만 획득)
```

#### 마케팅 계열
```
Marketing Trainee → Campaign Manager → Brand Manager → Brand Director
```

#### 주방 계열
```
Kitchen Trainee → Burger Cook → Burger Chef
               → Pizza Cook → Pizza Chef
```

#### 음료 수집 계열
```
Errand Boy → Cart Operator → Truck Driver → Zeppelin Pilot
```

### 3.3 직원 상세

| 카테고리 | 직원명 | Entry | Salary | Range | Slots | Action |
|--------|-------|-------|--------|-------|-------|--------|
| **CEO** | Chief Executive Officer | - | No | - | 3 | 1 Hire action |
| **매니저** | Management Trainee | Yes | No | - | 1 | - |
| | Junior Vice President | No | Yes | - | 2 | - |
| | Vice President | No | Yes | - | 3 | - |
| | Senior Vice President | No | Yes | - | 2 | - |
| | Executive Vice President | No | Yes | - | 1 | - |
| **리크루터** | Recruiting Girl | Yes | No | - | 0 | Hire 1 |
| | Recruiting Manager | No | Yes | - | 0 | (Hire 1 or $5 discount) x2 |
| | HR Director | No | Yes | - | 0 | (Hire 1 or $5 discount) x4 |
| **트레이너** | Trainer | Yes | No | - | 0 | Train 1 |
| | Coach | No | Yes | - | 0 | Train 2 |
| | Guru | No | Yes | - | 0 | Train 3 (same employee 가능) |
| **기획** | Local Manager | No | Yes | Road 3 | 0 | Drive-In 배치 + 레스토랑 신규 배치 (Coming Soon) |
| | Regional Manager | No | Yes | Unlimited | 0 | Drive-In 배치 + 레스토랑 배치/이동 (즉시 Open) |
| **마케팅** | Marketing Trainee | Yes | No | Road 2 | 0 | 빌보드 캠페인 (최대 2라운드) |
| | Campaign Manager | No | Yes | Road 3 | 0 | 우편함/빌보드 (최대 3라운드) |
| | Brand Manager | No | Yes | Road 4 | 0 | 비행기/우편함/빌보드 (최대 4라운드) |
| | Brand Director | No | Yes | Road 5 / Unlimited | 0 | 라디오/비행기/우편함/빌보드 (최대 5라운드) |
| **가격** | Pricing Manager | No | Yes | - | 0 | 아이템 가격 -$1 |
| | Discount Manager | No | Yes | - | 0 | 아이템 가격 -$3 |
| | Luxuries Manager | No | Yes | - | 0 | 아이템 가격 +$10 |
| **주방** | Kitchen Trainee | Yes | No | - | 0 | 버거 1개 또는 피자 1개 생산 |
| | Burger Cook | No | Yes | - | 0 | 버거 3개 생산 |
| | Burger Chef | No | Yes | - | 0 | 버거 8개 생산 |
| | Pizza Cook | No | Yes | - | 0 | 피자 3개 생산 |
| | Pizza Chef | No | Yes | - | 0 | 피자 8개 생산 |
| **음료** | Errand Boy | Yes | No | - | 0 | 아무 음료 1개 수집 (공급처 불필요) |
| | Cart Operator | No | Yes | Road | 0 | 도로 경로, 공급처당 음료 2개 |
| | Truck Driver | No | Yes | Road | 0 | 도로 경로, 공급처당 음료 3개 |
| | Zeppelin Pilot | No | Yes | Air | 0 | 공중 경로, 진입 타일 공급처당 음료 2개 |
| **기타** | Waitress | No | Yes | - | 0 | 디너타임 종료 시 $3 보너스 ($5 with 마일스톤) |
| | New Business Developer | No | Yes | Unlimited | 0 | 집+정원 배치 또는 정원 추가 |
| | CFO | No | Yes | - | 0 | 디너타임 수입의 50% 보너스 |

---

## 4. 회사 구조 (Company Structure)

### 4.1 구조 규칙
- CEO가 최상단, 피라미드 형태
- CEO는 3개의 Work Slot 보유 (은행 파산 후 변경 가능: 2~4개)
- 각 Work Slot에 직원 1명 배치
- 매니저는 자신의 Work Slot 수만큼 하위 직원 배치 가능
- 슬롯이 있는 직원만 하위에 직원을 둘 수 있음 (매니저 계열)
- 빈 Work Slot 허용됨 (턴 순서에 영향)

### 4.2 Restructuring (구조조정)
- 매 라운드 시작 시, 손에서 플레이할 직원 선택
- 나머지는 "On the Beach" (CEO 위에 뒤집어 놓음)
- **동시 진행**: 모든 플레이어가 동시에 선택 후 공개
- Beach 직원: Train 가능, Salary 지불 필수, Action 없음, 마일스톤 트리거 안 됨

---

## 5. 거리 계산

### 5.1 도로 거리 (Road Distance)
- 레스토랑 Entrance Corner에서 출발
- 연결된 도로를 따라 이동
- **맵 타일 경계를 넘는 횟수** = 거리
- 같은 타일 내 이동은 거리 0

### 5.2 공중 거리 (Air Distance)
- 도로 무시, 직교 인접 맵 타일로 이동
- **맵 타일 경계를 넘는 횟수** = 거리

### 5.3 Range
- 직원 카드 우상단의 숫자
- 경로가 타일 경계를 넘을 수 있는 **최대 횟수**
- Road Range와 Air Range 동일 규칙

### 5.4 도로 연결 규칙
- 레스토랑: Entrance Corner에 직교 인접한 도로에만 연결
- 기타 위치: 차지하는 칸이 도로에 직교 인접하면 연결
- 정원은 집의 일부로 취급
- 같은 연속 도로에 연결된 2개 위치는 거리에 상관없이 "도로로 연결됨"
- 다리에서는 도로가 교차하지만 연결되지 않음

### 5.5 Backtracking
- 도로 경로 추적 시 이전에 지나간 도로 구간을 다시 지날 수 있음
- 단, 직전에 지나온 도로 칸으로 바로 되돌아갈 수 없음

---

## 6. 라운드 진행 (7 Phases)

### Phase 1: Restructuring (구조조정) — 동시 진행
1. 손에서 이번 라운드에 플레이할 직원을 선택, CEO 아래 뒤집어 놓음
2. 나머지 직원을 CEO 위에 뒤집어 놓음 (On the Beach)
3. 모든 플레이어 동시 공개
4. 플레이한 직원을 CEO 아래 Work Slot에 배치 (합법적 피라미드 구조)
5. 배치 불가능한 직원은 강제로 On the Beach
6. **구조조정 마일스톤 확인**: "First Waitress Played" 등

### Phase 2: Order of Business (턴 순서 결정)
1. 이전 턴 순서를 트랙 아래로 이동 (순서 유지)
2. **Open Work Slot이 가장 많은** 플레이어가 먼저 턴 순서 위치 선택
3. 동률 시: 이전 턴 순서가 앞선 플레이어가 먼저 (1라운드: 랜덤)
4. 플레이어 수보다 높은 턴 순서 위치는 선택 불가
5. "First Airplane Campaign" 마일스톤: Open Work Slot 계산 시 +2

### Phase 3: Working 9-5 (턴 순서대로 각자 행동)
턴 순서대로 한 명씩. 아래 순서로 모든 행동 수행:

#### 3a. Hire Employees (고용) — 선택적
- CEO: 1 Hire action
- Recruiting Girl: 1 Hire action 추가
- Recruiting Manager: 2 actions (각각 Hire 1명 또는 $5 salary discount)
- HR Director: 4 actions (각각 Hire 1명 또는 $5 salary discount)
- Entry-level 직원만 고용 가능 (supply에서)
- 고용된 직원은 On the Beach에 배치

#### 3b. Train Employees (훈련) — 선택적
- Trainer: 1 Train action
- Coach: 2 Train actions
- Guru: 3 Train actions (같은 직원에게 연속 사용 가능)
- On the Beach 직원만 훈련 가능
- 훈련 시: 원래 직원 → supply 반환, 새 타입 직원 → On the Beach
- 같은 턴에 2개의 다른 훈련 직원이 같은 대상을 훈련할 수 없음
  (단, "First to Pay $20 in Salaries" 마일스톤 보유 시 가능)
- Hire + Train을 조합하여 중간 카드가 supply에 없어도 연쇄 훈련 가능

#### 3c. Open Drive-Ins (드라이브인 개설) — **의무적**
- Local Manager 또는 Regional Manager가 있으면 반드시 수행
- 모든 열린 레스토랑에 Drive-In 표지판 배치
- Drive-In: 레스토랑이 4개 모서리 모두에서 입구를 가짐 (라운드 종료까지)

#### 3d. Launch Campaigns (캠페인 실행) — 선택적
- 플레이 중인 마케터 1명당 1개의 새 캠페인 실행 가능
- 캠페인 종류: 빌보드, 우편함, 비행기, 라디오 (마케터 등급에 따라)

**캠페인 배치 규칙:**
- 빌보드/라디오/우편함: 빈 칸에, 도로에 연결된 곳에 배치. 도로 이동 시 이동한 도로에 연결 필수
- 비행기: 맵 외곽 가장자리에 인접, 1/3/5칸 변이 맵 가장자리에 정렬. 다른 비행기와 겹치면 안 됨

**캠페인 실행:**
1. 캠페인 타입 선택 (supply에서)
2. 범위 내 배치
3. 음식/음료 아이템 1종 선택, 해당 아이템 카운터를 duration으로 배치 (최대 마케터 카드 명시 라운드)
4. 마케터를 Busy로 (회사 구조에서 제거, On the Beach 옆에 배치)
5. Busy 마커를 마케터 카드에 배치

**Busy 마케터:**
- Play/Train/Fire 불가 (단, 파산 시 강제 해고 가능)
- Salary 지불 필수 (First Billboard Campaign 마일스톤 시 무급)
- 캠페인은 도중 취소 불가, duration 소진까지 반드시 유지

#### 3e. Prep Food & Drinks (음식/음료 준비) — 선택적

**주방 직원 (생산):**
| 직원 | 생산량 |
|------|-------|
| Kitchen Trainee | 버거 1개 또는 피자 1개 |
| Burger Cook | 버거 3개 |
| Burger Chef | 버거 8개 |
| Pizza Cook | 피자 3개 |
| Pizza Chef | 피자 8개 |

**음료 수집:**
| 직원 | 수집 방식 |
|------|---------|
| Errand Boy | 아무 음료 1개 (공급처 불필요) |
| Cart Operator | 도로 경로, 공급처당 2개 |
| Truck Driver | 도로 경로, 공급처당 3개 |
| Zeppelin Pilot | 공중 경로, 진입 타일 공급처당 2개 (타일 재방문 불가) |

- "First Errand Boy Played" 마일스톤: Errand Boy 2개 수집, 기타 수집원 공급처당 +1
- "First Cart Operator Played" 마일스톤: Cart Operator/Truck Driver/Zeppelin +1 Range
- 각 공급처는 직원당 1회만 수집 가능 (다른 직원은 같은 공급처에서 수집 가능)
- 음료 종류: 소다(Soda), 레모네이드(Lemonade), 맥주(Beer)

**도로 경로 추적 규칙:**
- 레스토랑 Entrance Corner에서 시작
- 도로 칸을 따라 사각형 단위로 이동
- 경로에 직교 인접한 공급처에서 수집
- 직전 칸으로 되돌아갈 수 없음 (그 외 backtracking은 가능)
- Range = 타일 경계 넘는 최대 횟수

#### 3f. Place Houses & Gardens (집/정원 배치) — 선택적
- New Business Developer 1명당: 집+정원 콤보 배치 **또는** 기존 집에 정원 추가

**집+정원 콤보 배치:**
- 빈 칸에만 배치
- 최소 한 변이 도로에 직교 인접
- 번호는 아무거나 (남은 것 중)

**정원 추가:**
- 정원이 없는 기존 집에만 추가
- 빈 칸에만 배치
- 집+정원이 2x3 직사각형을 이루도록
- 정원은 1개의 집에만 귀속

**정원이 있는 집:**
- 수요 카운터 최대 5개 (기본 3개)
- 구매 시 아이템 가격 2배

#### 3g. Place or Move Restaurants (레스토랑 배치/이동) — 선택적

**Local Manager:**
- 새 레스토랑 배치 (Coming Soon 상태)
- 열린 레스토랑의 Entrance Corner에서 도로 Range 3 이내
- 빈 칸에만, 입구가 도로에 연결
- 새 레스토랑은 이동 경로에 사용한 도로에 연결 필수
- 라운드 종료 시 Open

**Regional Manager:**
- 새 Open 레스토랑 배치 (즉시 Open + Drive-In) — Unlimited Range
- **또는** 기존 레스토랑 이동 (Unlimited Range, Open 유지 + Drive-In)
- 빈 칸에만, 입구가 도로에 연결

**제한: 최대 3개 레스토랑**

### Phase 4: Dinnertime (저녁 식사) — 자동 해결, 플레이어 결정 없음

**처리 순서:** 가장 낮은 번호의 집부터 순서대로

**각 집에 대해:**
1. 수요 카운터가 없으면 → 집에 머무름
2. 수요가 있으면 → 연결된 열린 레스토랑 확인
3. 연결 조건: 도로로 연결 (거리 무관) + 해당 레스토랑 체인이 수요와 **정확히 일치하는** 재고 보유
4. 조건을 만족하는 레스토랑이 **1곳만** → 해당 레스토랑에서 식사
5. 조건을 만족하는 레스토랑이 **2곳 이상** → Competition (경쟁)
6. 조건을 만족하는 레스토랑이 **0곳** → 집에 머무름 (수요 카운터 유지)

**Competition (경쟁) 해결:**
1. **Item Price** 계산: 기본 $10 + 가격 modifier
2. **Distance** 계산: Entrance Corner에서 집까지 최소 타일 경계 넘기
3. **Effective Price** = Item Price + Distance (거리 1 = +$1)
4. 가장 낮은 Effective Price의 레스토랑 승리
5. **동점 시**: Waitress 수가 많은 쪽 (On the Beach 제외)
6. **또 동점 시**: 턴 순서가 앞선 쪽

**Item Price 계산:**
- 기본: $10
- Pricing Manager 1명당: -$1
- Discount Manager 1명당: -$3
- Luxuries Manager 보유 시: +$10
- "First to Lower Prices" 마일스톤: -$1 (영구)
- 모든 modifier는 **의무** 적용
- 회사 전체에 1개의 Item Price (모든 아이템 동일)

**판매 및 수금:**
1. 집의 수요 카운터 전부 제거
2. 재고에서 일치하는 아이템 세트 제거
3. 판매한 아이템 수 x Item Price = 기본 수입
4. 정원 있는 집: 총액 2배
5. "First Marketed" 마일스톤: 해당 타입 아이템당 +$5
6. CFO가 있으면 별도 pile에 수입 추적

**디너타임 종료 보너스:**
1. **Waitress**: 플레이 중인 Waitress 1명당 $3 (First Waitress Played 마일스톤 시 $5)
2. **CFO**: 이번 디너타임 총 수입의 50% (반올림) 보너스

**디너타임 마일스톤:**
- Pricing/Discount Manager 있으면 "First to Lower Prices" 체크
- 현금이 $20/$100에 도달하면 "First to Have $X" 체크

### Phase 5: Payday (급여 지급) — 동시 진행

**해고 (Firing) — 급여 지급 전:**
- 플레이 중, On the Beach, Busy 마케터 중 아무나 해고 가능
- Busy 마케터는 자발적 해고 불가 (파산 시만 가능)
- 해고된 직원은 supply로 반환

**급여 지급:**
- Salary 아이콘이 있는 모든 직원에게 $5씩 지급
- 대상: 플레이 중 + On the Beach + Busy 마케터
- 급여 할인 적용 (할인은 의무):
  - Recruiting Manager의 미사용 action당 -$5
  - HR Director의 미사용 action당 -$5
  - "First to Train an Employee" 마일스톤: -$15
- 총 급여가 $0 미만이 될 수 없음
- 현금 부족 시: 지불 가능할 때까지 salaried 직원 강제 해고

**Payday 마일스톤:**
- $20 이상 급여 지급 시 "First to Pay $20 or More in Salaries" 체크 (할인 후 실제 지급액 기준)

### Phase 6: Marketing (마케팅) — 자동 해결, 플레이어 결정 없음

캠페인 번호 순서대로 (낮은 번호부터) 처리:

**각 캠페인에 대해:**
1. 캠페인 Reach 내의 **각 집**에 해당 아이템의 수요 카운터 1개 배치
   - 집의 수요 카운터 최대: 3개 (정원 있으면 5개)
   - 이미 최대면 추가 불가 (기존 교체 불가)
2. Duration 카운터 1개 제거 (수요를 놓지 못해도 제거)
3. 마지막 duration 카운터 제거 시 → 캠페인 종료:
   - 토큰 supply로 반환
   - 마케터 On the Beach로 이동
   - Busy 마커 반환

**캠페인 Reach:**

| 캠페인 타입 | Reach 규칙 |
|----------|----------|
| 빌보드 (Billboard) | 직교 인접한 모든 집 (정원 포함). 크기가 클수록 더 많은 집에 인접 |
| 우편함 (Mailbox) | 직선으로 도달 가능한 집 — 도로와 맵 가장자리만 차단. 다리도 도로 교차와 같이 차단. 크기는 reach에 영향 없음 |
| 비행기 (Airplane) | Flyover zone (1/3/5행 또는 열) 내의 모든 집. 집이나 정원 일부만 걸쳐도 됨 |
| 라디오 (Radio) | 자신의 타일 + 주변 8개 타일 내 모든 집. 집이나 정원 일부만 걸쳐도 됨 |

**"First Radio Campaign" 마일스톤**: 라디오 캠페인이 각 집에 수요 2개 배치 (1개 대신)

**Eternal Campaigns ("First Billboard Campaign" 마일스톤):**
- 이후 모든 캠페인은 무한 지속, 맵에서 영구 유지
- Duration 카운터 1개만 배치 (매 마케팅 페이즈에 제거되지 않음)
- Busy 마케터는 영구적으로 Busy (Play/Train/Fire 불가, Salary 없음)

### Phase 7: Cleanup (정리)

1. **아이템 폐기**: 재고의 모든 미판매 아이템 supply로 반환
   - "First to Throw Away" 마일스톤 보유 시: 냉동고에 최대 10개 보관 가능
2. **직원 반환**: 모든 플레이 중, On the Beach 직원을 손으로 반환 (Busy 마케터는 유지)
3. **표지판 제거**: Coming Soon / Drive-In 표지판 제거. Coming Soon 레스토랑은 Open으로 전환
4. **마일스톤 말소**: 더 이상 획득 불가능한 마일스톤에 X 표시
5. **새 라운드 시작**

---

## 7. 마일스톤 시스템

- 18개의 마일스톤 (각각 최초 달성자만 획득)
- 같은 라운드에 여러 플레이어가 동시 달성 시 모두 획득
- 라운드 종료 시, 미획득 마일스톤에 X 표시
- 모든 마일스톤 효과는 **의무** (불리해도 적용)

| 마일스톤 | 조건 | 효과 |
|--------|-----|-----|
| First to Train an Employee | 직원 훈련 | 급여 -$15 (영구) |
| First to Hire 3 Employees in 1 Turn | 1턴에 3명 고용 | 즉시 Management Trainee 2명 추가 고용 |
| First to Pay $20+ in Salaries | Payday에서 $20+ 지급 | 같은 직원에 여러 Trainer/Coach/Guru 사용 가능 |
| First Waitress Played | Waitress 플레이 | Waitress당 +$2 → +$5 (라운드 종료 보너스) |
| First to Have $20 | 디너타임 종료 시 $20+ 보유 | 비공개 은행 준비금 카드 열람 가능 |
| First to Have $100 | 디너타임 종료 시 $100+ 보유 | CEO가 CFO 역할 겸임 (50% 보너스). 기존 CFO 보유 시 해고 필수 |
| First Errand Boy Played | Errand Boy 플레이 | Errand Boy 2개 수집, 기타 수집원 공급처당 +1 |
| First Cart Operator Played | Cart Operator 플레이 | Cart Operator/Truck Driver/Zeppelin +1 Range |
| First Burger Produced | 버거 생산 | 즉시 Burger Cook 획득 (없으면 무효) |
| First Pizza Produced | 피자 생산 | 즉시 Pizza Cook 획득 (없으면 무효) |
| First to Throw Away Food or Drink | Cleanup에서 아이템 폐기 | 냉동고 획득, 최대 10개 보관 |
| First to Lower Prices | Pricing/Discount Manager 플레이 | 아이템 가격 영구 -$1 |
| First Burger/Pizza/Drink Marketed | 해당 타입 캠페인 실행 | 해당 타입 판매 시 아이템당 +$5 |
| First Billboard Campaign | 빌보드 캠페인 실행 | 모든 캠페인 Eternal (무한 지속), 마케터 Salary 없음 |
| First Airplane Campaign | 비행기 캠페인 실행 | Order of Business에서 Open Work Slot +2 |
| First Radio Campaign | 라디오 캠페인 실행 | 라디오 캠페인이 집당 수요 2개 배치 |

---

## 8. 은행 파산 (Breaking the Bank)

### 첫 번째 파산
디너타임 중 은행 잔고가 $0이 되면:
1. 모든 플레이어의 은행 준비금 카드 공개
2. 카드 금액 합산하여 은행 충전
3. **CEO 슬롯 결정**: 가장 많이 나온 슬롯 수로 변경. 동수면 높은 쪽.
4. 미지급 금액 계속 지급

### 두 번째 파산
- 은행 충전 안 함
- 디너타임 나머지 수입은 IOU로 기록
- 디너타임 종료 후 즉시 게임 종료
- 이후 Phase (Payday, Marketing, Cleanup) 스킵

### 승리 조건
- 총 현금 (IOU 포함) 가장 많은 플레이어 승리
- 동점: 턴 순서 앞선 쪽 승리

---

## 9. 입문자용 게임 (Introductory Game)

첫 게임 권장 수정사항:
- 은행 준비금 카드 사용 안 함
- 마일스톤 사용 안 함
- 3종 음료 공급처가 모두 맵에 있도록 보장
- 플레이어당 $75로 은행 시작 ($50 대신)
- 급여 지급 안 함 (Payday 스킵)
- 첫 번째 은행 파산 시 게임 종료

---

## 10. 온라인 멀티플레이어 고려사항

### 10.1 동시 진행 Phase
- **Restructuring**: 모든 플레이어가 직원 배치 완료 → 동시 공개
- **Payday**: 모든 플레이어가 동시에 해고 결정 → 급여 지급

### 10.2 순차 진행 Phase
- **Order of Business**: 순서대로 턴 위치 선택
- **Working 9-5**: 턴 순서대로 각자 행동

### 10.3 자동 해결 Phase
- **Dinnertime**: 서버에서 자동 계산
- **Marketing**: 서버에서 자동 계산
- **Cleanup**: 서버에서 자동 처리 (단, 냉동고 보관 선택은 플레이어 입력 필요)

### 10.4 정보 공개 규칙
| 정보 | 공개 범위 |
|-----|---------|
| 플레이어 현금 | 공개 |
| 재고 (food/drink stock) | 공개 |
| 플레이 중인 직원 | 공개 |
| On the Beach 직원 (공개 후) | 공개 |
| 손에 있는 직원 (선택 전) | 비공개 |
| 뒤집은 스택 (Restructuring 중) | 비공개 |
| 은행 준비금 카드 | 비공개 (첫 파산 시 공개) |
| 은행 잔고 | 공개 |
| 맵 상 모든 요소 | 공개 |
| 마일스톤 상태 | 공개 |

### 10.5 타이머/턴 관리
- 동시 phase: 전원 준비 완료 시 진행 (타임아웃 설정 권장)
- 순차 phase: 턴 타이머 설정 권장
- 재접속 지원 필요 (게임 상태 서버 보관)
