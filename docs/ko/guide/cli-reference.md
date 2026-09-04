# CLI 참조

`mineproj` CLI는 사이트 구축, 개발 및 관리를 위한 모든 명령을 제공합니다.

## 사용법

```bash
mineproj <command> [options]
```

## 명령어

### `dev`

개발 서버를 시작합니다.

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

정적 사이트를 빌드합니다.

```bash
mineproj build [--outDir <dir>]
```

### `preview`

빌드된 사이트를 미리 봅니다.

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

설정 및 데이터 파일을 검증합니다.

```bash
mineproj check [--i18n]
```

### `new <slug>`

새 프로젝트 스켈레톤을 생성합니다.

```bash
mineproj new my-project
```

### `audit`

빌드된 사이트를 SEO, AI, a11y 및 성능에 대해 평가합니다.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

환경, 설정 및 프로젝트 상태를 진단합니다.

```bash
mineproj doctor
```

### `info`

해석된 설정, 테마 및 플러그인 진단 정보를 표시합니다.

```bash
mineproj info
```

### `theme:eject`

현재 테마를 커스터마이징을 위해 `.mineproj/theme/`로 복사합니다.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

새 로케일을 스캐폴딩합니다.

```bash
mineproj i18n:init en
```

### `i18n:extract`

로케일별로 번역되지 않은 키를 추출합니다.

```bash
mineproj i18n:extract
```

### `editor:export`

편집기 초안을 JSON 패치로 내보냅니다.

```bash
mineproj editor:export
```

### `migrate`

스키마 버전 마이그레이션 및 백업을 수행합니다.

```bash
mineproj migrate
```

## 글로벌 옵션

| 옵션 | 설명 |
|--------|-------------|
| `--root <dir>` | 사이트 루트 디렉터리 |
| `--config <path>` | 명시적 설정 파일 경로 |
| `--outDir <dir>` | 출력 디렉터리 재정의 |
| `--port <n>` | 개발/미리보기 서버 포트 |
| `--host <host>` | 개발/미리보기 서버 호스트 |
| `--open` | 시작 후 브라우저 열기 |
| `--editor` | 비주얼 편집기 활성화 (개발 모드 전용) |
| `--fail-under <n>` | 최소 감사 점수 (기본값 85) |
| `-h, --help` | 도움말 표시 |
| `-v, --version` | 버전 표시 |
