# 시작하기

mineproj에 오신 것을 환영합니다! 이 가이드는 첫 번째 프로젝트 포트폴리오 사이트를 만드는 데 도움을 드립니다.

## 사전 요구사항

- **Node.js** 22 이상
- **pnpm** 10 (`npm install -g pnpm`으로 설치)

## 새 사이트 만들기

가장 빠른 시작 방법은 스캐폴딩 도구를 사용하는 것입니다:

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

브라우저에서 `http://localhost:5173`을 열어 사이트를 확인하세요.

## 프로젝트 구조

```
my-portfolio/
├─ mineproj.config.ts      # 사이트 설정
├─ data/
│  ├─ projects/             # 프로젝트 데이터 (JSON + Markdown)
│  │  └─ my-project/
│  │     ├─ index.json      # 프로젝트 메타데이터
│  │     └─ body.md         # 프로젝트 본문 내용
│  ├─ profile.json          # 프로필 정보
│  └─ tags.json             # 태그 정의
├─ public/                  # 정적 에셋 (이미지, PDF 등)
└─ dist/                    # 빌드 출력 (생성됨)
```

## 프로젝트 추가하기

`data/projects/` 아래에 새 디렉터리를 생성하세요:

```bash
mineproj new my-project
```

위 명령은 `data/projects/my-project/index.json`과 `data/projects/my-project/body.md`를 생성합니다. JSON 파일을 편집하여 프로젝트의 메타데이터를 설정하세요.

## 프로덕션 빌드

```bash
pnpm build
```

출력은 `dist/`에 생성됩니다. 로컬에서 미리보기:

```bash
pnpm preview
```

## 다음 단계

- [설정 가이드](./configuration) — 전체 설정 참조
- [데이터 모델](./data-model) — 프로젝트 스키마 이해하기
- [테마 개발](./theme-development) — 룩앤필 커스터마이징
- [플러그인 개발](./plugin-development) — 기능 확장
- [배포](./deploying) — 사이트를 프로덕션에 배포
