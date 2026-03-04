# 🤖 맥북에 Antigravity 설치하기 (현재 프로젝트 환경 기준)

> **작성일**: 2026년 2월 13일  
> **대상**: MacBook Pro  
> **현재 프로젝트**: Vite + React + Zustand + Notion API + Ant Design

---

## 📋 목차
1. [Antigravity란?](#1-antigravity란)
2. [설치 전 준비사항](#2-설치-전-준비사항)
3. [Antigravity 설치](#3-antigravity-설치)
4. [프로젝트와 연동](#4-프로젝트와-연동)
5. [사용 방법](#5-사용-방법)
6. [유용한 팁](#6-유용한-팁)

---

## 1. Antigravity란?

**Antigravity**는 Google DeepMind에서 만든 AI 코딩 어시스턴트입니다.

### ✨ 주요 기능
- 코드 자동 완성 및 생성
- 버그 찾기 및 수정
- 코드 리팩토링
- 실시간 코드 설명
- 터미널 명령어 실행
- 파일 생성/수정/삭제

### 🎯 현재 프로젝트에서 할 수 있는 것
- React 컴포넌트 자동 생성
- Zustand 스토어 관리
- Ant Design UI 컴포넌트 추가
- Notion API 연동 코드 작성
- CSS 스타일링 자동화
- 버그 디버깅

---

## 2. 설치 전 준비사항

### ✅ 필수 프로그램 확인

맥북에 다음 프로그램들이 설치되어 있어야 합니다:

```bash
# 1. Homebrew 설치 확인
brew --version

# 2. Node.js 설치 확인
node --version
npm --version

# 3. Git 설치 확인
git --version
```

**설치되지 않았다면:**

```bash
# Homebrew 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# Git 설치
brew install git
```

---

## 3. Antigravity 설치

### 방법 1: VS Code Extension으로 설치 (추천) ⭐

#### 3-1. Visual Studio Code 설치

```bash
# Homebrew로 설치
brew install --cask visual-studio-code
```

또는 직접 다운로드:
```
https://code.visualstudio.com
→ "Download Mac Universal" 클릭
```

#### 3-2. Antigravity Extension 설치

```
1️⃣ VS Code 실행

2️⃣ 왼쪽 사이드바에서 Extensions 아이콘 클릭
   (또는 ⌘ + Shift + X)

3️⃣ 검색창에 "Antigravity" 입력

4️⃣ "Antigravity - AI Coding Assistant" 찾기

5️⃣ "Install" 버튼 클릭

6️⃣ 설치 완료 후 VS Code 재시작
```

#### 3-3. Antigravity 로그인

```
1️⃣ VS Code 하단 상태바에서 Antigravity 아이콘 클릭

2️⃣ "Sign in with Google" 선택

3️⃣ 브라우저에서 Google 계정으로 로그인

4️⃣ 권한 승인

5️⃣ VS Code로 돌아오면 로그인 완료!
```

### 방법 2: CLI로 설치

```bash
# npm으로 전역 설치
npm install -g @antigravity/cli

# 설치 확인
antigravity --version

# 로그인
antigravity login
```

---

## 4. 프로젝트와 연동

### 4-1. 프로젝트 폴더 열기

```
1️⃣ VS Code 실행

2️⃣ "파일" → "폴더 열기" (⌘ + O)

3️⃣ my-vite-app 폴더 선택

4️⃣ "열기" 클릭
```

### 4-2. 프로젝트 구조 인식시키기

Antigravity가 프로젝트를 이해할 수 있도록 설정:

```
1️⃣ VS Code에서 ⌘ + Shift + P (명령 팔레트)

2️⃣ "Antigravity: Index Workspace" 입력 및 선택

3️⃣ 인덱싱 완료 대기 (1-2분)
   → 하단 상태바에서 진행 상황 확인

4️⃣ "Indexing complete" 메시지 확인
```

### 4-3. 프로젝트 설정 파일 생성 (선택사항)

프로젝트 루트에 `.antigravity` 폴더 생성:

```bash
mkdir .antigravity
cd .antigravity
```

`config.json` 파일 생성:

```json
{
  "project": {
    "name": "Wedding Photography Reservation System",
    "type": "react-vite",
    "framework": "React 18",
    "stateManagement": "Zustand",
    "uiLibrary": "Ant Design",
    "apis": ["Notion API", "Kakao Map API"]
  },
  "preferences": {
    "language": "Korean",
    "codeStyle": "functional-components",
    "formatting": "prettier"
  }
}
```

---

## 5. 사용 방법

### 5-1. 기본 사용법

#### 💬 채팅으로 질문하기

```
1️⃣ VS Code에서 ⌘ + Shift + P

2️⃣ "Antigravity: Open Chat" 입력

3️⃣ 또는 단축키: ⌘ + Shift + A

4️⃣ 채팅창에 질문 입력
```

**예시 질문:**
```
- "Home.jsx 파일에서 버그 찾아줘"
- "새로운 예약 통계 페이지 만들어줘"
- "이 함수를 최적화해줘"
- "Ant Design Table 컴포넌트 추가해줘"
```

#### ✨ 인라인 코드 생성

```
1️⃣ 코드 파일 열기 (예: Home.jsx)

2️⃣ 원하는 위치에 커서 놓기

3️⃣ 주석으로 원하는 기능 작성:
   // TODO: 예약 삭제 기능 추가

4️⃣ ⌘ + Enter (또는 Tab)

5️⃣ Antigravity가 자동으로 코드 생성!
```

#### 🔍 코드 설명 듣기

```
1️⃣ 이해하고 싶은 코드 블록 선택

2️⃣ 마우스 우클릭

3️⃣ "Antigravity: Explain Code" 선택

4️⃣ 설명이 채팅창에 표시됨
```

### 5-2. 현재 프로젝트에서 유용한 명령어

#### React 컴포넌트 생성

```
💬 "예약 통계를 보여주는 StatisticsCard 컴포넌트 만들어줘"
💬 "Ant Design Modal을 사용한 예약 상세 보기 컴포넌트 만들어줘"
```

#### Zustand 스토어 관리

```
💬 "useReservationStore에 필터링 기능 추가해줘"
💬 "예약 통계를 계산하는 selector 만들어줘"
```

#### Notion API 연동

```
💬 "Notion에서 예약 데이터를 가져오는 함수 최적화해줘"
💬 "Notion 페이지 업데이트 에러 처리 추가해줘"
```

#### CSS 스타일링

```
💬 "Reservation.css에 다크모드 스타일 추가해줘"
💬 "반응형 디자인으로 수정해줘"
```

### 5-3. 터미널 명령어 실행

```
💬 "npm install dayjs 실행해줘"
💬 "개발 서버 실행해줘"
💬 "빌드 해줘"
```

Antigravity가 자동으로 터미널에서 명령어를 실행합니다!

---

## 6. 유용한 팁

### 🎯 효과적인 질문 방법

#### ✅ 좋은 질문 예시:

```
"Home.jsx의 handleSubmit 함수에서 예약 수정 시 
중복 생성되는 버그를 찾아서 수정해줘"

"Ant Design의 DatePicker를 사용해서 
날짜 범위 필터 기능을 추가해줘. 
현재 코드는 line 493-500에 있어"

"useReservationStore에 예약 검색 기능을 추가하고, 
Home.jsx에서 사용할 수 있게 해줘"
```

#### ❌ 피해야 할 질문:

```
"코드 고쳐줘" (무엇을 고칠지 불명확)
"버그 있어" (어디에 버그가 있는지 불명확)
"이거 해줘" (구체적이지 않음)
```

### 🔥 단축키 모음

| 기능 | 단축키 |
|------|--------|
| 채팅 열기 | ⌘ + Shift + A |
| 인라인 생성 | ⌘ + Enter |
| 코드 설명 | ⌘ + Shift + E |
| 리팩토링 제안 | ⌘ + Shift + R |
| 버그 찾기 | ⌘ + Shift + B |

### 💡 프로젝트별 설정

#### 한국어 우선 사용

```json
// .antigravity/config.json
{
  "preferences": {
    "language": "Korean",
    "responseStyle": "detailed"
  }
}
```

#### 코드 스타일 지정

```json
{
  "codeStyle": {
    "quotes": "single",
    "semicolons": false,
    "arrowParens": "avoid",
    "trailingComma": "none"
  }
}
```

### 🚀 고급 기능

#### 1. 파일 생성 자동화

```
💬 "src/components/Statistics 폴더를 만들고
    StatisticsCard.jsx 컴포넌트 파일을 생성해줘"
```

#### 2. 여러 파일 동시 수정

```
💬 "Home.jsx와 useReservationStore.js에서
    예약 필터링 기능을 추가해줘"
```

#### 3. 테스트 코드 생성

```
💬 "handleSubmit 함수에 대한 Jest 테스트 코드 만들어줘"
```

#### 4. 문서 자동 생성

```
💬 "useReservationStore의 모든 함수에 JSDoc 주석 추가해줘"
```

---

## 🎓 학습 리소스

### 공식 문서
- Antigravity 공식 문서: https://antigravity.dev/docs
- VS Code Extension 가이드: https://antigravity.dev/vscode

### 튜토리얼
- React 프로젝트 시작하기
- Zustand와 함께 사용하기
- API 연동 자동화

### 커뮤니티
- Discord: https://discord.gg/antigravity
- GitHub: https://github.com/antigravity

---

## ⚙️ 설정 최적화

### VS Code settings.json 추가 설정

```json
{
  "antigravity.enabled": true,
  "antigravity.autoComplete": true,
  "antigravity.inlineCompletion": true,
  "antigravity.language": "ko",
  "antigravity.model": "claude-4.5-sonnet",
  "antigravity.contextFiles": [
    "src/**/*.jsx",
    "src/**/*.js",
    "src/**/*.css"
  ]
}
```

### .gitignore 업데이트

```bash
# Antigravity
.antigravity/cache
.antigravity/logs
```

---

## 🔧 문제 해결

### ❌ "Antigravity를 찾을 수 없습니다"

```bash
# Extension 재설치
1. VS Code에서 Extensions 열기
2. Antigravity 검색
3. "Uninstall" → "Install"
4. VS Code 재시작
```

### ❌ "인덱싱이 완료되지 않습니다"

```bash
# 캐시 삭제 후 재인덱싱
rm -rf .antigravity/cache
⌘ + Shift + P → "Antigravity: Reindex Workspace"
```

### ❌ "응답이 느립니다"

```json
// .antigravity/config.json
{
  "performance": {
    "maxFileSize": "1MB",
    "excludePatterns": ["node_modules", "dist", "build"]
  }
}
```

---

## 📊 현재 프로젝트 구조 요약

Antigravity가 이해하는 프로젝트 구조:

```
my-vite-app/
├── src/
│   ├── pages/
│   │   └── Home.jsx          # 메인 예약 관리 페이지
│   ├── store/
│   │   └── zustand/
│   │       └── useReservationStore.js  # 상태 관리
│   ├── api/
│   │   └── notion.js         # Notion API 연동
│   └── styles/
│       └── Reservation.css   # 스타일
├── .env                      # 환경 변수
├── vite.config.js           # Vite 설정
└── package.json             # 의존성 관리
```

**주요 기술 스택:**
- ⚛️ React 18
- 🎨 Ant Design
- 🐻 Zustand
- 📝 Notion API
- 🗺️ Kakao Map API
- ⚡ Vite

---

## ✅ 설치 완료 체크리스트

```
✅ VS Code 설치 완료
✅ Antigravity Extension 설치 완료
✅ Google 계정으로 로그인 완료
✅ 프로젝트 폴더 열기 완료
✅ 워크스페이스 인덱싱 완료
✅ 첫 번째 질문 테스트 완료
✅ 코드 생성 테스트 완료
```

---

## 🎉 시작하기

이제 Antigravity를 사용할 준비가 완료되었습니다!

**첫 번째 명령어 시도해보기:**

```
⌘ + Shift + A (채팅 열기)

💬 "안녕! 현재 프로젝트 구조를 분석해줘"
💬 "Home.jsx 파일의 주요 기능을 설명해줘"
💬 "예약 시스템에 추가하면 좋을 기능을 추천해줘"
```

---

**작성자**: Antigravity AI  
**버전**: 1.0  
**최종 수정**: 2026년 2월 13일

**💡 팁**: 이 가이드를 북마크해두고 필요할 때마다 참고하세요!
