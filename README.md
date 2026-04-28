# 🎓 SSN LMS Platform Modernization

> **레거시 PHP(Gnuboard) 기반의 B2B/B2C 교육 플랫폼을 React와 Django를 활용한 최신 SPA(Single Page Application) 아키텍처로 전면 개편한 프로젝트입니다.**

## 📌 프로젝트 개요
- **프로젝트 명:** SSN 온라인 학습 관리 시스템(LMS) 고도화 및 마이그레이션
- **진행 기간:** 2026.03 ~ 2026.04 (진행 중)
- **개발 인원:** 프론트엔드 및 백엔드 1인 (풀스택)
- **주요 목표:**
  1. 기존 서버 사이드 렌더링(PHP)의 느린 화면 전환을 **React SPA로 개선하여 사용자 경험(UX) 극대화**
  2. 복잡하게 얽혀있던 결제 로직을 **장바구니 ➡️ 주문서 ➡️ 결제 ➡️ 수강권(Enrollment)** 형태의 확장 가능한 데이터베이스로 재설계
  3. 시청 이력, 진도율 추적 등 데이터 신뢰성이 필수적인 **Video Player Engine의 자체 구축**

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Core:** React 18, TypeScript, Vite
- **Routing & State:** React Router DOM
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
- **Network:** Axios (with Interceptors for JWT auth)

### Backend
- **Core:** Python 3.12, Django 5.x, Django REST Framework (DRF)
- **Database:** MariaDB (MySQL)
- **Authentication:** JWT (JSON Web Tokens)
- **Payment Gateway:** PortOne (포트원) 결제 API 연동

---

## ✨ 핵심 기능 (Core Features)

### 1. 🛒 커머스 및 수강 관리 엔진 (Commerce Engine)
- **장바구니 로직 방어:** 이미 수강 중이거나 장바구니에 있는 강좌 중복 담기 방지 로직 구현.
- **결제 위변조 검증:** 프론트엔드에서 결제 완료 후, 백엔드에서 포트원 API를 통해 **실제 결제 금액과 장바구니 금액을 서버 단에서 2차 크로스 체크(Cross-check)** 하여 보안 강화.
- **다형성 수강권 부여:** 0원 무료 강좌의 경우 PG사를 거치지 않고 즉시 Bypass 승인 처리하는 로직 분리 구현.

### 2. 📺 반응형 학습 플레이어 및 진도율 동기화 (Smart Video Player)
- **몰입형 UI:** 학습 시 집중도를 높이기 위해 GNB/Footer를 제거한 전체 화면 Blank Layout 라우팅 분리.
- **실시간 진도율 추적 (Ping):** 동영상 시청 시 브라우저 부하를 줄이기 위해 `onTimeUpdate` 이벤트를 최적화하여 **주기적(10초)으로 서버에 시청 위치(초)와 퍼센티지를 동기화**.
- **이어보기 (Resume) 기능:** 서버에 저장된 `last_position`을 가져와 `video.currentTime`에 즉시 할당하여, 브라우저 종료 후 재접속 시 시청하던 곳부터 시작.
- **시청 이력 데이터 로깅:** 단순 진도율(Snapshot) 외에, 시청할 때마다 접속 기기 정보(User Agent)와 이벤트 시간을 `learning_logs` 테이블에 기록하여 B2B 기업 감사(Audit) 자료로 활용.

---

## 💡 트러블 슈팅 (Trouble Shooting)

### 🚨 Issue 1: 비디오 플레이어 진도율 99.7% 멈춤 현상 (소수점 오차)
- **문제 상황:** 영상을 끝까지 시청했음에도 백엔드 DB에는 `progress_rate`가 100%가 아닌 99.7% 또는 99.8%로 저장되어 수강생이 완강(수료) 인정을 받지 못하는 크리티컬 이슈 발생.
- **원인 분석:** HTML5 `<video>` 태그의 `timeupdate` 이벤트는 프레임 단위로 발생하며, 영상이 끝나는 정확한 정수(e.g., 10.0초) 시점에 맞춰 이벤트를 쏴주지 않음. (예: 9.97초에서 이벤트가 발생하고 영상이 종료됨)
- **해결 방안:** 
  1. `onEnded` 이벤트를 비디오 태그에 추가로 바인딩하여, 영상이 자연 종료될 경우 앞선 Ping 주기와 관계없이 **강제로 100.0%의 진도율과 완강 True 플래그를 백엔드에 즉시 전송**하도록 설계.
  2. 프론트엔드 연산 시 `99.5%`를 넘어가면 소수점 오차로 간주하고 `100.0%`로 반올림 보정하는 방어 로직 추가.

### 🚨 Issue 2: HTTP 혼합 콘텐츠(Mixed Content) 차단 이슈
- **문제 상황:** 로컬 테스트 환경에서는 재생되던 영상이, 서버 배포 후 크롬 브라우저에서 까만 화면만 표출되며 재생 불가 상태에 빠짐.
- **원인 분석:** 보안이 강화된 최신 브라우저 정책 상, HTTPS 환경에서 서빙되는 페이지 내에서 HTTP 프로토콜의 영상 소스를 로드하려 하면 Mixed Content로 차단함. 추가로 구글 클라우드 스토리지 영상의 403 Forbidden 권한 문제가 겹침.
- **해결 방안:** 프론트엔드에서 영상 렌더링 전 정규식을 통해 `http://` 경로를 `https://`로 강제 치환하고, 테스트 영상을 안정성이 보장된 CDN(W3Schools 표준 샘플)으로 일괄 DB 마이그레이션 진행.

---

## ⚙️ 로컬 실행 방법 (How to Run)

### Backend (Django)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate # Windows
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python seed_sessions.py # 테스트 데이터 주입
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

> **Note:** `.env` 파일에 포트원(PortOne) API Key 및 DB 정보 설정이 필요합니다.
