# 플러그인 라이프사이클 훅

이 페이지는 각 라이프사이클 훅을 자세히 설명합니다.

## `config:resolved` (waterfall)

설정이 완전히 해석된 후 호출됩니다. 설정 객체를 받아 수정할 수 있습니다.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modified)';
  return config;
}
```

## `data:loaded` (seq)

모든 데이터가 로드된 후 호출됩니다. 인자는 없지만 컨텍스트에 전체 데이터셋이 있습니다.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Loaded ${dataset.projects.length} projects`);
}
```

## `data:validated` (seq)

데이터 검증 후 호출됩니다. 커스텀 검증 로직에 사용하세요.

```ts
'data:validated': async (_, ctx) => {
  // Custom validation
}
```

## `assets:process` (seq)

에셋 처리 전에 호출됩니다. 에셋을 수정하거나 복사하는 데 사용하세요.

```ts
'assets:process': async (_, ctx) => {
  // Process assets
}
```

## `routes:collect` (waterfall)

경로 수집 중에 호출됩니다. 경로를 추가, 제거 또는 수정할 수 있습니다.

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/custom/',
    layout: 'detail',
    title: 'Custom Page',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

API 엔드포인트 생성 전에 호출됩니다. 커스텀 엔드포인트를 추가할 수 있습니다.

```ts
'api:endpoints': async (endpoints) => {
  endpoints.push({
    path: 'custom.json',
    generate: async (ctx) => ({ data: 'custom' }),
  });
  return endpoints;
}
```

## `render:before` (waterfall)

각 페이지가 렌더링되기 전에 호출됩니다. HTML 문자열을 받아 수정할 수 있습니다. `<head>`에 콘텐츠를 삽입하는 주요 훅입니다.

```ts
'render:before': async (html, ctx) => {
  const { route } = ctx;
  return html.replace(
    '</head>',
    `<meta name="custom" content="${route.slug}">\n</head>`
  );
}
```

## `emit` (seq)

내보내기 단계 중에 호출됩니다. 추가 파일을 출력 디렉터리에 작성하는 데 사용하세요.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

빌드 완료 후 호출됩니다. 정리, 알림 또는 보고에 사용하세요.

```ts
'build:done': async () => {
  console.log('Build finished!');
}
```
