# 06. 아키텍처

## 스택 확정

| 항목 | 선택 | 비채택 | 이유 |
|---|---|---|---|
| 프레임워크 | Next.js (App Router) | Vanilla, React CRA | SSG 지원, 파일 기반 라우팅 |
| 상태 관리 | useState + Context | Zustand, Redux | 외부 의존성 없음, localStorage 기반 개인앱에 충분 |
| 스타일링 | Tailwind CSS | CSS Modules, styled-components | 유틸리티 기반 빠른 개발, 디자인 토큰 매핑 용이 |
| 음식 DB | JSON 파일 내장 | 외부 API | 서버 불필요, 빠른 검색, 오프라인 동작 |
| 검색 | 단순 문자열 매칭 (includes) | fuse.js | JSON 내장 규모에서 충분, 의존성 최소화 |
| 데이터 저장 | localStorage | SQLite, 원격 DB | 요구사항 명시, 개인 사용 목적 |

## 폴더 구조

```
calorie-calculator-app/
├── docs/                          # 기획 문서
├── mockups/                       # 디자인 시안
├── src/
│   ├── app/
│   │   ├── layout.tsx             # 루트 레이아웃 (폰트, 메타, Tailwind)
│   │   ├── page.tsx               # 메인 대시보드 페이지
│   │   └── globals.css            # Tailwind directives + 커스텀 토큰
│   ├── components/
│   │   ├── CalorieRing.tsx        # 원형 링 차트 (SVG)
│   │   ├── CommentCard.tsx        # 한 줄 코멘트 카드
│   │   ├── StatCards.tsx          # 목표/섭취 통계 카드 2열
│   │   ├── QuickAddChips.tsx      # 빠른 추가 칩 버튼
│   │   ├── FoodList.tsx           # 오늘 먹은 음식 리스트
│   │   ├── RecommendSection.tsx   # 추천 음식 섹션
│   │   ├── AddFoodModal.tsx       # 음식 추가 모달 (검색 + 수동)
│   │   ├── ProfileSetup.tsx       # 프로필 입력 (TDEE 계산)
│   │   └── DaySummaryCard.tsx     # 하루 마감 요약 카드
│   ├── context/
│   │   └── CalorieContext.tsx      # 전역 상태 (프로필, 오늘 기록, 목표)
│   ├── data/
│   │   └── foods.json             # 한글 음식 DB (가상 데이터, 추후 교체)
│   ├── lib/
│   │   ├── tdee.ts                # TDEE 계산 함수
│   │   ├── storage.ts             # localStorage 읽기/쓰기/리셋 유틸
│   │   ├── search.ts              # 음식 검색 (문자열 매칭)
│   │   └── recommend.ts           # 남은 칼로리 기반 추천 로직
│   └── types/
│       └── index.ts               # 타입 정의
├── public/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 타입 스키마

```typescript
// types/index.ts

export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'      // 거의 안 움직임
  | 'light'          // 가벼운 활동
  | 'moderate'       // 보통 활동
  | 'active'         // 활발한 활동
  | 'very_active';   // 매우 활발

export interface UserProfile {
  height: number;       // cm
  weight: number;       // kg
  age: number;
  gender: Gender;
  activity: ActivityLevel;
  tdee: number;         // 자동 계산된 일일 권장 칼로리
}

export type HealthTag = 'good' | 'caution' | 'normal';

export interface FoodItem {
  id: string;
  name: string;         // 한글 음식명
  calories: number;     // kcal
  category: string;     // 면류, 밥류, 반찬류 등
  tag: HealthTag;
}

export interface FoodRecord {
  id: string;
  foodName: string;
  calories: number;
  tag: HealthTag;
  addedAt: string;      // ISO timestamp
  source: 'search' | 'manual' | 'quick';
}

export interface DailyData {
  date: string;         // YYYY-MM-DD
  targetCalories: number;
  records: FoodRecord[];
}

export interface DaySummary {
  date: string;
  targetCalories: number;
  totalCalories: number;
  foodCount: number;
  highestFood: string;
  achievementRate: number; // 0~100
}
```

## 상태 흐름

```
┌─────────────────────────────────────────────┐
│              CalorieContext                  │
│                                             │
│  profile: UserProfile | null                │
│  dailyData: DailyData                       │
│  yesterdaySummary: DaySummary | null         │
│                                             │
│  actions:                                   │
│    setProfile(p) ──→ localStorage 저장      │
│    addFood(f) ──→ records 추가 → localStorage│
│    removeFood(id) ──→ records 제거 → localStorage│
│                                             │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────────┐
    ▼          ▼              ▼
 page.tsx   Components    localStorage
    │          │              │
    │     상태 구독/액션      │
    │          │              │
    └──────────┘              │
               │              │
          앱 시작 시 ◄────────┘
          localStorage 읽기
          날짜 비교 → 다른 날이면:
            어제 요약 저장
            오늘 데이터 리셋
```

## 핵심 로직

### TDEE 계산 (Mifflin-St Jeor)
```
남성: BMR = 10 × 체중(kg) + 6.25 × 키(cm) - 5 × 나이 + 5
여성: BMR = 10 × 체중(kg) + 6.25 × 키(cm) - 5 × 나이 - 161
TDEE = BMR × 활동 계수
```

활동 계수: sedentary(1.2), light(1.375), moderate(1.55), active(1.725), very_active(1.9)

### 음식 검색
```
1. 입력 문자열로 foods.json 필터링 (name.includes)
2. 결과 있으면 → 리스트 표시
3. 결과 없으면 → 카테고리별 평균 칼로리 제안 (폴백)
```

### 음식 추천
```
1. 남은 칼로리 계산 = 목표 - 섭취 합계
2. foods.json에서 calories <= 남은칼로리 필터링
3. tag === 'good' 우선 정렬
4. 상위 5~8개 표시
```

### 일일 리셋
```
1. 앱 로드 시 localStorage의 date와 오늘 비교
2. 다르면:
   - 어제 데이터로 DaySummary 생성 → yesterdaySummary에 저장
   - dailyData를 오늘 날짜로 리셋
3. 같으면: 기존 데이터 로드
```

## 음식 DB (가상 데이터 구조)

`data/foods.json` — 약 100~150개 한글 음식 항목으로 초기 구성. 추후 실제 데이터로 교체.

```json
[
  { "id": "001", "name": "잡곡밥", "calories": 340, "category": "밥류", "tag": "good" },
  { "id": "002", "name": "흰쌀밥", "calories": 300, "category": "밥류", "tag": "normal" },
  { "id": "003", "name": "된장찌개", "calories": 120, "category": "찌개류", "tag": "good" },
  ...
]
```

카테고리: 밥류, 면류, 찌개류, 구이류, 반찬류, 빵/간식, 음료, 패스트푸드, 과일, 유제품 등
