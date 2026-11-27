# 🚀 사주팩트 (SajuFact) 프로덕션 배포 가이드

## 1. 사전 준비된 배포 구성 파일
- `vercel.json`: 서울 리전(`icn1`) 고정, `/api/analyze` 실행 시간 30초 설정, 보안 HTTP 헤더 적용
- `.env.example`: Vercel 환경변수 등록용 템플릿
- `supabase/schema.sql`: 리포트 캐싱 및 결제 내역 테이블 + RLS 정책
- `src/app/api/health/route.ts`: 배포 상태 및 환경변수 연결 점검용 (`GET /api/health`)
- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`: `sajufact.kr` SEO 및 PWA 매니페스트

---

## 2. Vercel 원클릭 배포 절차

### 방법 A: GitHub 연동 (추천 · 자동 배포)
1. GitHub에 새 레포지토리(`sajufact`)를 생성합니다.
2. 로컬에서 원격 저장소를 연결하고 푸시합니다:
   ```bash
   git remote add origin https://github.com/<내계정>/sajufact.git
   git push -u origin main
   ```
3. [Vercel 대시보드](https://vercel.com/new)에서 `sajufact` 레포지토리를 Import합니다.
4. **Environment Variables**에 `.env.example`의 값들을 등록합니다:
   - `NEXT_PUBLIC_SITE_URL` = `https://sajufact.kr`
   - `GEMINI_API_KEY` = *(선택: 입력 시 Gemini AI 문구 고도화 활성화)*
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_PORTONE_STORE_ID`, `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`
5. **Deploy** 클릭 후 `https://sajufact.kr/api/health` 접속으로 상태를 확인합니다.

### 방법 B: Vercel CLI 직접 배포
```bash
npx vercel login
npm.cmd run deploy:prod
```

---

## 3. 도메인(`sajufact.kr`) DNS 연결
Vercel 프로젝트 → **Settings → Domains**에 `sajufact.kr` 및 `www.sajufact.kr` 추가 후 도메인 등록기관 DNS에 아래 레코드를 입력합니다:
- **A 레코드 (`@`):** `76.76.21.21`
- **CNAME 레코드 (`www`):** `cname.vercel-dns.com`

---

## 4. Supabase DB 초기화
1. Supabase 프로젝트 생성 후 좌측 **SQL Editor**로 이동합니다.
2. `supabase/schema.sql` 파일 내용을 붙여넣고 **Run**을 실행합니다.
